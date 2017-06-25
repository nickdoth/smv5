import { createStore, combineReducers, Action, Reducer, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import plugins from './plugins';
import { SMVLifeCycle, FileOption, OptionPanelItem } from './extern';

import core from './reducers/core';
import { State as CoreState } from './reducers/core';

export interface State extends CoreState {}

let reducers = {
    core
}

plugins.forEach(plugin => {
    (reducers as any)[plugin.name] = plugin.reducer;
});

let composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    combineReducers<typeof reducers>(reducers),
    composeEnhancers(
        applyMiddleware(reduxThunk)
    )
);

// define lifecycle callbacks & load all plugins

export var smvLifeCycle: SMVLifeCycle & LifeCycleVars = {
    optionAdaptors: [],

    dispatch: store.dispatch,

    onRequestFileOptions(listener) {
        smvLifeCycle.optionAdaptors.push(listener);
        return smvLifeCycle;
    }
};

plugins.forEach(plugin => plugin.start(smvLifeCycle));

type LifeCycleVars = {
    optionAdaptors: ((ext: string, filepath: string, dirFiles?: string[]) => FileOption[])[];
};



export default store;