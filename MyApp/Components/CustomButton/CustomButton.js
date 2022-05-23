import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, StyleSheet, Pressable, TouchableOpacity } from 'react-native';

// derived from 
// https://www.youtube.com/watch?v=ALnJLbjI7EY&t=1837s&ab_channel=notJust%E2%80%A4dev

export default function CustomButton({ onPress, modest=false, text, buttonStyle, textStyle }) {

    return (
        <TouchableOpacity 
            onPress={() => {
                onPress();
            }} 
            style={
                [
                    modest ? [styles.container, styles.modest] : styles.container,
                    buttonStyle
                ]}
        >
            <Text style={[modest ? styles.modestText : styles.button, textStyle]}>{text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({

    button: {
        color: '#fff',
        fontWeight: 'bold'
    },

    container: {
        width: '100%',
        backgroundColor: '#561ddb',
        alignItems: 'center',
        padding: 15,
        marginVertical: 10,
        borderRadius: 5,
        alignItems: 'center'
    },
    modest: {
        backgroundColor: '#fff', 
        borderWidth: 1, 
        borderColor: '#000'
    },
    modestText: {
        color: '#000'
    },
});

