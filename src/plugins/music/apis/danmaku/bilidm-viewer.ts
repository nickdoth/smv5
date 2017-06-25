import { ILyricViewer, TimeLine } from '../music/Lyric';
import { Danmaku } from './bili-danmaku';
import { Media } from '../media/media';
import { EventEmitter } from 'events';

console.log(__dirname, __filename);

interface Rolling {
    node: HTMLSpanElement;
    pos: number;
    width: number;
    removed?: boolean;
}

interface RollingNode<D> {
    node: Danmaku;
    top: number;
    left: number;
    width: number;
    color: number[];
    fontSize: number;
    attachData?: D;
}


export class DanmakuViewer extends EventEmitter implements ILyricViewer<Danmaku> {

    /** */
    private canvas: HTMLCanvasElement;
    /** */
    private viewList: RollingNode<any>[] = [];
    /** */
    private rollingSpeed: number;
    /** */
    private _rollingDuration: number; // ms
    /** */
    defaultFontSize = 19;
    /** */
    get rollingDuration() {
        return this._rollingDuration;
    }
    set rollingDuration(val: number) {
        this._rollingDuration = val;
        this.rollingSpeed = document.body.offsetWidth / this._rollingDuration; // pixels per microsecond
    }



    constructor(private video: Media) {
        super();
        video.on('pause', () => { });
    }

    init() {
    	// Nothing
        this.canvas = document.createElement('canvas');
        this.canvas.width = document.body.offsetWidth;
        this.canvas.height = document.body.offsetHeight;

        window.addEventListener('resize', (e) => {
            this.canvas.width = document.body.offsetWidth;
            this.canvas.height = document.body.offsetHeight;
        })
        // this.canvas.style.zIndex = '499';
        // this.canvas.style.position = 'absolute';
        document.getElementById('danmaku-container').appendChild(this.canvas);

        this.rollingDuration = 4800;
        this.mainLoop();
    }

    update(matches: number[], timeLine: TimeLine<Danmaku>) {
        // console.log('matchesLength:', matches.length);
        for (let i = 0; i < matches.length; i++) {
            // console.log('%c' + readableTime(timeLine[matches[i]].time), 'color: #888;',
            //     timeLine[matches[i]].data.content);
            let dm = timeLine[matches[i]].data;
            let left = document.body.offsetWidth;

            this.viewList.push({
                node: dm,
                top: this.dTop(),
                left: left,
                width: -1,
                fontSize: this.defaultFontSize,
                color: color(dm.color)
            });
        }
    }

    destroy() {
    	
    }

    private row = 1;
    dTop() {
        let lineHeight = this.defaultFontSize * 2 + 2;
        let maxRow = 13;

        if (this.row > maxRow) {
            var top = lineHeight * (this.row++ - maxRow) + lineHeight / 2;
        }
        else {
            var top = lineHeight * this.row++;
        }
        
        if (this.row === maxRow * 2) this.row = 1;

        return top;
    }
    

    public recover() {
        this.emit('recover-request');
    }

    public suspend() {
        this.emit('suspend-request');
    }

    public suspendState(callback: Function) {
        this.emit('suspend-query', callback)
    }

    private mainLoop() {
        var cd = new DanmakuCanvas(this.canvas, true);
        // var cd = new DanmakuDOM();

        var isSuspended = false;
        this.on('suspend-request', () => {
            isSuspended = true;
            this.once('recover-request', () => {
                last = performance.now();
                isSuspended = false;
                requestAnimationFrame(handler);
            });
        });

        this.on('suspend-query', (cb: Function) => {
            cb(isSuspended);
        });


        this.video.on('pause', () => {
            this.suspend();
            this.video.once('play', () => this.recover());
        });

            

        // FPS相关调整
        var last = performance.now(),
            now = 0,
            mspf = 0; // microseconds per frame
        var fpsNode = <HTMLSpanElement> document.getElementById('play-area').appendChild(
            document.createElement('span'));
        fpsNode.style.top = fpsNode.style.right = '5px';
        fpsNode.style.zIndex = '500';

        var handler: FrameRequestCallback;
        requestAnimationFrame(handler = (time) => {
            if (isSuspended) {
                return;
            }

            // if (this.video.isPaused()) {
            //     this.video.once('play', () => {
            //         last = performance.now();
            //         requestAnimationFrame(handler);
            //     });
            //     return;
            // }

            
            now = performance.now();
            mspf = now - last;
            last = now;

            for (let i = 0; i < this.viewList.length; i++) {
                let n = this.viewList[i];

                // p/f = ms/f * p/ms;
                // n.left -= this.rollingSpeed * mspf; // pixels per frame
                
                // experimental: specified speed
                // if (!(<any>n).rollingSpeed && n.width > 0) {
                    (<any>n).rollingSpeed = (document.body.offsetWidth + n.width) /
                        this._rollingDuration;
                // }

                n.left -= (<any>n).rollingSpeed * mspf; // pixels per frame

                
                cd.updateState(n);

                if (n.width < 0) {
                    // cd.measureItemWidth(n);
                }

                if (n.left < 0 - n.width) {
                    cd.removeState(n);
                    this.viewList.splice(i--, 1);
                }
            }
            
            
            cd.render();
            requestAnimationFrame(handler);
            
        });

        setInterval(_ => {
            requestAnimationFrame(t => {
                fpsNode.innerHTML = (1000 / mspf).toFixed(1) + 'fps';
            });
        }, 400);
    }

}

