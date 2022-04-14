import { enableExpoCliLogging } from "expo/build/logs/Logs";
import React, { Component, useState } from "react";
import { StyleSheet, Text, View, Button } from 'react-native';
import CustomInput from "../Components/CustomInput";
import CustomButton from "../Components/CustomButton";
import * as Authentication from "../Authentication/Authentication";

function Signin ({ navigation }) {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    
    const onSignIn = () => {
        console.log('sign in attempt')

        const isLoginSuccess = Authentication.fetchToken(username, password);
        console.log(isLoginSuccess)
        if (isLoginSuccess) 
            navigation.navigate('Profile');

    }

    return (
        <View style={styles.container}>
            <Text>
                Hello from Home!
            </Text>

            <CustomInput 
            value = {username}
            setValue={setUsername}
            placeholder={"Username"}
            />

            <CustomInput 
            value = {password}
            setValue={setPassword}
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