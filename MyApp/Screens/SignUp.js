import { enableExpoCliLogging } from "expo/build/logs/Logs";
import React, { Component, useState, useEffect } from "react";
import { StyleSheet, Text, View, Alert } from 'react-native';
import CustomInput from "../Components/CustomInput";
import CustomButton from "../Components/CustomButton";
import * as Constant from "../Constant/Constant";
import * as APIRequest from '../API/ServerRequest';
import { useSelector, useDispatch } from 'react-redux';
import Authentication from '../Authentication/Authentication'

function SignUp (props) {

  const { user } = useSelector(state => state.user);
  
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('');
    const [password1, setPassword1] = useState('')
    const [password2, setPassword2] = useState('')

    const [usernameWarning, setUsernameWarning] = useState([])
    const [emailWarning, setEmailWarning] = useState([])
    const [passwordWarning, setPasswordWarning] = useState([])

    const [isUsernameValid, setIsUsernameValid] = useState(true)
    const [isPasswordValid, setIsPasswordValid] = useState(true)
    const [isEmailValid, setIsEmailValid] = useState(true)

    const reset = () => {
      setUsername('')
      setEmail('')
      setPassword1('')
      setPassword2('')
      setUsernameWarning('')
      setEmailWarning('')
      setPasswordWarning('')
      setIsUsernameValid(true)
      setIsPasswordValid(true)
      setIsEmailValid(true)
    }

    const validate = (username, email, password1, password2) => {
      var isValid = true;

      if (!props.route.params.isupdate && username.length === 0) {
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
          var result = null;
          if (props.route.params.isupdate) {
            result = await APIRequest.httpRequest({
              method: 'PUT',
              endpoint: `api/useraccounts/${user.username}/`,
              body: {
                email: email,
                password: password1
              },
              isAuthRequired: true,
              navigation: props.navigation
            });
          }
          else {
            result = await APIRequest.httpRequest({
              method: 'POST',
              endpoint: 'api/useraccounts/',
              body: {
                username: username,
                email: email,
                password: password1
              },
              navigation: props.navigation
            });
          }
            if (!props.route.params.isupdate && result.response.status == 201 || props.route.params.isupdate && result.response.status == 200) {
              props.navigation.navigate('Profile')
            } else if (result.response.status === 400) {
              if (Object.prototype.hasOwnProperty.call(result.json, 'username') && result.json.username.length > 0)
                setUsernameWarning(result.json.username);

              if (Object.prototype.hasOwnProperty.call(result.json,'email') && result.json.email.length > 0)
                setEmailWarning(result.json.email);

              if (Object.prototype.hasOwnProperty.call(result.json,'password') && result.json.password.length > 0)
                setPasswordWarning(result.json.password);
            } else {

            }
          } catch (error) {
            return Alert.alert(
              "Network error",
              "Creation was unsuccessful",
              [
                  { 
                      text: "OK", 
                      onPress: () => { 
                      }
                  },
              ]
            );
          }
        }
    }

    const deleteUser = async () => {
      try {
        var result = null;
        if (props.route.params.isupdate) {
          result = await APIRequest.httpRequest({
            method: 'DELETE',
            endpoint: `api/useraccounts/${user.username}/`,
            isAuthRequired: true,
            navigation: props.navigation
          });
        }
          if (result.response.status == 204) {
            Authentication.logOut(props.navigation);
            props.navigation.navigate('Profile')
          } 
        } catch (error) {
          return Alert.alert(
            "Network Error",
            "Delete was unsuccessful",
            [
                { 
                    text: "OK", 
                    onPress: () => { 
                    }
                },
            ]
          );
        }
    };


    const warning = (warningArray) => {
      if (warningArray == '') return
      return (warningArray.map(element => 
            <Text style={{color: '#d93909'}}>a {element} </Text>
          ));
    };
    

    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
      const reload = props.navigation.addListener('blur', () => {
        // The screen is focused
        // Call any action
        reset();
      });
  
      // Return the function to unsubscribe from the event so it gets removed on unmount
      return reload;
    }, [props]);

    if (props.route.params.isupdate) {
      return (
        <View style={styles.container}>

          {
          !isEmailValid &&
          <Text style={styles.alert}>
              email cannot be empty and must be some@thing.com format.
          </Text>
          }

          { warning(emailWarning) }
          
          <CustomInput 
          value = {email}
          setValue={setEmail}
          placeholder={"Enter your email."}
          />
          
          {
            !isPasswordValid &&
            <Text style={styles.alert}>
            Password cannot be empty
            </Text>
          }

          { warning(passwordWarning) }
      
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

          <CustomButton onPress={createUser} text={'submit'}/>

          {
            props.route.params.isupdate &&
            <CustomButton 
            text='delete'
            onPress={()=>{
              return Alert.alert(
                "Warning",
                "Are you sure you wan to delete?",
                [
                    { 
                        text: "OK", 
                        onPress: () => { 
                            deleteUser(); 
                        }
                    },
                    {
                        text: "cancel",
                        onPress: () => {}
                    }
                ]
              );
            }}
            />
          }
        </View>
      );
    }

    return (
        <View style={styles.container}>

          { 
          // conditional rendering
          !isUsernameValid && 
          <Text style={styles.alert}>
            Username cannot be empty, must be over 6 characters and only contain characters which are alphanumeric, underscore or hyphen
          </Text>
          }

          { warning(usernameWarning) }

          <CustomInput 
          value = {username}
          setValue={setUsername}
          placeholder={"Enter User id you want to set."}
          />

          {
          !isEmailValid &&
          <Text style={styles.alert}>
              email cannot be empty and must be some@thing.com format.
          </Text>
          }

          { warning(emailWarning) }
          
          <CustomInput 
          value = {email}
          setValue={setEmail}
          placeholder={"Enter your email."}
          />
          
          {
            !isPasswordValid &&
            <Text style={styles.alert}>
            Password cannot be empty
            </Text>
          }

          { warning(passwordWarning) }

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

          <CustomButton onPress={createUser} text={'submit'}/>
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