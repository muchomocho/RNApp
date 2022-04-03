import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, StyleSheet, Pressable } from 'react-native';

export default function CustomButton({ onPress, text, isToggle=false, isHoldToggle=false, buttonStyle, textStyle }) {

    const [state, setState] = useState({active: false});

    const toggle = () => {
        if (isToggle
            && (!isHoldToggle || (isHoldToggle && !state.active))) {
            setState({ active: !state.active});
            console.log('yo', state)
        }
    };
    
    const holdToggle = () => {
        if ((!isHoldToggle || isHoldToggle && !state.active)) {

        }
    };

    return (
        <Pressable 
        onPress={() => {
            onPress();
            toggle(); 
        }} 
        style={
            [
                styles.container, 
                buttonStyle, 
                (state.active && isToggle) ? {backgroundColor: '#561ddbcc'} : {backgroundColor: '#561ddb'}
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
       //backgroundColor: '#561ddb',
        alignItems: 'center',
        padding: 15,
        marginVertical: 10,
        borderRadius: 5,
        alignItems: 'center'
    }
});

