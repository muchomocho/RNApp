import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text, TextInput, View, StyleSheet, Pressable } from 'react-native';

export default function SearchBar({value, setValue, onSearch}) {

        return (
        <View style={styles.container}>
            <TextInput 
            value={value} 
            onChangeText={setValue} 
            placeholder={'search...'}
            style={[styles.input, styles.border]}
            returnKeyType={'search'}
            onSubmitEditing={onSearch}
            />
            <Pressable 
            onPress={onSearch} 
            style={[styles.button, styles.border]}
            >
            </Pressable>
        </View>
    );

    
}

const styles = StyleSheet.create({
    input: {
        flex: 8,
        backgroundColor: '#fff',
        paddingLeft: 15,
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        borderRightWidth: 0
    },

    button:{
        flex: 2,
        backgroundColor: '#561ddb',
        width: 20,
        borderBottomRightRadius: 5,
        borderTopRightRadius: 5,
        borderLeftWidth: 0
    },

    border: {
        borderColor: '#888',
        borderWidth: 1
    },

    container: {
        flexDirection: 'row',
        height: 50,
        borderColor: '#000',
    }
  });

