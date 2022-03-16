import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert } from 'react-native';
import CustomButton from "../Components/CustomButton";
import CustomInput from "../Components/CustomInput";
import GlobalConstant from "../Global";

function CreateRecipe() {

    const [username, setUsername] = useState('');
    const main_image_url = 'http://google.com';
    const [title, setTitle] = useState('');
    const [steps, setSteps] = useState([]);
    var recipeID = -1;

    useEffect(() => { setUsername(GlobalConstant.username) }, [username]);

    const createRecipe = async () => {
        console.log('global username: ', GlobalConstant.username);
        console.log('set username: ', username);

        if (username.length == 0) {
            console.warn('requires login');
            return
        }
        try {
            const response = await fetch(GlobalConstant.rootUrl + '/api/recipes/', {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    title: title,
                    main_image_url: main_image_url
                })
            });
            const json = await response.json();
            console.log('response: ', json);
            console.log('response id: ', json.id);
            recipeID = json.id;

            if (response.status == 201) {
                console.warn('created!')
            } else {
                console.warn(json)
            }
          } catch (error) {
            console.warn(error);
          } 
    };

    const createSteps = async () => {
        setSteps((steps) => {
            steps.map(item => item.recipe_ID = recipeID);
        });

        try {
            const response = await fetch(GlobalConstant.rootUrl + '/api/recipesteps/', {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item
                })
            });
            const json = await response.json();
            console.log('response: ', json);
            console.log('response id: ', json.id);

            if (response.status == 201) {
                console.warn('created!')
            } else {
                console.warn(json)
            }
          } catch (error) {
            console.warn(error);
          } 
    };

    const a = () => {
        createRecipe()
        .then(createSteps);
    };

    const addStep = () => {
        setSteps([...steps, {
                step_number: steps.length + 1,
                text: ''
        }]);
    };

    const updateStep = (item, newText) => {
        const index = item.step_number-1
        var newItem = item;
        newItem.text = newText;
        /*
        console.log([
            ...steps.slice(0, index),
            newItem,
            ...steps.slice(index+1)
        ]);
        */

        setSteps(
            [
                ...steps.slice(0, index),
                newItem,
                ...steps.slice(index+1)
            ]);
    }

    const deleteStep = (item) => {
        const index = item.step_number-1;
        var laterStep = steps.slice(index+1);
        laterStep.map(step => {step.step_number -= 1;})

        setSteps(
            [
                ...steps.slice(0, index),
                ...laterStep
            ]);
    }

    const renderStepsData = (item) => {
        return(
            <View style={[styles.steps, styles.shadow]}>
                <Text>{item.step_number}</Text>
                <CustomInput 
                value={item.text}
                setValue={(text)=>{updateStep(item, text)}}
                />
                <CustomButton 
                text={'delete'}
                onPress={()=>{deleteStep(item)}}
                />
            </View>
        )
    }

    return(
    
        <View style={styles.container}>
        
            <FlatList
            ListHeaderComponent={
                <CustomInput
                value={title}
                setValue={setTitle}
                placeholder={'Enter recipe title'}
            />
            }
            style={styles.list}
            data = {steps}
            renderItem = {({item}) => (
                renderStepsData(item)
            )}
            keyExtractor = {item => `${item.step_number}`}

            ListFooterComponent={
                <View style={styles.buttonContainer}>
                <CustomButton
                style={styles.button}
                onPress={addStep}
                text={'+'}
                />

                <CustomButton 
                onPress={a} 
                text={'submit'}
                />
                </View>
            }
            />
            
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        backgroundColor: '#fff',
        paddingBottom: 100,
    },

    list: {
        flex: 1,
        backgroundColor: '#fff'
    },

    buttonContainer: {
        flexDirection: 'column'
    },

    button: {
        height: 50,
        width: '10%'
    },

    steps: {
        width: '95%',
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        margin: 10,
    },

    shadow: {
        shadowColor: '#fff',
        shadowRadius: 20,
        shadowOpacity: 0.2,

        shadowOffset: {
            width: 0,
            height: 5
        },
    },
});

export default CreateRecipe