import { enableExpoCliLogging } from "expo/build/logs/Logs";
import React, { Component, useState, useEffect } from "react";
import { StyleSheet, Text, View, Button } from 'react-native';
import CustomInput from "../Components/CustomInput";
import CustomButton from "../Components/CustomButton";
import * as Authentication from "../Authentication/Authentication";

import { useSelector, useDispatch } from 'react-redux';
import { setUsername } from '../redux/userSlice'

function Signin ({ navigation }) {
    
    const [username, setInputUsername] = useState('')
    const [password, setInputPassword] = useState('')
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const dispatch = useDispatch();

    const reset = () => {
        setInputPassword('');
        setInputUsername('');
    };

    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
        const reload = navigation.addListener('blur', () => {
          // The screen is focused
          // Call any action
          reset();
        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
      }, [navigation]);
    
    const onSignIn = async () => {

        try {
            const isLoginSuccess = await Authentication.fetchToken(username, password);
            if (isLoginSuccess) {
                dispatch(setUsername(username));
                navigation.navigate('Profile');
            }
            else {
                setIsLoggedIn(false);
            }
        } catch (error) {
            setIsLoggedIn(false);
        }
    }

    const warningText = () => {
        if (isLoggedIn) {
            return (
                <Text> username or password is incorrect </Text>
            );
        }
    };

    return (
        <View style={styles.container}>
            <Text>
                Hello from Home!
            </Text>

            {
                warningText()
            }

            <CustomInput 
            value = {username}
            setValue={setInputUsername}
            placeholder={"Username"}
            />

            <CustomInput 
            value = {password}
            setValue={setInputPassword}
            placeholder={"Password"}
            isSecure={true}
            />

            <CustomButton onPress={onSignIn} text={'sign in'}/>
            <CustomButton onPress={() => { navigation.navigate('Sign up', { isupdate: false }) }} text={'sign up'}/>
        </View>
    )
}

const styles = StyleSheet.create({
    input: {
        width: '100%'
    },

    container: {
      flex: 1,
      width: '100%',
      height: '100%',
      padding: 20,
      margin: 0,
      alignItems: 'stretch',
      justifyContent: 'center',
      backgroundColor: '#fff'
    },
  });

export default Signin