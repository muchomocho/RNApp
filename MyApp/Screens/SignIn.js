import { enableExpoCliLogging } from "expo/build/logs/Logs";
import React, { Component, useState } from "react";
import { StyleSheet, Text, View, Button } from 'react-native';
import CustomInput from "../Components/CustomInput";
import CustomButton from "../Components/CustomButton";

function Signin () {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const onSignIn = () => {
        console.warn('sign in')
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
    },
  });

export default Signin