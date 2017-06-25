import { OptionPanelItem } from '../extern';
import plugins from '../plugins';
import { Action } from 'redux';

export interface State {
    title: string;
    hashPath: string;
    files: { name: string, path: string, isDir: boolean }[];
    optionPanelVisible: boolean;
    panelOptions: OptionPanelItem[],
    plugins: typeof plugins
}

const initialState: State = {
    title: 'SMV5',
    hashPath: '',
    files: [
        { name: 'Nothing Here', path: '__', isDir: false }
    ],
    optionPanelVisible: false,
    panelOptions: [],
    plugins: plugins
}

const coreReducer = (state: State = initialState, action: Action & { payload: any }) => {
    switch (action.type) {
    case 'CHDIR':
        return { ...state, files: action.payload.files, hashPath: action.payload.hashPath };
    case 'SHOW_OPTION_PANEL':
        return { ...state, optionPanelVisible: true, panelOptions: action.payload.panelOptions };
    case 'HIDE_OPTION_PANEL':
        return { ...state, optionPanelVisible: false };
    default:
        return state;
    }
};

export default coreReducer;