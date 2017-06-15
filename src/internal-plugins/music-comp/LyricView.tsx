import * as React from 'react';
import { StatelessComponent, Component } from 'react';

import { HTMLMedia } from '../../apis/media/htmlmedia';
import { Lyric } from '../../apis/music/Lyric';
import { LrcDocument } from '../../apis/music/lrc-document';
// import { BilibiliDanmakuDocument } from '../../apis/danmaku/bili-danmaku';
// import { DanmakuViewer } from '../../apis/danmaku/bilidm-viewer';
import { FadeViewer } from '../../apis/music/lyric-viewer';

export interface LyricViewProps {
    media: HTMLMedia;
    id: any;
}

export default class LyricView extends Component<LyricViewProps, {}> {
    
    lrc: Lyric = null;

    constructor(props: LyricViewProps) {
        super(props);
        
    }
    
    componentWillMount() {
        this.lrc && this.lrc.destroy();
        this.lrc = new Lyric(this.props.media, LrcDocument);
        this.lrc.addView(new FadeViewer());
    }

    shouldComponentUpdate(nextProps: Readonly<LyricViewProps>) {
        return this.props.id !== nextProps.id;
    }

    componentWillUpdate() {
        this.componentWillMount();
    }

    componentWillUnmount() {
        this.lrc && this.lrc.destroy();
    }

    render() {
        return <div data-id={this.props.id} />;
    }
}