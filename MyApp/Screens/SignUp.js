import { enableExpoCliLogging } from "expo/build/logs/Logs";
import React, { Component, useState, useEffect } from "react";
import { StyleSheet, Text, View, Button } from 'react-native';
import CustomInput from "../Components/CustomInput";
import CustomButton from "../Components/CustomButton";
import GlobalConstant from "../Global"

function SignUp ({ navigation }) {

    
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('');
    const [password1, setPassword1] = useState('')
    const [password2, setPassword2] = useState('')

    const [isUsernameValid, setIsUsernameValid] = useState(true)
    const [isPasswordValid, setIsPasswordValid] = useState(true)
    const [isEmailValid, setIsEmailValid] = useState(true)
    const [isUserTaken, setIsUserTaken] = useState(true)

    const validate = (username, email, password1, password2) => {
      var isValid = true;
      if (username.length === 0) {
        setIsUsernameValid(false)
        isValid = false
      } else {
        setIsUsernameValid(true)
      }

      if (email.length === 0) {
        setIsEmailValid(false)
        isValid = false
      } else {
        setIsEmailValid(true)
      }

      if (password1.length === 0 || password1 != password2) {
        setIsPasswordValid(false)
        isValid = false
      } else {
        setIsPasswordValid(true)
      }

      return isValid
    }

    const createUser = async () => {
      if (validate(username, email, password1, password2)) {
        try {
          console.log(GlobalConstant.rootUrl);
            const response = await fetch(GlobalConstant.rootUrl + 'api/useraccounts/', {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password1
                })
            });
            const json = await response.json();
            console.log(json);

            if (response.status == 201) {
              console.warn('created!')
            } else if (response.status === 400) {
              console.warn('user already exists')
            } else {
              console.warn(json)
            }
          } catch (error) {
            console.warn(error);
          }
        }
      }
    

    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
      const reload = navigation.addListener('blur', () => {
        // The screen is focused
        // Call any action
      });
  
      // Return the function to unsubscribe from the event so it gets removed on unmount
      return reload;
    }, [navigation]);

    return (
        <View style={styles.container}>

          { 
          // conditional rendering
          !isUsernameValid && 
          <Text style={styles.alert}>
            Enter user id properly!
          </Text>
          }

          <CustomInput 
          value = {username}
          setValue={setUsername}
          placeholder={"Enter User id you want to set."}
          />

          {
          !isEmailValid &&
          <Text style={styles.alert}>
              Enter email properly!
          </Text>
          }
          
          <CustomInput 
          value = {email}
          setValue={setEmail}
          placeholder={"Enter your email."}
          />
          
          {
            !isPasswordValid &&
            <Text style={styles.alert}>
            Enter password properly!
            </Text>
          }
      
          <CustomInput 
          value = {password1}
          setValue={setPassword1}
          placeholder={"Enter Password"}
          isSecure={true}
          />

          <CustomInput 
          value = {password2}
          setValue={setPassword2}
          placeholder={"Enter password again"}
          isSecure={true}
          />

          <CustomButton onPress={createUser} text={'sign in'}/>
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

    alert: {
      color: '#ff0000'
    }
  });

export default SignUp