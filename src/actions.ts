import { createAction } from 'redux-action';
import plugins from './plugins';
import { OptionPanelItem, FileOption } from './extern';
import { join as pathJoin, extname } from 'path';
import { smvLifeCycle } from './store';

export const openFile = createAction('OPEN_FILE', (path, dirFiles) => {
    let operations: FileOption[] = [];
    smvLifeCycle.optionAdaptors.map(adaptor => adaptor(extname(path).toLowerCase(), path, dirFiles)).forEach(ops => {
        operations = operations.concat(ops);
    });

    // call the first operatioal action
    console.log('actions.openFile/path', path);
    let firstMatchedAction = operations[0].action;

    if (firstMatchedAction) {
        firstMatchedAction(path);
        return { openedFile: path };
    }
    else {
        return { openedFile: null };
    }

    // return { path };
});

export const chdir = createAction('CHDIR', (path) => {
    return fetch(pathJoin('/files/' + path))
    .then(res => res.json())
    .then(files => {
        files.unshift({ name: '..', path: pathJoin(path, '..'), isDir: true });
        return { hashPath: pathJoin('/', path), files };
    });
});

export const showOptionPanel = createAction('SHOW_OPTION_PANEL', (path, dirFiles) => {
    let operations: FileOption[] = [];
    smvLifeCycle.optionAdaptors.map(adaptor => adaptor(extname(path).toLowerCase(), path, dirFiles)).forEach(ops => {
        operations = operations.concat(ops);
    });

    return {
        title: path,
        panelOptions: operations
    };
});
export const hideOptionPanel = createAction('HIDE_OPTION_PANEL', () => void 0);