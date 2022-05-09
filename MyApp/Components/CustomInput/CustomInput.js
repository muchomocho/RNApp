import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';

// derived from
// https://www.youtube.com/watch?v=ALnJLbjI7EY&t=1837s&ab_channel=notJust%E2%80%A4dev

export default function CustomInput({ value, setValue, placeholder, customStyle, isSecure, defaultValue, multiline=false}) {

    return (
        <View style={styles.container}>
            <TextInput 
            autoCapitalize='none'
            defaultValue={defaultValue}
            value={value} 
            onChangeText={setValue} 
            placeholder={placeholder}
            secureTextEntry={isSecure}
            multiline={multiline}
            style={[styles.input, customStyle]}
            />
        </View>
    );

    
}

const styles = StyleSheet.create({
    input: {
        height: 50,
        padding: 10,
        marginVertical: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#888',
        borderRadius: 5
    },

    container: {
    }
  });

