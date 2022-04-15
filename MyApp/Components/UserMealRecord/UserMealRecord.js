import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, StyleSheet, Pressable, FlatList } from 'react-native';
import foodDataJson from '../../assets/JSON/food_integrated_dataset.json'
import foodDataUnitJson from '../../assets/JSON/food_integrated_dataset_units.json'
import CustomButton from '../CustomButton';
import SearchBar from '../SearchBar';

export default function UserMealRecord(props) {

    const [searchValue, setSearchValue] = useState('');
    const [searchPress, setSearchPress] = useState(false);
    
    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
        const reload = props.navigation.addListener('focus', async () => {
            try {
                await getUserMealRecord();
            } catch (error) {
                console.log(error)
            }
        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
    }, [props]);

    const getUserMealRecord = async () => {
        
        try {
            const result = await APIRequest.httpRequest({
            method: 'GET',
            endpoint: 'api/usermealrecords/?name=' 
            + props.route.params.userdata.name 
            ,isAuthRequired: true
            });
            
            setData(result.json);
        
        } catch (error) {
            console.log('userrecord', error)
        }
    };

    return (
        <View style={styles.container}>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignContent: 'center',
    },
    footer: {
        marginBottom: 100
    },
    button: {
        textAlign: 'center',
        textAlignVertical: 'center',
        height: 100,
        width: '40%',
        margin: '5%'
    }
});

