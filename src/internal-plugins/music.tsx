import { SMVPlugin } from '../extern';
import * as React from 'react';
import { StatelessComponent, Component } from 'react';
import { View, TouchableHighlight, Text } from 'react-native';
import { connect } from 'react-redux';
import { createAction } from 'redux-action';
import { bindActionCreators } from 'redux';
import { basename } from 'path';

import { HTMLMedia } from '../apis/media/htmlmedia';
import Toolbar from './music-comp/Toolbar';
import LyricView from './music-comp/LyricView';

interface PluginState {
    path: string;
    isPlaying: boolean;
    isPause: boolean;
    currentTime: number;
    totalTime: number;
    playlist: string[];
    lrcId: number;
    plistVisible: boolean;
    canPlay: boolean;
}

interface PlayerProps extends PluginState {
    dispatch: Function;
}

const Player: StatelessComponent<PlayerProps> = ({
    path, isPause, currentTime, totalTime, dispatch, playlist, lrcId, plistVisible, canPlay }) => {
    return <View>

        {/*Play Panel (plist)*/}

        { plistVisible ?
        <View style={{ position: 'absolute', bottom: '35px', right: '0px', zIndex: 109, backgroundColor: '#efe' }}>
            <Text>NowPlaying: {path}</Text>
            <View>
                {playlist.map(n => <View key={n} style={stPlaylistItem}>
                    <TouchableHighlight style={{ width: '70%', paddingVertical: 9, paddingHorizontal: 2 }} onPress={() => dispatch(actions.play(n))}>
                        <Text>{path === n ? <b>{basename(n)}</b> : basename(n)}</Text>
                    </TouchableHighlight>

                    <TouchableHighlight style={{ width: '30%', paddingVertical: 9, paddingHorizontal: 2 }} onPress={() => dispatch(actions.removePlistItem(n))}>
                        <Text style={{ color: '#e33', textAlign: 'center' }}>Remove</Text>
                    </TouchableHighlight>
                </View>)}
            </View>
        </View> : null }

        {/*<div data-tempgap style={{ lineHeight: 9 }}>&nbsp;</div>*/}

        <LyricView id={lrcId} media={audio} />

        <Toolbar
            isPause={isPause} path={path}
            currentTime={currentTime} totalTime={totalTime}
            canPlay={canPlay}
            togglePlay={() => dispatch(actions.toggle())}
            togglePlist={() => dispatch(actions.togglePlist())} />
    </View>
}

const stPlaylistItem = {
    border: '#444 solid 1px',
    flex: 1,
    flexDirection: 'row' as 'row'
};

const audio = new HTMLMedia();

// Event linkings
audio.on('durationchange', () => {
    music.dispatch && music.dispatch(actions.internalSync({ totalTime: audio.getDuration() }));
});

audio.on('timeupdate', () => {
    music.dispatch && music.dispatch(actions.internalSync({ currentTime: audio.getCurrentTime() }));
});

audio.on('canplay', () => {
    music.dispatch && music.dispatch(actions.internalSync({ canPlay: true }));
});

audio.on('play', () => {
    music.dispatch && music.dispatch(actions.internalSync({ isPlaying: true, isPause: false }));
});

audio.on('pause', () => {
    music.dispatch && music.dispatch(actions.internalSync({ isPlaying: false, isPause: true }));
});

audio.on('ended', () => {
    // playlist looping
    if (!music.dispatch) return;
    let index = playlist.indexOf(currentPlaying);
    if (index < 0 || index + 1 >= playlist.length) {
        index = 0;
    }
    else {
        ++index;
    }
    music.dispatch(actions.play(playlist[index]));
});

// internal playlist

let playlist: string[] = [];
let currentPlaying: string = null;

// actions

const actions = {
    play: createAction('PLAY_MUSIC', (path) => {
        audio.load('/files/' + path);
        audio.play();

        // update internal playlist
        if (playlist.indexOf(path) < 0) {
            playlist.push(path);
        }
        currentPlaying = path;

        return { path: currentPlaying, playlist: [].concat(playlist) };
    }),

    toggle: createAction('TOGGLE_MUSIC', () => {
        if (audio.isPaused()) {
            audio.play();
        }
        else {
            audio.pause();
        }
    }),

    internalSync: createAction('INTERNAL_SYNC', (updates) => {
        return updates;
    }),

    removePlistItem: createAction('REMOVE_PLIST_ITEM', (path) => {
        playlist.splice(playlist.indexOf(path), 1);

        return { playlist: [].concat(playlist) };
    }),

    togglePlist: createAction('TOGGLE_PLIST', () => void 0)
};

const mapStateToProps = (state: { musicPlayer: PluginState }) => {
    return { ...state.musicPlayer };
}

const initialState: PluginState = {
    path: null,
    isPause: false,
    isPlaying: false,
    currentTime: 0,
    totalTime: 0,
    playlist: [],
    lrcId: 0,
    plistVisible: false,
    canPlay: true,
};

const music: SMVPlugin<PluginState> = {
    /** @TODO 不良实现 */
    dispatch: null,
    name: 'musicPlayer',
    reducer: (state: PluginState = initialState, action: any) => {
        switch (action.type) {
        case 'PLAY_MUSIC':
            console.log('action(PLAY_MUIC).path', action.payload.path);
            return { ...state,
                ...action.payload,
                canPlay: false,
                lrcId: Math.random()
            };
        case 'INTERNAL_SYNC': // fall through
        case 'REMOVE_PLIST_ITEM':
            return { ...state, ...action.payload };
        case 'OPEN_FILE':
            console.info('Note: All reducers can subscribe all actions');
            return state;
            // nobreak;
        case 'TOGGLE_PLIST':
            return { ...state, plistVisible: !state.plistVisible };
        default:
            return state;
        }
    },
    render: connect(mapStateToProps)(Player),
    start(dispatch, smv) {
        smv.onRequestFileOptions((ext, filepath) => {
            if (ext.toLowerCase() !== '.mp3') return [];

            return [
                {
                    name: 'Play',
                    action: path => dispatch(actions.play(path))
                }
            ];
        });
    },
    onRequestFileOptions(ext, filepath) {
        if (ext.toLowerCase() !== '.mp3') return [];

        return [
            {
                name: 'Play',
                action: path => music.dispatch(actions.play(path))
            }
        ];
    }
}

export default music;