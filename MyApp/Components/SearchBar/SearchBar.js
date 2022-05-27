import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text, TextInput, View, StyleSheet, Pressable, Image, TouchableOpacity } from 'react-native';

export default function SearchBar({value, setValue, onSearch, searchIconType=1}) {

        const image = searchIconType === 1 ? require("../../assets/icons/search-white.png") : require("../../assets/icons/search.png");
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
            <TouchableOpacity
            onPress={() => { if (value.length > 0) { onSearch(); }}} 
            style={[styles.button, styles.border]}
            >
            <Image source={image} style={{alignSelf: 'center', height: 30, width: 30, padding: 0}} />
            </TouchableOpacity>
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
        borderLeftWidth: 0,
        justifyContent: 'center'
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

