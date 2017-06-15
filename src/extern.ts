import { MouseEvent, StatelessComponent, ComponentClass } from 'react';
import { Reducer, Dispatch } from 'redux';

import { State } from './store';
/** Props of <Page> Component */
export interface PageProps {
    title: string;
}

/** Props of <ListItem> Component */
export interface ListItemProps {
	caption: string;
	onPress?: () => any;
	onRequestOption?: () => any;
}

// Option Panel

export interface OptionPanelItem {
    action?: () => any;
    name: string;
}

export interface FileOption {
    action?: (path: string) => any;
    name: string;
}

/** Props of <OptionPanel> Component */
export interface OptionPanelProps {
	options: OptionPanelItem[];
    dismiss: (e: MouseEvent<HTMLLIElement>) => any; // Action
    visible: boolean;
}



/** SMV Modules */
export interface SMVPlugin<S extends SMVPluginState> {
    name: string;
    reducer: Reducer<S>;
    render: StatelessComponent<{}> | ComponentClass<{}>;
    dispatch: Dispatch<any>;

    onRequestFileOptions?(ext: string, filepath: string, dirFiles?: string[]): FileOption[];
}

export interface SMVPluginState {
    
}