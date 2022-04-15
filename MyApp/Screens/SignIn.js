import { enableExpoCliLogging } from "expo/build/logs/Logs";
import React, { Component, useState } from "react";
import { StyleSheet, Text, View, Button } from 'react-native';
import CustomInput from "../Components/CustomInput";
import CustomButton from "../Components/CustomButton";
import * as Authentication from "../Authentication/Authentication";

import { useSelector, useDispatch } from 'react-redux';
import { setUsername } from '../redux/actions'

function Signin ({ navigation }) {

    const [username, setInputUsername] = useState('')
    const [password, setInputPassword] = useState('')

    const dispatch = useDispatch();
    
    const onSignIn = async () => {
        console.log('sign in attempt')

        try {
            const isLoginSuccess = await Authentication.fetchToken(username, password);
            console.log('login',isLoginSuccess)
            if (isLoginSuccess) {
                console.log('nav')
                dispatch(setUsername(username));
                navigation.navigate('Profile');
            }
        } catch (error) {

        }
    }

    return (
        <View style={styles.container}>
            <Text>
                Hello from Home!
            </Text>

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
            <CustomButton onPress={() => { navigation.navigate('Sign up') }} text={'sign up'}/>
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