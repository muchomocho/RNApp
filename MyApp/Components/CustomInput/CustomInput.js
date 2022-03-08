import React from 'react';
import { TextInput, View, StyleSheet } from 'react-native';

export default function CustomInput({ value, setValue, placeholder, isSecure }) {

        return (
        <View style={styles.container}>
            <TextInput 
            value={value} 
            onChangeText={setValue} 
            placeholder={placeholder}
            secureTextEntry={isSecure}
            style={styles.input}
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
        borderRadius: 10
    },

    container: {
    }
  });

