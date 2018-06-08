/* LRC.js : LRC文件解析 */
// import { get, ajax } from '../util/request';
// import { LrcDocument } from './lrc-document';
import { Media } from '../media/media';
import { EventEmitter } from 'events';

var log: typeof console.log = (...args: any[]) => console.log.apply(console, args);

// @fires init, update, destroy, lrc_notfound
export class Lyric extends EventEmitter implements LyricEvents {
    enableCheck = false;
    private lrcDocument: Document<any>;

    constructor(private media: Media, private DocCtor: DocumentCtor, private getLyric?: () => Promise<string>) {
        super();
        if(!media) {
            throw new Error("Audio Element not specified.");
        }

        if(!getLyric) {
            //默认以音乐文件名为lrc文件名
            let _src = media.getUrl().split('.');
            _src[_src.length - 1] = this.DocCtor.extname;
            let src = _src.join('.');
            this.getLyric = () => fetch(src).then(res => res.text());
        }
        
        this.init()
        // audio.once('play', () => this.init());
        // audio.once('ended', () => this.destroy());
        
    }

    init(callback?: () => void) {
        console.log('Lyric init');

        var isLoadTimeouted = false;
        var loadTimeout = setTimeout(function() {
            isLoadTimeouted = true;
            callback && callback();
        }, 1800);
        
        // ajax().resType(this.DocCtor.responseType || 'text')
        // .get(this.src, 'action=download', (err, rawData, stat) => {
        this.getLyric().then(rawData => {
            console.log('Lyric opened');
            clearTimeout(loadTimeout);
            !isLoadTimeouted && callback && callback();
            // document.getElementById("nd-lyric").innerHTML = '';
            //console.log('lrc stat: ', stat)

            var lrcDocument = this.lrcDocument = new this.DocCtor(rawData);
            // var lrcLine = lrcDocument.lrcNodes;
            var timeLine = lrcDocument.getTimeLine();

            this.emit('init');

            // log("解析数据:", [lrcLine]);
            log("时间线", [timeLine]);

            /*滚动循环体*/
            var currentLine = '';
            var checker: () => void;
            var timer;
            var matchStartPoint = 0;
            this.enableCheck = true;
            (checker = () => {
                var now = this.media.getCurrentTime();
                var matchLines = timeLine.matchByTime(now, matchStartPoint);
                // console.log('matchStartPoint', matchStartPoint);
                
                // console.log(lrcNode.currentLine, currentLine)
                if(matchLines.toString() !== currentLine) {
                    //document.getElementById("nd-lyric").innerHTML = lrcNode.content 
                    currentLine = matchLines.toString();
                    //  FIXME: Randomly crash the checker when media seeked
                    // matchStartPoint = matchLines[matchLines.length - 1];
                    this.emit('update', matchLines, timeLine);
                    // log(timeLine[currentLine].data.content);
                }

                timer = this.enableCheck && setTimeout(checker, 5);
                if(!this.enableCheck) {
                    clearTimeout(timer);
                }
            })();

            this.media.on('seeked', (e: Event) => {
                matchStartPoint = 0;
                console.log('seeked');
            });
            
            //audio.on("timeupdate",checker);
            //timer=setInterval(checker,1);
            
        }).catch(err => {
            this.emit('lrc_notfound');
            // document.getElementById("nd-lyric").innerHTML = '找不到歌词';
            setTimeout(() => {
                // document.getElementById("nd-lyric").innerHTML = '';
            }, 2000);
            // return false;
        });
        
        
    }

    destroy() {
        if (this.enableCheck) {
            this.enableCheck = false;
            this.emit('destroy');
        }
    }

    addView<T>(view: ILyricViewer<T>) {
        this.on('init', () => view.init());
        this.on('update', (matches: any, timeLine: any) => view.update(matches, timeLine));
        this.on('destroy', () => view.destroy());
    }

    getDocumentInstance() {
        return this.lrcDocument;
    }

}

export interface LyricEvents {
    on(event: 'init', listener: () => any): EventEmitter;
    on(event: 'destroy', listener: () => any): EventEmitter;
    on(event: 'update', listener: (data: string, index?: number[]) => any): EventEmitter;
    on(event: string, listener: Function): EventEmitter;
}

export interface ILyricViewer<T> {
    init(t?: TimeLine<T>): any;
    update(matches: number[], timeLine: TimeLine<T>): any;
    destroy(): any;
}


// Timeline

export interface TimeNode<T> {
    time: number;
    content_id: number;
    data: T;
}

export interface TimeLine<T> extends Array<TimeNode<T>> {
    matchByTime(time: number, startPoint: number): number[];
}

function matchByTime(time: number, startPoint = 0): number[] {
    var timeLine: TimeLine<any> = this;
    var ret: number[] = [];

    // var center = Math.floor(timeLine.length / 2);

    for (var i = startPoint; i < timeLine.length; i++) {
        if(timeLine[i].time <= time && timeLine[i + 1].time > time) {
            // for (let e = i + 1; timeLine[e] && (timeLine[e].time === timeLine[i].time); e++) {
            //     ret.push(e);
            // }
            for (let e = i; timeLine[e] && (timeLine[e].time === timeLine[i].time); e--) {
                ret.push(e);
            }
            break;
        }
    }
    // console.log('查找次数', i - startPoint);
    return ret;
}

export function TimeLine<T>(): TimeLine<T> {
    var arr: any = [];
    arr.matchByTime = matchByTime;
    return arr;
}


// Ctor of lyric format

export interface Document<T> {
    getTimeLine(): TimeLine<T>;
}

export interface DocumentCtor {
    new (rawData: any): Document<any>;
    extname: string;
    responseType: string;
}