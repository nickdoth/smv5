import { SMVLifeCycle } from '../../extern';

import * as React from 'react';
import { StatelessComponent, Component } from 'react';
import { View, TouchableHighlight, Text } from 'react-native';
import { connect } from 'react-redux';
import { createAction } from 'redux-action';
import { bindActionCreators } from 'redux';
import { basename } from 'path';

import { HTMLMedia } from './apis/media/htmlmedia';
import Toolbar from './components/Toolbar';
import LyricView from './components/LyricView';

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
function linkEvents(dispatch: Function) {
    audio.on('durationchange', () => {
        dispatch(actions.internalSync({ totalTime: audio.getDuration() }));
    });

    audio.on('timeupdate', () => {
        dispatch(actions.internalSync({ currentTime: audio.getCurrentTime() }));
    });

    audio.on('canplay', () => {
        dispatch(actions.internalSync({ canPlay: true }));
    });

    audio.on('play', () => {
        dispatch(actions.internalSync({ isPlaying: true, isPause: false }));
    });

    audio.on('pause', () => {
        dispatch(actions.internalSync({ isPlaying: false, isPause: true }));
    });

    audio.on('ended', () => {
        // playlist looping
        let index = playlist.indexOf(currentPlaying);
        if (index < 0 || index + 1 >= playlist.length) {
            index = 0;
        }
        else {
            ++index;
        }
        dispatch(actions.play(playlist[index]));
    });

}

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

    addToPlist: createAction('ADD_TO_PLIST', (path) => {
        // update internal playlist
        if (playlist.indexOf(path) < 0) {
            playlist.push(path);
        }
        currentPlaying = path;

        return { playlist: [].concat(playlist) };
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

export var name = 'musicPlayer';
    
export function reducer(state: PluginState = initialState, action: any) {
    switch (action.type) {
    case 'PLAY_MUSIC':
        console.log('action(PLAY_MUIC).path', action.payload.path);
        return { ...state,
            ...action.payload,
            canPlay: false,
            lrcId: Math.random()
        };
    case 'INTERNAL_SYNC': // fall through
    case 'ADD_TO_PLIST': // fall through
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
}

export var render = connect(mapStateToProps)(Player);

export function start(smv: SMVLifeCycle) {
    let dispatch = smv.dispatch;

    linkEvents(dispatch);

    smv.onRequestFileOptions((ext, filepath) => {
        if (ext.toLowerCase() !== '.mp3') return [];

        return [
            {
                name: 'Play',
                action: () => dispatch(actions.play(filepath))
            },
            {
                name: 'Add to playlist',
                action: () => dispatch(actions.addToPlist(filepath))
            }
        ];
    });
}