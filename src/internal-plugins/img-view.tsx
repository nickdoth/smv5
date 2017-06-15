import { SMVPlugin } from '../extern';
import * as React from 'react';
import { StatelessComponent } from 'react';
import { connect } from 'react-redux';
import { createAction } from 'redux-action';
import { extname } from 'path';
import { View, Image, Text, Button, TouchableHighlight, ActivityIndicator,
    StyleSheet, Platform, PlatformOSType } from 'react-native';

interface PluginState {
    visible: boolean;
    src: string;
    toggle?: () => any;
    next?: () => any;
    prev?: () => any;
    imgLoaded?: () => any
    dirFiles: string[];
    loading: boolean;
}

const initialState: PluginState = {
    visible: false,
    src: '',
    dirFiles: [],
    loading: false
};

const Img = (props: { src: string, onLoad: () => any }) => {
    if (Platform.OS === 'web' as PlatformOSType) {
        return <div><img src={props.src} style={{ width: '100%' }} onLoad={props.onLoad} /></div>
    }
    else {
        return <Image source={{ uri: props.src }} onLoad={props.onLoad} />;
    }
}

const ImgView: StatelessComponent<PluginState> = (props) => {
    if (!props.visible) return null;

    return <View style={{ position: 'absolute', zIndex: 999, padding: '20px', minHeight: '100%', width: '100%',
            overflow: 'visible', backgroundColor: '#222' }}>
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1, flexDirection: 'row', flexGrow: 0, justifyContent: 'flex-end' }}>
                {props.loading ? <ActivityIndicator /> : null}
                <Button onPress={props.toggle} title="Close" />
                <Button onPress={props.prev} title="Prev" />
                <Button onPress={props.next} title="Next" />
            </View>
            
            <View style={{ flex: 1, flexDirection: 'row' }}>
                <Text style={{ color: '#fefefe' }}>{props.src}</Text>
            </View>

            <Img src={'/files/' + props.src} onLoad={props.imgLoaded} />
        </View>
    </View>;
}

const actions = {
    load: createAction('LOAD_IMGVIEW', (path: string, dirFiles: string[]) => {
        return { src: path, dirFiles: dirFiles, visible: true };
    }),

    toggle: createAction('TOGGLE_IMGVIEW', () => { }),

    next: createAction('SEEK_IMG', () => {
        return 1;
    }),

    prev: createAction('SEEK_IMG', () => {
        return -1;
    }),

    imgLoaded: createAction('IMGVIEW_LOADED', () => { })
}

const mapStateToProps = (state: { imgView: PluginState }) => {
    return { ...state.imgView };
}

const mapDispatchToProps = (dispatch: Function) => {
    return {
        toggle: () => dispatch(actions.toggle()),
        next: () => dispatch(actions.next()),
        prev: () => dispatch(actions.prev()),
        imgLoaded: () => dispatch(actions.imgLoaded()),
    };
};

const imgView: SMVPlugin<PluginState> = {
    /** @TODO 不良实现 */
    dispatch: null,
    name: 'imgView',
    reducer: (state = initialState, action: any) => {
        switch (action.type) {
        case 'LOAD_IMGVIEW':
            return { ...state, ...action.payload, loading: true };
        case 'IMGVIEW_LOADED':
            return { ...state, loading: false };
        case 'TOGGLE_IMGVIEW':
            return { ...state, visible: !state.visible };
        case 'SEEK_IMG':
            let seekIndex = state.dirFiles.indexOf(state.src) + action.payload;
            if (seekIndex >= state.dirFiles.length) seekIndex = 0;
            if (seekIndex < 0) seekIndex = state.dirFiles.length - 1;
            return { ...state, src: state.dirFiles[seekIndex], loading: true };
        default:
            return state;
        }
    },
    render: connect(mapStateToProps, mapDispatchToProps)(ImgView),
    onRequestFileOptions(ext, filepath, dirFiles) {
        const imgExts = ['.jpg', '.gif', '.png'];
        if (imgExts.indexOf(ext) < 0) return [];

        dirFiles = dirFiles.filter(n => imgExts.indexOf(extname(n).toLowerCase()) > -1);

        return [
            {
                name: 'View',
                action: path => imgView.dispatch(actions.load(path, dirFiles))
            }
        ];
    }
}

export default imgView;