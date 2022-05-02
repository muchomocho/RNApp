import React from 'react';
import { TextInput, View, StyleSheet, ActivityIndicator } from 'react-native';

export default function CustomInput() {

    return (
        <View style={styles.loadingView}>
            <ActivityIndicator size="large" color="#000" style={{height: 100}} />
        </View>

    ); 
}

const styles = StyleSheet.create({
    loadingView: {
        height: '100%',
        justifyContent: 'center'
    },
  });

