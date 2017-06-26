import * as React from 'react';
import { StatelessComponent, MouseEvent } from 'react';
import ListItem from './ListItem';
import OptionPanel from './OptionPanel';
import Page from './Page';
import { basename } from 'path';

import { State } from '../store';
import { ListView, View } from 'react-native';

interface AppViewProps extends State {
    openFile(path: string, dirFiles: string[]): any;
    showOptionPanel(path: string, dirFiles: string[]): any;
    hideOptionPanel(): any;
    chdir(path: string): any;
    // files: { name: string, path: string, isDir: boolean }[];
    // title: string;
    // hashPath: string;
    // optionPanelVisile: boolean;
}

const AppView: StatelessComponent<AppViewProps> = (props) => {
    let renderItem = (file: { name: string, path: string, isDir: boolean }) => {
        // let file = props.files[index];

        return <ListItem key={file.path} caption={file.name}
        onPress={() => {
            if (file.isDir) {
                props.chdir(file.path);
            }
            else {
                console.log('FilePage/props.files[].file.path', file.path);
                props.openFile(file.path, props.files.map(n => n.path));
            }
        }}
        onRequestOption={() => {
            if (file.isDir) return;
            props.showOptionPanel(file.path, props.files.map(n => n.path));
        }}
        />
    };

    let dsFiles = new ListView.DataSource({
        rowHasChanged: (f1, f2) => f1.path !== f2.path
    }).cloneWithRows(props.files);

    // console.log('React-List', ReactList);
    return (
        <View style={{ flex: 1 }}>
            <Page title={basename(decodeURIComponent(props.hashPath))}>
                <ListView dataSource={dsFiles} renderRow={renderItem} />
            </Page>
            <OptionPanel dismiss={props.hideOptionPanel} options={props.panelOptions} visible={props.optionPanelVisible}/>
            {props.plugins.map(plugin => <plugin.render key={`smv-plugin-${plugin.name}`} />)}
        </View>
    )
}

export default AppView;