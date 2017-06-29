// import { render } from 'react-dom';
import * as React from 'react';
import { Component } from 'react';
import { AppRegistry, View, Platform } from 'react-native';
import { Provider } from 'react-redux';
import App from './containers/App';
import plugins from './plugins';
import store from './store';
import { openFile, chdir } from './actions';

let isWeb = Platform.OS === 'web' as any

class AppWrapped extends Component<{}, {}> {

    render() {
        return <Provider store={store}>
            <App/>
        </Provider>;
    }
}

if (isWeb) {
    let hashPath = (store.getState() as any).core.hashPath;

    store.subscribe(() => {
        if ((store.getState() as any).core.hashPath !== hashPath) {
            hashPath = (store.getState() as any).core.hashPath;
            history.pushState({ hashPath }, null, hashPath);
        }
    });

    window.onpopstate = (e) => {
        hashPath = e.state.hashPath;
        store.dispatch(chdir(e.state.hashPath));
    }

    AppRegistry.registerComponent('AppWrapped', () => AppWrapped);
    AppRegistry.runApplication('AppWrapped', {
        rootTag: document.getElementById('app')
    });
}
else {
    AppRegistry.registerComponent('SMVNative', () => AppWrapped);
    AppRegistry.runApplication('SMVNative', {
        rootTag: 1
    });
}

setTimeout(() => store.dispatch(chdir(isWeb ? location.pathname : '/')), 0);