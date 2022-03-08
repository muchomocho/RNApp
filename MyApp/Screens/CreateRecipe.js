import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert } from 'react-native';
import CustomButton from "../Components/CustomButton";
import CustomInput from "../Components/CustomInput";

function CreateRecipe() {

    const user_ID = 'test_user_id'
    const main_image_url = 'http://google.com'
    const [title, setTitle] = useState('');
    const [resp, setRespData] = useState('');

    const createRecipe = async () => {
        try {
            const response = await fetch(global.root + '/api/recipes/', {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_ID: user_ID,
                    title: title,
                    main_image_url: main_image_url
                })
            });
            const json = await response.json();
            console.log(json);
            setRespData(json);

            if (response.status == 201) {
                console.warn('created!')
            } else {
                console.warn(json)
            }
          } catch (error) {
            console.warn(error);
          } 
    }

    const styles = StyleSheet.create({
        cardStyle: {
            width: '95%',
            backgroundColor: '#eee',
            borderRadius: 30,
            padding: 10,
            margin: 10
        }
    });

    return(
        <View>
            <CustomInput
            value={title}
            setValue={setTitle}
            placeholder={'Enter recipe title'}
            />

            <CustomButton 
            onPress={createRecipe} 
            text={'submit'}
            />
        </View>
)

    
}

export default CreateRecipe