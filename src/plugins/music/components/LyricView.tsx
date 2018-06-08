import * as React from 'react';
import { StatelessComponent, Component } from 'react';
import { Animated } from 'react-native';

import { HTMLMedia } from '../apis/media/htmlmedia';
import { Lyric, ILyricViewer, TimeLine } from '../apis/music/Lyric';
import { LrcDocument, LrcNode } from '../apis/music/lrc-document';
// import { BilibiliDanmakuDocument } from '../../apis/danmaku/bili-danmaku';
// import { DanmakuViewer } from '../../apis/danmaku/bilidm-viewer';
import { FadeViewer } from '../apis/music/lyric-viewer';

type LrcStyle = {
    color?: string;
    textShadow?: string;
}

export interface LyricViewProps {
    media: HTMLMedia;
    id: any;
    getLyric?: () => Promise<string>;
    
    lrcStyle?: LrcStyle;
}

export default class LyricView extends Component<LyricViewProps, {}> {
    
    lrc: Lyric = null;
    viewer: LyricContainer = null;

    constructor(props: LyricViewProps) {
        super(props);
        
    }
    
    componentDidMount() {
        this.lrc && this.lrc.destroy();
        this.lrc = new Lyric(this.props.media, LrcDocument, this.props.getLyric);
        console.log('LyricView.componentDidMount; LyricView#viewer', this.viewer);
        this.lrc.addView(this.viewer);
    }

    shouldComponentUpdate(nextProps: Readonly<LyricViewProps>) {
        let idChanged = this.props.id !== nextProps.id;
        if (idChanged) {
            this.componentDidMount();
        }
        return true;
    }

    componentWillUpdate() {
        // this.componentDidMount();
    }

    componentWillUnmount() {
        this.lrc && this.lrc.destroy();
    }

    render() {
        // return <div data-id={this.props.id} />;
        return <LyricContainer ref={(el) => this.viewer = el} lrcStyle={this.props.lrcStyle} />;
    }
}

interface LyricElemState {
    lyrics: {
        ly: string,
        lyTr: string,
        key: number,
    }[];
}

class LyricContainer extends Component<{ lrcStyle?: LrcStyle; }, LyricElemState> implements ILyricViewer<LrcNode> {

    constructor(props: {}) {
        super(props);
        this.state = {
            lyrics: []
        };
    }

    /**
     * @override ILyricViewer<LrcNode>
     * @param t 
     */
    init(t?: TimeLine<LrcNode>) {
        console.log('LyricElem.init');
    }

    /**
     * @override ILyricViewer<LrcNode>
     * @param matches 
     * @param timeLine 
     */
    update(matches: number[], timeLine: TimeLine<LrcNode>) {
        let [ ly, lyTr ] = timeLine[matches[0]].data.content.split('/');
        this.setState({ lyrics: [ ...this.state.lyrics, { key: matches[0], ly, lyTr }  ] });
    }

    /**
     * @override ILyricViewer<LrcNode>
     */
    destroy() {
        this.setState({ lyrics: [] });
    }

    dismiss(selectedKey: number) {
        let lyrics = Array.from(this.state.lyrics).filter(l => l.key !== selectedKey);

        this.setState({ lyrics });
    }

    render() {
        let lyricNodes = this.state.lyrics.map((lyric, i) => {
            return <LyricNode
                key={lyric.key}
                lyTr={lyric.lyTr ? lyric.lyTr : lyric.ly}
                ly={lyric.lyTr? lyric.ly : undefined}
                fadeOut={this.state.lyrics.length !== i + 1}
                onFadeOutCompleted={() => this.dismiss(lyric.key)}/>
        });

        // console.log('LyricContainer.state.lyrics', this.state.lyrics);

        return (
            <div style={styles.container}>
                <div>
                    <span style={{ ...styles.lyricText, ...this.props.lrcStyle }}>
                        {/*<LyricNode key={this.state.lyPrev} ly={this.state.lyPrev} lyTr={this.state.lyPrevCN} fadeOut />
                        <LyricNode key={this.state.ly} ly={this.state.ly} lyTr={this.state.lyTr} />*/}
                        {/*<LyricNode ly={this.state.lyNext} lyTr={this.state.lyNextCN} opacity={0.6} />*/}
                        {lyricNodes}
                    </span>
                
                </div>
            </div>
        )
    }

}

interface LyricNodeProps {
    ly: string;
    lyTr: string;
    opacity?: number;
    fadeOut?: boolean;
    onFadeOutCompleted?: () => any;
}

class LyricNode extends Component<LyricNodeProps ,{ opa: Animated.Value }> {

    state = { opa: new Animated.Value(0) }

    constructor(props: LyricNodeProps) {
        super(props);
    }

    componentDidMount() {
        Animated.timing(
            this.state.opa,
            {
                toValue: 1,
                duration: 190
            }
        ).start();
    }

    componentWillReceiveProps(nextProps: LyricNodeProps) {
        // edge condition: fadeOut: false => true
        if (nextProps.fadeOut && nextProps.fadeOut !== this.props.fadeOut) {
            Animated.timing(
                this.state.opa,
                {
                    toValue: 0,
                    duration: 190
                }
            ).start(() => this.props.onFadeOutCompleted());
        }
    }

    render() {
        return (
            <Animated.View style={{ opacity: this.state.opa, ...styles.lyricNode }}>
                {/*style={{ opacity: this.props.opacity ? this.props.opacity : 1 }}*/}
                <div style={{...styles.alignCenter, fontSize: '16px'}}>
                    {this.props.lyTr}
                    <div style={{...styles.alignCenter, fontSize: '12px'}}>
                        &nbsp; {this.props.ly}
                    </div>
                </div>
            </Animated.View>
        );
    }
}

let styles = {
    container: {
        position: 'relative' as 'relative',
        pointerEvents: 'none',
        zIndex: 19110
    },

    lyricNode: {
        position: 'absolute' as 'absolute',
        width: '100%',
        bottom: 38
    },

    lyricText: {
        /* 
            font-size: 35px

            橙色
            rgb(255,125,0),
            rgba(165,155,0,.85)

            蓝色
            rgb(0,125,255)
            rgba(0,155,165,.85)

        */
        // color: 'rgb(0,165,255)',
        fontSize: '17px',
        fontWeight: 'bolder' as 'bolder',
        // fontFamily: '楷体',
        // textShadow: '1px 1px 9px rgba(0,155,195,.85)',

        color: '#fff',
        textShadow: '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black'
        
    },

    alignCenter: {
        fontFamily: 'inherit',
        textAlign: 'center',
    },

    lyricOrange: {
        color: 'rgb(255,125,0)',
        textShadow: '1px 1px 9px rgba(165,155,0,.85)',
    }
};