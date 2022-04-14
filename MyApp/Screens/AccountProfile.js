import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert } from 'react-native';
import * as Constant from '../Constant/Constant'
import * as Authentication from "../Authentication/Authentication";
import CustomButton from "../Components/CustomButton";
import CreateProfile from "./CreateProfile";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as APIRequest from '../API/ServerRequest';
import { TouchableOpacity } from "react-native";

// https://reactnative.dev/docs/navigation
const Stack = createNativeStackNavigator();

function AccountProfile({ navigation }) {

    const [data, setData] = useState([]);
    const [isLoggedin, setIsLoggedin] = useState(false);

    const getUserProfile = async () => {
        
        try {
            const username = await Authentication.getUsername();
            console.log(username)
            if (username == '' || username == null || username == undefined) 
                return false
            const endpoint = 'api/useraccounts/' + username + '/userprofile/';
            const result = await APIRequest.httpRequest({
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
            setIsLoggedin(true);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    };

    // https://reactnavigation.org/docs/function-after-focusing-screen/
    // function is called when screen is focused (switched onto)
    useEffect(() => {
        const reload = navigation.addListener('focus', () => {
            getUserProfile()
            .then(result => { 
                console.log('result', result)
                if (result === false) {
                    setIsLoggedin(result)
                }
             });
        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
    }, [navigation]);

    const useraccountTab = () => {
        return(
            <View style={[styles.account, styles.header]}>
                <Text style={styles.accountText}>
                    Username: {data.username}
                </Text>
                <Text style={styles.accountText}>
                    email: {data.email}
                </Text>
            </View>
        );
    
    };

    const renderData = (item) => {
        return(
            <TouchableOpacity 
            style={styles.peopleTab}
            onPress={()=>{navigation.navigate('User record', {userdata: item})}}>
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
            </TouchableOpacity>
        )
    }

    const subuserTab = () => {
        if (isLoggedin && data !== undefined) {
            return (
            <FlatList
                style={styles.container}

                // top of list
                ListHeaderComponent={
                    useraccountTab()
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
            );
        }
    };

    const deviceUserRenderData = (item) => {
        return(
            <TouchableOpacity 
            style={styles.peopleTab}
            >
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
            </TouchableOpacity>
        )
    };

    const deviceUserTab = () => {
        console.log('render')
        return(
            <View>
            <FlatList
            ListHeaderComponentStyle={
                <View style={[styles.account, styles.header]}>
                    <Text style={styles.accountText}>
                        Record saved on the device
                    </Text>
                </View> 
            }

            data = {data.people}
                renderItem = {({item}) => {
                    return deviceUserRenderData(item)
                }}
                keyExtractor = {item => `${item.id}`}
            />
            </View>
        );
    };

    // https://reactnative.dev/docs/flatlist
    return(
        <View style={styles.container}>
            { subuserTab() }
            { deviceUserTab() } 
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