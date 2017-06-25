import * as React from 'react';
import { StatelessComponent, MouseEvent } from 'react';
import { TouchableHighlight, StyleSheet, Text } from 'react-native';
import { ListItemProps } from '../extern';

/** 列表项 */
const ListItem: StatelessComponent<ListItemProps> = (props) => {
	return (
		<TouchableHighlight style={styles.fitem} onPress={props.onPress} onLongPress={props.onRequestOption}
		activeOpacity={.9} underlayColor="#eee">
			<Text style={{ color: 'rgb(51, 102, 153)', }}>{props.caption}</Text>
		</TouchableHighlight>
	);
}

const styles = StyleSheet.create({
	fitem: {
		width: 'auto',
		// display: 'block',
		paddingTop: '20px',
        paddingBottom: '20px',
        paddingLeft: '2%',

        borderBottomColor: '#eee',
		// borderBottomStyle: 'solid',
		borderBottomWidth: 1,
		// hover rgb(150,80,80)
	}
});

export default ListItem;