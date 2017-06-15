import * as React from 'react';
import { StatelessComponent, MouseEvent } from 'react';
import ListItem from './ListItem';
import Page from './Page';
import { basename } from 'path';
// import * as ReactList from 'react-list'; // type failed
// const ReactList = require('react-list');
import { ListView, View } from 'react-native';

interface FilePageProps {
    openFile(path: string, dirFiles: string[]): any;
    chdir(path: string): any;
    files: { name: string, path: string, isDir: boolean }[];
    title: string;
    hashPath: string;
}

const FilePage: StatelessComponent<FilePageProps> = (props) => {
    let renderItem = (file: { name: string, path: string, isDir: boolean }) => {
        // let file = props.files[index];

        return <ListItem key={file.path} caption={file.name} onPress={() => {
            if (file.isDir) {
                props.chdir(file.path);
            }
            else {
                console.log('FilePage/props.files[].file.path', file.path);
                props.openFile(file.path, props.files.map(n => n.path));
            }
        }} />
    };

    let dsFiles = new ListView.DataSource({
        rowHasChanged: (f1, f2) => f1.path !== f2.path
    }).cloneWithRows(props.files);

    // console.log('React-List', ReactList);
    return (
        <Page title={basename(decodeURIComponent(props.hashPath))}>
            {/*<div className='clearfix'></div>*/}
            {/*<div id='mangalist'>*/}
                {/*<ListItem caption="返回上级" />*/}
                {/*{props.children}*/}
                <ListView dataSource={dsFiles} renderRow={renderItem} />
            {/*</div>*/}
        </Page>
    )
}

export default FilePage;