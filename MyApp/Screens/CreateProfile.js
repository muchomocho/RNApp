import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Constant from '../Constant/Constant'
import * as Authentication from "../Authentication/Authentication";
import * as APIrequest from "../API/ServerRequest";
import CustomInput from "../Components/CustomInput";
import CustomButton from "../Components/CustomButton";
import { useSelector, useDispatch } from 'react-redux';


function CreateProfile(props) {
    const { user, currentSubuser, subuserArray } = useSelector(state => state.user);
    console.log(typeof(currentSubuser.date_of_birth))
    const [name, setName] = useState(props.route.params.isUpdate && currentSubuser != undefined ? currentSubuser.name : '');
    const [dob, setDob] = useState(props.route.params.isUpdate && currentSubuser != undefined ? new Date(currentSubuser.date_of_birth) : new Date());
    const [gender, setGender] = useState(props.route.params.isUpdate && currentSubuser != undefined ? currentSubuser.gender : 'Male');

    const [showDatePicker, setShowDatePicker] = useState(false);

    const [nameWarning, setNameWarning] = useState('');
    const [ageWarning, setAgeWarning] = useState('');
    const [genderWarning, setGenderWarning] = useState('');

    const [isNameValid, setIsNameValid] = useState(true);
    const [isAgeValid, setIsAgeValid] = useState(true);

    

    console.log(dob)
    // if (props.route.params.isUpdate) {
    //   setName(currentSubuser.name);
    //   setDob(new Date(currentSubuser.date_of_birth));
    //   setGender(currentSubuser.gender);
    // }

    // https://reactnative.dev/docs/network
    const createUserProfile = async () => {
        try {
            const username = await Authentication.getUsername();
            const result = await APIrequest.httpRequest({
                endpoint: props.route.params.isUpdate ? `api/useraccounts/${username}/subuser/${currentSubuser.id}/` : `api/useraccounts/${username}/subuser/`,
                method: props.route.params.isUpdate ? "PUT" : "POST",
                body: {
                    name: name,
                    date_of_birth: `${dob.getFullYear()}-${dob.getMonth()+1}-${dob.getDate()}`,
                    gender: gender,
                },
                isAuthRequired: true,
                navigation: props.navigation
              });
              console.log(result.json)

            if (result.response.status == 201) {
              props.navigation.navigate('Profile');
            }
            if (result.response.status == 400) {
              if (Object.prototype.hasOwnProperty.call(result.json, 'name') && result.json.name.length > 0)
                setNameWarning(result.json.name);

              if (Object.prototype.hasOwnProperty.call(result.json,'dob') && result.json.dob.length > 0)
                setAgeWarning(result.json.dob);

              if (Object.prototype.hasOwnProperty.call(result.json,'gender') && result.json.gender.length > 0)
                setGenderWarning(result.json.gender);
            }
          } catch (error) {

          } 
    };

    const onSubmit = () => {
        if (validate(name, dob, gender)) {
          createUserProfile();
        }
    }

    const validate = (name, dob, gender) => {
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

    const onDateConfirm = (event, date) => {
      
      const dateObj = new Date(date)
      setDob(dateObj);
      
      setShowDatePicker(false);
    };

    const switchShowDatePicker = () => {
      setShowDatePicker(!showDatePicker);
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
          placeholder="Enter your name"
          />
          
          { warning(ageWarning) }

          <View>
            <Text> { dob.getFullYear() } / { dob.getMonth()+1 } / { dob.getDate() } </Text>
          </View>

          <CustomButton
          onPress={switchShowDatePicker}
          text="Choose your birthday"
          />
          
          { showDatePicker && <DateTimePicker value={dob} onChange={onDateConfirm} mode="date" />}

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