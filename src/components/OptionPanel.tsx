import * as React from 'react';
import { StatelessComponent, MouseEvent, Component } from 'react';
import { TouchableHighlight, View, Animated, Text, Easing, TouchableWithoutFeedback, Dimensions } from 'react-native';

import { OptionPanelItem, OptionPanelProps } from '../extern';

const Modal: StatelessComponent<{}> = (props) => {
	return <div style={{ }}>
		{props.children}
	</div>
};

const renderOptionPanel: StatelessComponent<OptionPanelProps> = (props) => {
	var optionElems = props.options.map(option => {
		return <TouchableHighlight onPress={() => {
				option.action();
				props.dismiss();
			}} style={styles.panelItem}
				activeOpacity={.9} underlayColor="#eee">
			<View><Text>{option.name}</Text></View>
		</TouchableHighlight>;
	});

	// if (!props.visible) return;

	return (
		<View style={styles.panel} ref="view">
			<View style={styles.title}>
				<Text style={{ color: '#888' }}>{props.title ? props.title : 'Options'}</Text>
			</View>
			{optionElems}
			<TouchableHighlight onPress={() => props.dismiss()} style={styles.panelItem}
				activeOpacity={.9} underlayColor="#eee">
				<View><Text>Cancel</Text></View>
			</TouchableHighlight>
		</View>
	);
}

class OptionPanel extends Component<OptionPanelProps, {}> {
	render() { return renderOptionPanel(this.props); }

	setNativeProps(p: any) { (this.refs.view as any).setNativeProps(p); }
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
				style={{ opacity: this.state.opacity, position: 'absolute',
					zIndex: 200, bottom: this.state.bottom, width: '100%' }}>
				<OptionPanel {...this.props} />
			</Animated.View>

			<Animated.View
				style={{ opacity: this.state.opacity, position: 'absolute',
					zIndex: 199, bottom: 0, width: '100%', height: Dimensions.get('window').height, backgroundColor: 'rgba(0,0,0,0.5)' }}>
				{/*<OptionPanel {...this.props} />*/}
				<TouchableHighlight underlayColor="rgba(0,0,0,0)"
					onPress={this.props.dismiss}
					style={{ width: '100%', height: '100%' }}>
					<View />
				</TouchableHighlight>
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
			this.setState({ ...this.state, isDisplay: true }, () => {
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
			});
				
		}
	}
}

var styles = {
	panelItem: {
		padding: 20,
	},

	panel: {
		backgroundColor: '#fff',
		width: '100%',
		borderTopColor: '#777',
		borderTopWidth: 1,
		// position: 'absolute' as 'absolute',
		// zIndex: 999,
		// bottom: 0
	},

	title: {
		margin: 5,
		paddingLeft: 15,
		paddingBottom: 5,
		borderBottomColor: '#eee',
		borderBottomWidth: 1
	},
};