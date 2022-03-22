import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert } from 'react-native';
import GlobalConstant from '../Global/Global'
import * as Authentication from "../Authentication/Authentication";
import CustomButton from "../Components/CustomButton";
import CreateProfile from "./CreateProfile";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// https://reactnative.dev/docs/navigation
const Stack = createNativeStackNavigator();

function AccountProfile({ navigation }) {

    const [data, setData] = useState([]);

    // https://reactnative.dev/docs/network
    const getUserProfile = async (token) => {
        try {
            const response = await fetch(GlobalConstant.rootUrl + 'api/userprofile/' + GlobalConstant.username + '/', {
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

    const createUserPerson = async (token) => {
    };

    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
        const reload = navigation.addListener('focus', () => {
          // The screen is focused
          // Call any action
          Authentication.getStoredAccessToken()
          .then((token) => getUserProfile(token));
        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
    }, [navigation]);


    const styles = StyleSheet.create({
        account:{
            width: '95%',
            backgroundColor: '#561ddb',
            borderRadius: 5,
            padding: 20,
            margin: 10,
        },
        accountText:{
            color: '#fff'
        },
        people: {
            width: '95%',
            backgroundColor: '#fff',
            borderRadius: 5,
            padding: 20,
            margin: 10,

            elevation: 3,
            shadowColor: '#eee',
            shadowRadius: 0,
            shadowOpacity: 0.2,
            shadowOffset: {
                width: 0,
                height: 100
            },
        },
        peopleDetailContainer:{
            flexDirection: 'row',
            borderBottomColor: '#000',
            borderBottomWidth: 0
        },
        peopleTextName:{
            fontSize: 20,
        },
        peopleText: {
            marginLeft: 10,
        }
    });

    const renderData = (item) => {
        return(
            <View style={styles.people}>
                <Text style={styles.peopleTextName}>{item.name}</Text>
                <View style={styles.peopleDetailContainer}>
                    <Text>Age</Text>
                    <Text style={styles.peopleText}>{item.age}</Text>
                </View>
                <View style={styles.peopleDetailContainer}>
                    <Text>Gender</Text>
                    <Text style={styles.peopleText}>{item.gender}</Text>
                </View>
            </View>
        )
    }

    return(
        <View>
        <FlatList
        ListHeaderComponent={
            <View style={styles.account}>
                <Text style={styles.accountText}>
                    {data.username}
                </Text>
                <Text style={styles.accountText}>
                    {data.email}
                </Text>
            </View>
        }
        
        data = {data.people}
        renderItem = {({item}) => {
            return renderData(item)
        }}
        keyExtractor = {item => `${item.id}`}
        
        ListFooterComponent={
            <View>
                <CustomButton
                onPress={()=>{navigation.navigate('CreateProfile')}}
                />
            </View>
        }
        />

        <Stack.Navigator>
            <Stack.Screen name={'createProfile'} component={CreateProfile} />
        </Stack.Navigator>
        </View>
    )

    
}

export default AccountProfile