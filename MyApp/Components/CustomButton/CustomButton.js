import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, StyleSheet, Pressable } from 'react-native';

export default function CustomButton({ onPress, text, buttonStyle, textStyle }) {

    return (
        <Pressable 
        onPress={() => {
            onPress();
        }} 
        style={
            [
                styles.container,
                buttonStyle
            ]}
        >
            <Text style={[styles.button, textStyle]}>{text}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({

    button: {
        color: '#fff',
        fontWeight: 'bold'
    },

    activeButton: {
        //backgroundColor: '#561ddbee',
    },

    container: {
        width: '100%',
        backgroundColor: '#561ddb',
        alignItems: 'center',
        padding: 15,
        marginVertical: 10,
        borderRadius: 5,
        alignItems: 'center'
    }
});

