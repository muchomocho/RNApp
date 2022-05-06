import React from 'react';
import { TextInput, View, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { backgroundColor } from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';

const {height, width} = Dimensions.get("window")

export default function CustomInput() {

    return (
        <View style={styles.loadingView}>
            <ActivityIndicator size="large" color="#000" />
        </View>

    ); 
}

const styles = StyleSheet.create({
    loadingView: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: '#fff'
    },
  });

