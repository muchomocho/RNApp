import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert } from 'react-native';
import * as Constant from '../Constant/Constant'
import * as Authentication from "../Authentication/Authentication";
import * as APIrequest from "../API/ServerRequest";
import CustomInput from "../Components/CustomInput";
import CustomButton from "../Components/CustomButton";

function CreateProfile({ navigation }) {

    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');

    const [isNameValid, setIsNameValid] = useState(false); 

    // https://reactnative.dev/docs/network
    const createUserProfile = async (token) => {
        try {
            const username = await Authentication.getUsername();
            const result = await APIrequest.httpRequest({
                endpoint: Constant.ROOT_URL + 'api/useraccounts/' + username + '/userdata/',
                method: "POST",
                body: {
                    name: name,
                    age: age,
                    gender: gender,
                }
              });
            if (result.response.status == 201) {
              console.log('status', result.response.status)
              navigation.navigate('Profile');
            }
            if (result.response.status == 400) {
              // TODO could not create user
            }
          } catch (error) {
            console.error(error);
          } 
    };

    const onSubmit = () => {
        Authentication.getStoredAccessToken()
        .then((token)=>{createUserProfile(token)})
    }

    const validate = (name, age, gender) => {
        var isValid = true;
        if (name.length === 0) {
          setIsNameValid(false)
          isValid = false
        } else {
          setIsNameValid(true)
        }
        
        return isValid
      }

    return (
        <View style={styles.container}>

          { 
          // conditional rendering
          !isNameValid && 
          <Text style={styles.alert}>
            Enter name properly!
          </Text>
          }

          <CustomInput 
          value = {name}
          setValue={setName}
          placeholder={"Enter your name"}
          />
          
          <CustomInput 
          value = {age}
          setValue={setAge}
          placeholder={"Enter your age"}
          />
        
          <CustomInput 
          value = {gender}
          setValue={setGender}
          placeholder={"Enter your gender"}
          />

          <CustomButton onPress={onSubmit} text={'submit'}/>
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

export default CreateProfile