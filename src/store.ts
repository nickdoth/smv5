import { createStore, combineReducers, Action, Reducer, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import plguins from './plugins';


export interface State {
    title: string;
    hashPath: string;
    files: { name: string, path: string, isDir: boolean }[];
}

const initialState: State = {
    title: 'SMV5',
    hashPath: '',
    files: [
        { name: 'Nothing Here', path: '__', isDir: false }
    ]
}

const coreReducer = (state: State = initialState, action: Action & { payload: any }) => {
    switch (action.type) {
    case 'CHDIR':
        return { ...state, files: action.payload.files, hashPath: action.payload.hashPath };
    default:
        return state;
    }
}

let reducers = {
    'core': coreReducer
}

plguins.forEach(plugin => {
    (reducers as any)[plugin.name] = plugin.reducer;
});

let composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    combineReducers<typeof reducers>(reducers),
    composeEnhancers(
        applyMiddleware(reduxThunk)
    )
);

plguins.forEach(plugin => plugin.dispatch = store.dispatch);

export default store;