import * as React from 'react';
import { StatelessComponent, MouseEvent } from 'react';
import { connect, Dispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import { State } from '../store';
import FilePage from '../components/FilePage';

import { openFile, chdir, showOptionPanel, hideOptionPanel } from '../actions';

const mapStateToProps = (state: { core: State }) => {
    return { ...state.core };
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => {
    return bindActionCreators({ openFile, chdir, showOptionPanel, hideOptionPanel }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(FilePage);