function readableTime(sec: number) {
    let hh = Math.floor(sec / 3600);
    let mm = Math.floor(sec / 60 - hh * 60);
    let ss = Math.floor(sec - hh * 3600 - mm * 60);

    return `${hh}:${numFormat(mm)}:${numFormat(ss)}`;
}

function numFormat(n: number) {
    if (n < 10) {
        return `0${n}`;
    }
    else {
        return n.toString();
    }
}

function color(n: number) {
    var b = n & 0xff;
    n = n >> 8;
    var g = n & 0xff;
    var r = n >> 8;
    // return `rgb(${r},${g},${b})`;
    return [r, g, b];
}

function colorLightness(color: number[]) {
    var min = Math.min(...color);
    var max = Math.max(...color);
    return (min + max) / 2.0;
}

class DanmakuCanvas {
    bufferCanvas = document.createElement('canvas');
    bufferContext: CanvasRenderingContext2D;

    drawCanvas = document.createElement('canvas');
    drawContext: CanvasRenderingContext2D; 

    context: CanvasRenderingContext2D;

    constructor(public canvasElement: HTMLCanvasElement, private cacheDraw = false) {
        this.context = <any>canvasElement.getContext('2d');
        this.bufferCanvas.width = canvasElement.width;
        this.bufferCanvas.height = canvasElement.height;

        if (cacheDraw) {
            this.drawContext = <any>this.drawCanvas.getContext('2d');
            this.drawContext.textBaseline = 'top';
        }

        window.addEventListener('resize', (e) => {
            this.bufferCanvas.width = canvasElement.width;
            this.bufferCanvas.height = canvasElement.height;
        });

        this.bufferContext = <any>this.bufferCanvas.getContext('2d');
    }

    draw(text: string, x: number, y: number, color: number[], fontSize = 19) {
        var width = this.measureItemWidth(text);
        if (!this.cacheDraw) {
            var context = this.bufferContext;
        }
        else {
            this.drawCanvas.width = width * 2.5;
            this.drawCanvas.height = fontSize + 2;
            var dx = x, dy = y;
            x = 0, y = 1;
            this.drawContext.clearRect(0, 0, width * 2, fontSize + 2);
            var context = <CanvasRenderingContext2D> this.drawContext;
            // var context = <CanvasRenderingContext2D> this.drawCanvas.getContext('2d');
            // console.log(x, y);
        }
        // context.fillStyle = 'rgba(0,0,0,0)';
        // context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        context.textBaseline = 'top';
        context.font = `normal bold ${fontSize}px SimHei`;

        // Text outline
        if (colorLightness(color) > 120) {
            context.shadowColor = "#000000";
        }
        else {
            context.shadowColor = "#ffffff";
        }
        
        context.shadowBlur = 0;
        context.fillStyle = 'raba(0,0,0,0)';

        context.shadowOffsetX = -1;
        context.shadowOffsetY = 0;
        context.fillText(text, x, y);
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 1;
        context.fillText(text, x, y);
        context.shadowOffsetX = 1;
        context.shadowOffsetY = 0;
        context.fillText(text, x, y);
        context.shadowOffsetX = 0;
        context.shadowOffsetY = -1;
        context.fillText(text, x, y);
        context.fillText(text, x, y);

        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        // context.font = "normal bolder 16px SimSun";
        // context.fillStyle = '#000';
        // context.strokeText(text, x, y);

        // context.font = "normal bold 16px SimSun";
        context.fillStyle = `rgb(${color.join(',')})`;
        context.fillText(text, x, y);

        // re-calc
        width = context.measureText(text).width;

        if (this.cacheDraw) {
            this.bufferContext.drawImage(this.drawCanvas, dx, dy);
            let imgData: ImageData;
            try {
                imgData = context.getImageData(0, 0, width, fontSize + 2);
                // return {
                //     pattern: this.bufferContext.createPattern(context.canvas, 'no-repeat'),
                //     w: context.canvas.width,
                //     h: context.canvas.height
                // };
            }
            catch (e) {
                console.error('error danmaku:', text);
                // imgData = new (<any>ImageData)(1, 1);
            }
            finally {
                return imgData;
            }
        }
    }

