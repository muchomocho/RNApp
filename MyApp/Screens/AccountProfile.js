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

import { useSelector, useDispatch } from 'react-redux';
import { setSubuserArray, setCurrentSubuser, setUser, setLogout } from '../redux/actions'

// https://reactnative.dev/docs/navigation
const Stack = createNativeStackNavigator();

function AccountProfile({ navigation }) {

    const { user, curerentSubuser, subuserArray } = useSelector(state => state.userReducer);
    const dispatch = useDispatch();

    const getUserProfile = async () => {
        
        try {
            const refreshToken = await Authentication.getStoredRefreshToken();
            const username = await Authentication.getUsername();

            if (username == '' || username == null || username == undefined) {
                return
            }
            const endpoint = 'api/useraccounts/' + username + '/userprofile/';
            const result = await APIRequest.httpRequest({
                method: 'GET',
                endpoint: endpoint,
                isAuthRequired: true
            });
            console.log('status= ', result.response.status);
            if (result.response.status === 401) {
                Authentication.logOut();
                return false
            }
            
            console.log('response json: ', result.json);
            const load_user = {
                id: result.json.id,
                username: result.json.username,
                email: result.json.email
            };
            dispatch(setUser(load_user));
            dispatch(setSubuserArray(result.json.people));

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
            getUserProfile();
        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
    }, [navigation]);

    const useraccountTab = () => {

        return(
            <View style={[styles.account, styles.header]}>
                <View style={styles.accountChild}>
                    <Text style={styles.accountText}>
                        Username: {user.username}
                    </Text>
                    <Text style={styles.accountText}>
                        email: {user.email}
                    </Text>
                </View>
                <View style={styles.accountChild}>
                    <CustomButton
                        text={'logout'}
                        buttonStyle={styles.logoutButton}
                        onPress={async () => { 
                            try {
                                Authentication.logOut();
                                dispatch(setLogout()); 
                                navigation.navigate('Sign in') 
                            } catch (error) {}
                        }}
                    />
                </View>
            </View>
        );
    
    };

    const renderData = (item) => {
        return(
            <TouchableOpacity 
            style={styles.peopleTab}
            onPress={()=>{
                dispatch(setCurrentSubuser(item))
                navigation.navigate('User record', {userdata: item})
                }}>
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
        console.log(user)
        if (user.username !== '' && user.username !== null) {
            return (
            <FlatList
                style={styles.container}

                // top of list
                ListHeaderComponent={
                    useraccountTab()
                }
                
                // main list content
                data = {subuserArray}
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

            data = {subuserArray}
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
        paddingVertical: 10,
        paddingHorizontal: 20,
        margin: 10,
        flexDirection: 'row',
    },
    accountText:{
        color: '#fff'
    },

    accountChild: {
        justifyContent: 'center',
        flex: 1
    },

    logoutButton: {
        //backgroundColor: '#000',
        borderColor: '#fff',
        width: '50%',
        borderWidth: 2,
        alignSelf: 'flex-end'
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