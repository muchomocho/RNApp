import React from 'react';
import { Text, TextInput, View, StyleSheet, Pressable } from 'react-native';

export default function CustomButton({ onPress, text }) {


    return (
        <Pressable onPress={onPress} style={styles.container}>
            <Text style={styles.button}>{text}</Text>
        </Pressable>
    );

    
}

const styles = StyleSheet.create({

    button: {
        color: '#fff',
        fontWeight: 'bold'
    },

    container: {
        width: '100%',
        backgroundColor: '#c6d6',
        alignItems: 'center',
        padding: 20,
        marginVertical: 10,
        borderRadius: 10,
        alignItems: 'center'
    }
  });