    drawImg(imgData: ImageData, x: number, y: number) {
        // 1. putImageData (good, but no alpha filling)
        this.bufferContext.putImageData(imgData, x, y);

        // 2. fill with CanvasPattern (very slow)
        // this.bufferContext.fillStyle = imgData.pattern;
        // this.bufferContext.fillRect(x, y, imgData.w, imgData.h);

        // 3. self-implemented function (slow and awful)
        // putImageDataWithAlpha(this.bufferContext, imgData, x, y);
    }

    measureItemWidth(text: string) {
        return this.bufferContext.measureText(text).width;
    }

    updateState(n: RollingNode<ImageData>) {
        if (!n.attachData) {
            n.attachData = this.draw(n.node.content, n.left, n.top, n.color, n.fontSize);
            n.width = n.attachData.width;
        }
        else {
            this.drawImg(<ImageData> n.attachData, n.left, n.top);
        }
    }

    removeState(n: RollingNode<ImageData>) {
        // Nothing
    }

    render() {
        this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height)
        this.context.drawImage(this.bufferCanvas, 0, 0);
        this.bufferContext.clearRect(0, 0, this.bufferCanvas.width, this.bufferCanvas.height);
    }
}


function putImageDataWithAlpha(context: CanvasRenderingContext2D, imgData: ImageData,
    x: number, y: number) {
    var w = context.canvas.width;
    var h = context.canvas.height;

    var imgPixLength = imgData.data.length / 4;
    var ctxImgData = context.getImageData(x, y, imgData.width, imgData.height);
    console.log(ctxImgData.data.length - imgData.data.length);

    for (let i = 0; i < imgPixLength; i++) {
        let r = i * 4, g = r + 1, b = r + 2, a = r + 3;
        // ctxImgData.data[r] = ctxImgData.data[r] * (255 - imgData.data[a]) / 255 +
        //     imgData.data[r] * imgData.data[a] / 255;
        // ctxImgData.data[g] = ctxImgData.data[g] * (255 - imgData.data[a]) / 255 +
        //     imgData.data[g] * imgData.data[a] / 255;
        // ctxImgData.data[b] = ctxImgData.data[b] * (255 - imgData.data[a]) / 255 +
        //     imgData.data[b] * imgData.data[a] / 255;
        // ctxImgData.data[a] = imgData.data[a] + ctxImgData.data[a];

        ctxImgData.data[r] = imgData.data[r];
        ctxImgData.data[g] = imgData.data[g];
        ctxImgData.data[b] = imgData.data[b];
        ctxImgData.data[a] = imgData.data[a];

    }


    context.putImageData(ctxImgData, x, y);
}


class DanmakuDOM {
    measureItemWidth(n: RollingNode<HTMLSpanElement>) {
        if (!n.attachData) {
            n.attachData = document.createElement('span');
            n.attachData.innerHTML = n.node.content;
            n.attachData.style.top = n.top + 'px';
            n.attachData.style.color = `rgb(${color(n.node.color).join(',')})`;
            
            document.body.appendChild(n.attachData);
            var offsetWidth = n.attachData.offsetWidth;
            n.attachData.style.left = '0px';
            n.attachData.style.width = offsetWidth + 'px';
            n.width = offsetWidth;
        }
        else {
            
        }
    }

    updateState(n: RollingNode<HTMLSpanElement>) {
        n.attachData.style.left = n.left + 'px';
    }

    removeState(n: RollingNode<HTMLSpanElement>) {
        document.body.removeChild(n.attachData);
    }

    render() {
        
    }
}