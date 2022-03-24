import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert } from 'react-native';
import GlobalConstant from '../Global/Global'
import * as Authentication from "../Authentication/Authentication";
import CustomButton from "../Components/CustomButton";
import CreateProfile from "./CreateProfile";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as APIRequest from '../Request/APIRequest';

// https://reactnative.dev/docs/navigation
const Stack = createNativeStackNavigator();

function AccountProfile({ navigation }) {

    const [data, setData] = useState([]);

    // https://reactnative.dev/docs/network
    /*
    const getUserProfile = async (token) => {
        try {
            const urlEnding = (GlobalConstant.username.length > 0) ? (GlobalConstant.username + '/') : ''
            const response = await fetch(GlobalConstant.rootUrl + 'api/userprofile/' + urlEnding, {
                method: "GET",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token
                  },
            });
            const json = await response.json();
            console.log(json)
            console.log(json.code)
            console.log(json.code === 'token_not_valid')
            if (json.code === 'token_not_valid') {
                return false;
            }
            setData(json);
            return true;
          } catch (error) {
            console.error(error);
            return false;
          } 
    };*/

    const getUserProfile = async () => {
        try {
            const endpoint = 'api/userprofile/' + ((GlobalConstant.username.length > 0) ? (GlobalConstant.username + '/') : '');
            const result = await APIRequest.apiRequest({
                method: 'GET',
                endpoint: endpoint,
                isAuthRequired: true
            });
            console.log('status= ', result.response.status);
            if (result.response.status === 401) {
                console.log('unauth')
                return false
            }
            
            console.log('response json: ', result.json);
            setData(result.json);
        } catch (error) {console.log(error);}
    };

    // https://reactnavigation.org/docs/function-after-focusing-screen/
    // function is called when screen is focused (switched onto)
    useEffect(() => {
        const reload = navigation.addListener('focus', () => {
            getUserProfile()
            .then(result => { 
                console.log('result', result)
                if (result === false) {
                    navigation.navigate('Sign in');
                }
             });
        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
    }, [navigation]);

    const renderData = (item) => {
        return(
            <View style={styles.peopleTab}>
                <View style={styles.iconContainer}>
                </View>
                <View style={styles.peopleDetailContainer}>
                    <Text style={styles.peopleTextName}>{item.name}</Text>
                    <View style={styles.labelContainer}>
                        <Text>Age</Text>
                        <Text style={styles.peopleText}>{item.age}</Text>
                    </View>
                    <View style={styles.labelContainer}>
                        <Text>Gender</Text>
                        <Text style={styles.peopleText}>{item.gender}</Text>
                    </View>
                </View>
            </View>
        )
    }

    // https://reactnative.dev/docs/flatlist
    return(
        <View >
            <FlatList
            style={styles.container}

            // top of list
            ListHeaderComponent={
                <View style={[styles.account, styles.header]}>
                    <Text style={styles.accountText}>
                        Username: {data.username}
                    </Text>
                    <Text style={styles.accountText}>
                        emal: {data.email}
                    </Text>
                </View>
            }
            
            // main list content
            data = {data.people}
            renderItem = {({item}) => {
                return renderData(item)
            }}
            keyExtractor = {item => `${item.id}`}
            
            // bottom of list
            ListFooterComponent={
                <View style={styles.footer}>
                    <CustomButton
                    buttonStyle={styles.button}
                    text={'create new'}
                    onPress={()=>{navigation.navigate('CreateProfile')}}
                    />
                </View>
            }
            />
        </View>
    );
    
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        //alignContent: 'center'
    },
    header: {
        marginTop: '15%'
    },
    footer: {
        alignItems: 'center',
        marginBottom: '30%'
    },
    account:{
        backgroundColor: '#561ddb',
        borderRadius: 5,
        padding: 20,
        margin: 10,
    },
    accountText:{
        color: '#fff'
    },
    iconContainer: {
        flex: 1,
        backgroundColor: '#eee',
        borderRadius: 100
    },
    peopleTab: {
        flexDirection: 'row',
        height: 100,
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
    peopleDetailContainer: {
        flex: 2,
        margin: 0, 
        //backgroundColor: '#000',
        marginLeft: '10%',
        //alignContent: 'center',
        //alignItems: 'center'
    },
    labelContainer:{
        flexDirection: 'row',
        borderBottomColor: '#000',
        borderBottomWidth: 0
    },
    peopleTextName:{
        fontSize: 20,
    },
    peopleText: {
        marginLeft: 10,
    },
    button: {
        width: '95%',
    }
});

export default AccountProfile