import * as React from 'react';
import { StatelessComponent, MouseEvent, CSSProperties } from 'react';

import { PageProps } from '../extern';

import { TouchableOpacity, View, StyleSheet, Text, ScrollView } from 'react-native';

const Page: StatelessComponent<PageProps> = (props) => {
    return (
        <View style={{ flex: 1 }}>
            <View style={styles.topBar}>
                <Text style={{ fontSize: 11, lineHeight: 48 }}>{' '}smv5@ {props.title}</Text>
            </View>

            <ScrollView>{props.children}</ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    topBar: {
        // color: '#fff',
        // height: '48px',
        // top: '0px',
        width: '100%',
        // position: ('absolute' as 'absolute'),
        // left: '0px',
        overflow: ('hidden' as 'hidden'),
        // lineHeight: '48px',
        // height: '48px',
        /*background:rgba(76,156,215,.9);*/
        backgroundColor: '#fff',
        /* background:rgba(180,208,235,.4); */
        // zIndex: '100',
        // boxShadow: '1px 0 1.3px #999',
        borderBottomWidth: 1.3,
        borderBottomColor: '#ccc',
    },
});

export default Page;