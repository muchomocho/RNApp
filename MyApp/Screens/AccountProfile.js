import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert } from 'react-native';
import GlobalConstant from '../Global/Global'
import * as Authentication from "../Authentication/Authentication";

function Recipe({ navigation }) {

    const [data, setData] = useState([]);

    // https://reactnative.dev/docs/network
    const getUserData = async (token) => {
        try {
            const response = await fetch(GlobalConstant.rootUrl + '/api/userprofile/', {
                method: "GET",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token
                  },
            });
            const json = await response.json();
            console.log(json)
            setData(json);
          } catch (error) {
            console.error(error);
          } 
    };

    const createUserAccount = async () => {

    };

    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
        const reload = navigation.addListener('focus', () => {
          // The screen is focused
          // Call any action
          Authentication.getStoredAccessToken()
          .then((token) => getUserAccount(token));
        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
    }, [navigation]);


    const styles = StyleSheet.create({
        cardStyle: {
            width: '95%',
            backgroundColor: '#eee',
            borderRadius: 30,
            padding: 10,
            margin: 10
        }
    });

    const renderData = (item) => {
        return(
            <View style={styles.cardStyle}>
                <Text>{item.id}</Text>
                <Text>{item.user_ID}</Text>
                <Text>{item.title}</Text>
                <Text>{item.main_image_url}</Text>
            </View>
        )
    }

    return(
        <FlatList
        data = {data}
        renderItem = {({item}) => {
            return renderData(item)
        }}
        keyExtractor = {item => `${item.id}`}
        />
)

    
}

export default Recipe