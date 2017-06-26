import * as React from 'react';
import { StatelessComponent, MouseEvent, Component } from 'react';
import { TouchableHighlight, View, Animated, Text, Easing } from 'react-native';

import { OptionPanelItem, OptionPanelProps } from '../extern';

const Modal: StatelessComponent<{}> = (props) => {
	return <div style={{ }}>
		{props.children}
	</div>
};

const OptionPanel: StatelessComponent<OptionPanelProps> = (props) => {
	var optionElems = props.options.map(option => {
		return <TouchableHighlight onPress={() => {
				option.action();
				props.dismiss();
			}} style={styles.panelItem}
				activeOpacity={.9} underlayColor="#eee">
			<View>{option.name}</View>
		</TouchableHighlight>;
	});

	// if (!props.visible) return;

	return (
		<Modal>
			<View style={styles.panel}>
				<View style={styles.title}>
					<Text style={{ color: '#888' }}>{props.title ? props.title : 'Options'}</Text>
				</View>
				{optionElems}
				<TouchableHighlight onPress={() => props.dismiss()} style={styles.panelItem}
					activeOpacity={.9} underlayColor="#eee">
					<View>Cancel</View>
				</TouchableHighlight>
			</View>
		</Modal>
	);
}

interface AnimatedState {
	opacity: Animated.Value;
	bottom: Animated.Value;
	isDisplay: boolean;
}

export default class AnimatedOptionPanel extends Component<OptionPanelProps, AnimatedState> {
	constructor(props: OptionPanelProps) {
		super(props);
		this.state = { opacity: new Animated.Value(0), isDisplay: false, bottom: new Animated.Value(-20) };
	}
	
	render() {
		if (!this.state.isDisplay) return null;

		return <View>
			<Animated.View
				style={{ opacity: this.state.opacity, position: 'fixed',
					zIndex: 200, bottom: this.state.bottom, width: '100%' }}>
				<OptionPanel {...this.props} />
			</Animated.View>

			<Animated.View
				style={{ opacity: this.state.opacity, position: 'fixed',
					zIndex: 199, bottom: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)' }}>
				{/*<OptionPanel {...this.props} />*/}
				<div
					onClick={this.props.dismiss}
					style={{ width: '100%', height: '100%' }}>
				</div>
			</Animated.View>
		</View>
	}

	componentWillReceiveProps(nextProps: OptionPanelProps) {
		if (this.props.visible && !nextProps.visible) {
			// fade out
			Animated.parallel([
				Animated.timing(this.state.opacity, {
					toValue: 0,
					duration: 150,
					// easing: Easing.back as any
				}),
				Animated.timing(this.state.bottom, {
					toValue: -20,
					duration: 150,
					easing: Easing.in(Easing.ease),
				}),
			]).start(() => this.setState({ ...this.state, isDisplay: false }));
		}
		else if (!this.props.visible && nextProps.visible) {
			// fade in
			this.setState({ ...this.state, isDisplay: true });
			Animated.parallel([
				Animated.timing(this.state.opacity, {
					toValue: 1,
					duration: 150,
					// easing: Easing.back as any
				}),
				Animated.timing(this.state.bottom, {
					toValue: 0,
					duration: 150,
					easing: Easing.in(Easing.ease),
				}),
			]).start();
				
		}
	}
}

var styles = {
	panelItem: {
		padding: 20,
	},

	panel: {
		background: '#fff',
		width: '100%',
		borderTop: '#777 solid 1px',
		// position: 'absolute' as 'absolute',
		// zIndex: 999,
		// bottom: 0
	},

	title: {
		margin: 5,
		paddingLeft: 15,
		paddingBottom: 5,
		borderBottom: '#eee solid 1px',
	},
};