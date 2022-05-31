import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, FlatList, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Constant from '../Constant/Constant'
import * as Authentication from "../Authentication/Authentication";
import * as APIrequest from "../API/ServerRequest";
import CustomInput from "../Components/CustomInput";
import CustomButton from "../Components/CustomButton";
import { useSelector, useDispatch } from 'react-redux';
import { backgroundColor } from "react-native/Libraries/Components/View/ReactNativeStyleAttributes";
import ProfileIcon from "../Components/ProfileIcon";


function CreateProfile(props) {
    const { user, currentSubuser, subuserArray } = useSelector(state => state.user);
    const [name, setName] = useState(props.route.params.isUpdate && currentSubuser != undefined ? currentSubuser.name : '');
    const [dob, setDob] = useState(props.route.params.isUpdate && currentSubuser != undefined ? new Date(currentSubuser.date_of_birth) : new Date());
    const [gender, setGender] = useState(props.route.params.isUpdate && currentSubuser != undefined ? currentSubuser.gender : 'M');
    const [iconNumber, setIconNumber] = useState(props.route.params.isUpdate && currentSubuser != undefined ? currentSubuser.icon_number : 0)
    const [iconBackground, setIconBackground] = useState(props.route.params.isUpdate && currentSubuser != undefined ? currentSubuser.icon_background : 0)

    const [showDatePicker, setShowDatePicker] = useState(false);

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
                endpoint: props.route.params.isUpdate ? `api/useraccounts/${username}/subuser/${currentSubuser.id}/` : `api/useraccounts/${username}/subuser/`,
                method: props.route.params.isUpdate ? "PUT" : "POST",
                body: {
                    name: name,
                    date_of_birth: `${dob.getFullYear()}-${dob.getMonth()+1}-${dob.getDate()}`,
                    gender: gender,
                    icon_number: iconNumber,
                    icon_background: iconBackground
                },
                isAuthRequired: true,
                navigation: props.navigation
              });

            if (!props.route.params.isUpdate && result.response.status == 201 ||
              props.route.params.isUpdate && result.response.status == 200
              ) {
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
      date.setFullYear(dateObj.getFullYear());
      date.setMonth(dateObj.getMonth());
      date.setDate(dateObj.getDate());
      setDob(dateObj);
      
      setShowDatePicker(false);
    };

    const switchShowDatePicker = () => {
      setShowDatePicker(true);
    };

    const iconNumberPicker = () => {
      const icons = [
        { id: 0, req: require('../assets/icons/profIcons/proficon0.png')},
        { id: 1, req: require('../assets/icons/profIcons/proficon1.png')},
        { id: 2, req: require('../assets/icons/profIcons/proficon2.png')},
        { id: 3, req: require('../assets/icons/profIcons/proficon3.png')},
        { id: 4, req: require('../assets/icons/profIcons/proficon4.png')},
        { id: 5, req: require('../assets/icons/profIcons/proficon5.png')},
        { id: 6, req: require('../assets/icons/profIcons/proficon6.png')},
        { id: 7, req: require('../assets/icons/profIcons/proficon7.png')}
      ];
      const onPress = (id) => {
        setIconNumber(id)
      };
      const renderData = ({item}) => {
        return ( 
          <TouchableOpacity 
            style={{width: 50, height: 50, margin: 5, borderWidth: 2, borderRadius: 5, borderColor: item.id === iconNumber ? '#000' : '#aaa'}}
            onPress={()=>{onPress(item.id)}}
          >
            <Image source={item.req} style={{ width: '100%',
                height: undefined,
                aspectRatio: 1,}} 
            />
          </TouchableOpacity>
        );
      };
      return (
        <FlatList 
        // style={{borderWidth: 2, borderRadius: 5}}
          horizontal
          data={icons}
          renderItem={renderData}
        />
      );
    }

    const iconBackgroundPicker = () => {
      const colors = [
        { id: 0, color: '#fff'},
        { id: 1, color: '#27ad15'},
        { id: 2, color: '#d93909'},
        { id: 3, color: '#f5b42a'},
        { id: 4, color: '#093dd9'},
        { id: 5, color: '#a131bd'},
        { id: 6, color: '#31bdb6'},
        { id: 7, color: '#e3d83b'},
        { id: 8, color: '#000'}
      ];
      const onPress = (id) => {
        setIconBackground(id)
      };
      const renderData = ({item}) => {
        return ( 
          <TouchableOpacity 
            style={{backgroundColor: item.color, margin: 5, width: 50, height: 50, borderWidth: 2, borderRadius: 5, borderColor: item.id === iconBackground ? '#000' : '#aaa'}}
            onPress={()=>{onPress(item.id)}}
          >
          </TouchableOpacity>
        );
      };
      return (
        <FlatList 
        // style={{borderWidth: 2, borderRadius: 5}}
          horizontal
          data={colors}
          renderItem={renderData}
        />
      );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
          <Text>These data are necessary to calculate the optimal nutrient values for you.</Text>
          <Text>If you enter your gender as other you will not be able to see the optimal value.</Text>
          <View >
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
            
            { showDatePicker && <DateTimePicker value={dob} onChange={onDateConfirm} maximumDate={new Date()} mode="date" />}

            <Text> Enter your gender </Text>

            {/* https://github.com/react-native-picker/picker */}
            <Picker
              selectedValue={gender}
              style={[{ height: 50, width: 150 }, Platform.OS === 'ios' ? { marginBottom: 50 } : null]}
              onValueChange={(itemValue, itemIndex) => setGender(itemValue)}
            >
              <Picker.Item label="Male" value="M" />
              <Picker.Item label="Female" value="F" />
              <Picker.Item label="Other" value="O" />
            </Picker>
            
            <View style={{width: 100, alignSelf: 'center'}}>
              <Text>Icon</Text>
              <ProfileIcon iconNumber={iconNumber} iconBackground={iconBackground} />
            </View>
            { iconNumberPicker() }
            { iconBackgroundPicker() }

            <CustomButton onPress={onSubmit} text={'submit'}/>
          </View>
        </ScrollView>
    )  
}

const styles = StyleSheet.create({
    input: {
        width: '100%'
    },

    container: {
      flex: 1,
      padding: 20,
      marginTop: 20,
      alignItems: 'stretch',
      justifyContent: 'center',
      backgroundColor: '#fff'
    },

    alert: {
      color: '#ff0000'
    }
  });

export default CreateProfile