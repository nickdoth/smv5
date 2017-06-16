import * as React from 'react';
import { StatelessComponent, Component, ComponentState } from 'react';
import { View, TouchableHighlight,
    StyleSheet, Text as NativeText,
    ViewStyle, TextProperties,
    ActivityIndicator } from 'react-native';
import { basename } from 'path';

export interface ToolbarProps {
    isPause: boolean;
    togglePlay: Function;
    togglePlist: Function;
    path: string;
    currentTime: number;
    totalTime: number;
    canPlay: boolean;
}

class Text extends Component<TextProperties, {}> {
    private nativeText: NativeText;

    render(): JSX.Element {
        return <NativeText
            {...this.props}
            ref={(t) => { this.nativeText = t as any; } }
            style={[ styles.toolbarItemText, this.props.style ]} />;
    }

    setNativeProps(props: any) {
        return this.nativeText.setNativeProps(props);
    }
}

const Toolbar: StatelessComponent<ToolbarProps> = ({ isPause, togglePlay, togglePlist, path, currentTime, totalTime, canPlay }) => {
    let process = currentTime / totalTime * 100;
    process = isNaN(process) ? 0 : process;
    let remain = totalTime - currentTime;
    // remain = isNaN(remain) ? 0 : remain;
    path = path ? path : 'Chosen to play';

    return <View>
        <View style={styles.toolbar}>
            {/*<!-- glyphicon glyphicon-play  -->*/}
            <ToolbarButton onPress={() => togglePlay()} style={{width: '50px'}}>
                {Icon({iconSym: isPause ? glyphicon.play : glyphicon.pause})}
            </ToolbarButton>
            <View style={[
                styles.toolbarItem, { width: '70%', backgroundColor: '#ccc', position: 'relative', flexShrink: 2, flexGrow: 2 }
            ]}>
                <View style={[styles.progval, { width: `${process}%` }]}>
                    <Text>{' '}</Text>
                </View>
                <View style={{ position: 'absolute', left: '10px', width: '70%', top: 0, zIndex: 99, overflow: 'hidden', height: '35px', flex: 1, flexDirection: 'row' }}>
                    { !canPlay ? <ActivityIndicator /> : null}
                    <Text style={{ color: '#fff' }}>{basename(path)}</Text>
                </View>
            </View>
            <View style={[styles.toolbarItem, {width: '68px'}]}>
                <Text style={{ textAlign: 'center' }}>{' '}{readableTime(remain)}{' '}</Text>
            </View>

            <ToolbarButton style={{width: '45px'}} onPress={() => togglePlist()}>
                {Icon({iconSym: glyphicon.menuHamburger})}
            </ToolbarButton>

            <ToolbarButton style={{width: '45px'}}>
                {Icon({iconSym: glyphicon.comment})}
            </ToolbarButton>

            <ToolbarButton style={{width: '45px'}}>
                {Icon({iconSym: glyphicon.fullscreen})}
            </ToolbarButton>
        
        </View>

        {/*<div id="topbar" className="" style={{position: 'absolute', left: '5px', top: '5px', display: 'none'}}>
            <span id="video-title"></span>
        </div>*/}
    </View>
};

export default Toolbar;

interface ToolbarButtonProps {
    onPress?: () => void;
    children?: JSX.Element | string;
    style?: ViewStyle;
}

const ToolbarButton = (props: ToolbarButtonProps) => {
    return <TouchableHighlight
            style={[styles.toolbarItem, props.style]} onPress={props.onPress} activeOpacity={.9} underlayColor="#eee">
        {props.children}
    </TouchableHighlight>
};

// TODO: May not be capable with react-native platform
const Icon = ({ iconSym = '' }) => {
    return <Text style={{ fontFamily: 'Glyphicons Halflings', textAlign: 'center' }}>{iconSym}</Text>
};

const glyphicon = {
    play: '\ue072',
    pause: '\ue073',
    menuHamburger: '\ue236',
    comment: '\ue111',
    fullscreen: '\ue140'
};

const styles = StyleSheet.create({
    toolbar: {
        width: '100%',
        bottom: '0px',
        position: 'absolute',
        // zIndex: '200',
        backgroundColor: 'rgba(255,255,255,.7)',
        // position: 'fixed',
        flex: 1,
        justifyContent: 'flex-start',
        flexDirection: 'row',
    },

    toolbarItem: {
        // float: 'left',
        height: '35px',
        // lineHeight: '35px',
    },

    toolbarItemText: {
        lineHeight: '35px',
    },

    progval: {
        position: 'absolute',
        width: `0px`,
        top: '0px',
        left: '0px',
        // lineHeight: '35px',
        backgroundColor: '#777'
    }
});


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