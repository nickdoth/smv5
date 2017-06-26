import { SMVPlugin } from '../extern';
// internal plugins
import * as music from './music';
import * as imgView from './img-view';

// for plugin factory
import * as React from 'react';
import * as Redux from 'redux';
import * as ReduxAction from 'redux-action';
import * as ReactRedux from 'react-redux';
import * as ReactNative from 'react-native';

let { smvPluginFactories } = (typeof global === 'object' ? global : window) as any;
if (!smvPluginFactories) smvPluginFactories = [];

const plugins: SMVPlugin<{}>[] = [
    // internal plugins
    music, imgView
].concat(smvPluginFactories.map(
    (factory: Function) => factory({ React, Redux, ReduxAction, ReactRedux, ReactNative })
));

export default plugins;