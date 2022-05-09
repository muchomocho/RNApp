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
import { setSubuserArray, setCurrentSubuser, setUser, setLogout } from '../redux/userSlice'
import { clearAllFoodData } from "../redux/foodDataSlice";
import { clearRecord } from "../redux/mealRecordSlice";
import LoadingView from "../Components/LoadingView";
import LogoutAlert from "../Components/LogoutAlert/LogoutAlert";

function AccountProfile(props) {
    
    const { user, currentSubuser, subuserArray } = useSelector(state => state.user);
    const [loggedIn, setLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();

    const deleteSubUser = async (subusername) => {
        try {
            const endpoint = 'api/useraccounts/' + username + '/userprofile/' + subusername + '/';
            const result = await APIRequest.httpRequest({
                method: 'DELETE',
                endpoint: endpoint,
                isAuthRequired: true,
                navigation: props.navigation
            });
        } catch (error) {
            failAlert();
        }
    };
    
    const failAlert = () => {
        return Alert.alert(
            "Error",
            "Could not complete action",
            [
              { text: "OK", onPress: () => {} }
            ]
          );
    };

    const deleteSubUserAlert = (subusername) => {
        return Alert.alert(
            "Warning",
            "Are you sure you wan to delete?",
            [
              { text: "OK", onPress: () => { deleteSubUser(subusername); getUserProfile(); } }
            ]
          );
    };

    const onLogout = () => {
        setLoggedIn(false);
        dispatch(setLogout());
        console.log('asdadsa')
        dispatch(clearAllFoodData());
        dispatch(clearRecord());
        Authentication.logOut();
    };

    const getUserProfile = async () => {
        try {
            const username = await Authentication.getUsername();

            if (username == '' || username == null || username == undefined) {
                onLogout();
                return
            }
           
            const endpoint = 'api/useraccounts/' + username + '/userprofile/';
            const result = await APIRequest.httpRequest({
                method: 'GET',
                endpoint: endpoint,
                isAuthRequired: true,
                navigation: props.navigation
            });
  
            if (result.response.status === 401) {
                Authentication.logOut(props.navigation);
                setLoggedIn(false);
                setIsLoading(false);
                return false
            }
            
            const load_user = {
                id: result.json.id,
                username: result.json.username,
                email: result.json.email
            };

            dispatch(setUser(load_user));
            dispatch(setSubuserArray(result.json.people));

            setLoggedIn(true);
            setIsLoading(false);

            return true;
        } catch (error) {
            setLoggedIn(false);
            setIsLoading(false);
            return false;
        }
        
    };

    const reloadHandler = async () => {
        try {
            await getUserProfile();
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
        }
    };
        
    const blurHandler = () => {
        setIsLoading(true);
    };

    // https://reactprops.navigation.org/docs/function-after-focusing-screen/
    // https://stackoverflow.com/questions/67102832/how-to-use-focus-and-blur-listener-in-single-useeffect-react-native
    useEffect(() => {

        props.navigation.addListener('focus', reloadHandler);
        props.navigation.addListener('blur', blurHandler);
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return () => {
            props.navigation.removeListener('focus', reloadHandler)
            props.navigation.removeListener('blur', blurHandler)
        }
    }, [props.navigation]);

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
                            text="edit"
                            buttonStyle={styles.logoutButton}
                            onPress={async () => { 
                                    props.navigation.navigate('Sign up', { isupdate: true }) 
                            }}
                        />
                    <CustomButton
                        text="logout"
                        buttonStyle={styles.logoutButton}
                        onPress={async () => { 
                            try {
                                onLogout()
                                
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
                props.navigation.navigate('User record')
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
                        onPress={()=>{props.navigation.navigate('Create profile')}}
                        />
                    </View>
                }
            />
            );
        }
    };


    if (isLoading) {
        return(
            <LoadingView/>
        )
    }
    if (!isLoading && !loggedIn) {
        return (
            <View style={styles.notLoggedInContainer}>
                {
                    props.route.params.logoutRedirect &&
                    <LogoutAlert navigation={props.navigation}/>
                }
                <View style={styles.notLoggedIn}>
                    <View style={{ alignItems: 'center' }}>
                        <Text> You are not logged in. </Text>
                        <Text> Sign in to see your records. </Text>
                    </View>
                <CustomButton
                    text={'sign in'}
                    onPress={()=>props.navigation.navigate('Sign in')}
                />
                </View>
            </View>
        )
    }
    return(
        <View style={styles.container}>
            {
                props.route.params.logoutRedirect &&
                <LogoutAlert navigation={props.navigation}/>
            }
            { subuserTab() }
        </View>
    );
    
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        //alignContent: 'center'
    },
    header: {
        // marginTop: '15%'
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
        color: '#fff',
        margin: 10
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
    },
    notLoggedInContainer: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notLoggedIn: {
        height: '50%',
        width: '95%',
        padding: 20,
        justifyContent: 'space-evenly',
        backgroundColor: '#fff',
        borderRadius: 5,
        elevation: 3
    }
});

export default AccountProfile