import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Constant from '../Constant/Constant'
import * as Authentication from "../Authentication/Authentication";
import * as APIrequest from "../API/ServerRequest";
import CustomInput from "../Components/CustomInput";
import CustomButton from "../Components/CustomButton";

function CreateProfile({ navigation, isupdate }) {

    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');

    const [nameWarning, setNameWarning] = useState('');
    const [ageWarning, setAgeWarning] = useState('');
    const [genderWarning, setGenderWarning] = useState('');

    const [isNameValid, setIsNameValid] = useState(true);
    const [isAgeValid, setIsAgeValid] = useState(true);

    // https://reactnative.dev/docs/network
    const createUserProfile = async () => {
        try {
            const username = await Authentication.getUsername();
            const result = await APIrequest.httpRequest({
                endpoint: 'api/useraccounts/' + username + '/userdata/',
                method: "POST",
                body: {
                    name: name,
                    age: age,
                    gender: gender,
                },
                isAuthRequired: true,
              });
            if (result.response.status == 201) {
              navigation.navigate('Profile');
            }
            if (result.response.status == 400) {
              if (Object.prototype.hasOwnProperty.call(result.json, 'name') && result.json.name.length > 0)
                setNameWarning(result.json.name);

              if (Object.prototype.hasOwnProperty.call(result.json,'age') && result.json.age.length > 0)
                setAgeWarning(result.json.age);

              if (Object.prototype.hasOwnProperty.call(result.json,'gender') && result.json.gender.length > 0)
                setGenderWarning(result.json.gender);
            }
          } catch (error) {
            console.error(error);
          } 
    };

    const onSubmit = () => {
        if (validate(name, age, gender)) {
          createUserProfile();
        }
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

    const warning = (warningArray) => {
      if (warningArray == '') return
      return (warningArray.map((element, index) => 
            <Text key={index}> {element} </Text>
          ));
    };

    return (
        <View style={styles.container}>

          { 
          // conditional rendering
          !isNameValid && 
          <Text style={styles.alert}>
            Enter name properly!
          </Text>
          }

          { warning(nameWarning) }

          <CustomInput 
          value = {name}
          setValue={setName}
          placeholder={"Enter your name"}
          />
          
          { warning(ageWarning) }

          <CustomInput 
          value = {age}
          setValue={setAge}
          placeholder={"Enter your age"}
          />

          <Text> Enter your gender </Text>

          {/* https://github.com/react-native-picker/picker */}
          <Picker
            selectedValue={gender}
            style={{ height: 50, width: 150 }}
            onValueChange={(itemValue, itemIndex) => setGender(itemValue)}
          >
            <Picker.Item label="Male" value="M" />
            <Picker.Item label="Female" value="F" />
            <Picker.Item label="Other" value="O" />
          </Picker>

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