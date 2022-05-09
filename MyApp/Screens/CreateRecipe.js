import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, TextInput } from 'react-native';
import CustomButton from "../Components/CustomButton";
import CustomInput from "../Components/CustomInput";
import * as Constant from "../Constant/Constant";
import * as Authentication from "../Authentication/Authentication"
import TabSwitch from "../Components/TabSwitch";
import { useSelector, useDispatch } from 'react-redux';
import { setRecipeID, setRecipeImage, setSteps, setTags, setTitle, addTag, addStep, addIngredient, updateStep, deleteTag, deleteStep, deleteIngredient } from '../redux/recipeSlice'
import { Checkbox, Chip } from "react-native-paper";


function CreateRecipe() {

    const { 
        id,
        title,
        image,
        steps,
        tags,
        ingredients 
    } = useSelector(state => state.recipe);
    const { user, currentSubuser, subuserArray } = useSelector(state => state.user);
    const [isPrivate, setIsPrivate] = useState(true);
    const [tagText, setTagText] = useState('');

        
    const dispatch = useDispatch();
    const createRecipe = async () => {
        
        try {
            
          } catch (error) {
            console.warn(error);
          } 
    };

    const renderStepsData = (item) => {
        const onUpdate = (text) => {
            dispatch(updateStep({
                old_step_number: item.step_number, 
                step_number: item.step_number,
                text: text
            }));
        };
        const onDelete = () => {
            dispatch(deleteStep(item.step_number))
        };
        return(
            <View style={[styles.steps, styles.shadow]}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10}}>
                    <Text style={{fontSize: 20}}>{item.step_number}</Text>
                    <CustomButton 
                    buttonStyle={{width: 45, height: 45, alignItems: 'center', justifyContent: 'center'}}
                    textStyle={{alignSelf: 'center'}}
                    text={'x'}
                    onPress={onDelete}
                    />
                </View>
                <CustomInput 
                multiline
                value={item.text}
                setValue={onUpdate}
                />
            </View>
        )
    }

    const stepComponent = () => {
        const onAddStep = () => {
            dispatch(addStep());
            dispatch(setRecipeID(1))
        };
        const onTitleChange = (text) => {
            dispatch(setTitle(text));
        };
        return (
            <View style={styles.subContainer}>
                
                <FlatList
                ListHeaderComponent={
                    <CustomInput
                    value={title}
                    setValue={onTitleChange}
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
                    onPress={onAddStep}
                    text={'add step'}
                    />
                    </View>
                }
                />
                
            </View>
        );
    };

    const tagComponent = () => {
        const onAddTag = () => {
            const text = tagText.trim();
            if (text != '')
            dispatch(addTag(text))
        };
        const enterTag = ()=> {
            return (
                <View style={styles.subContainer}>
                    <View style={[styles.steps]}>
                        <CustomInput 
                        value={tagText}
                        setValue={setTagText}
                        />
                        <CustomButton 
                        text="add tag"
                        onPress={onAddTag}
                        />
                    </View>
                </View>
            );
        }
        
        const renderItem = ({item}) => {
            const onClose = () => {
                dispatch(deleteTag(item.text))
            };

            return <Chip style={{margin: 5, flex: 1}} mode="outlined" onClose={onClose}> <Text style={{color:'#000'}}>{ item.text }</Text> </Chip>
        };

        const tagList = () => {
            return (
                <FlatList
                    style={{padding: 10}}
                    numColumns={2}
                    data={tags}
                    renderItem={renderItem}
                    keyExtractor={item => item.text}
                    ListFooterComponent={
                        enterTag()  
                    }
                />
            );
        }
        return (
            <View>
                { tagList() }
                
            </View>
        );
    };

    const ingredientComponent = () => {
        <View style={styles.subContainer}>

        </View>
    };

    const titleComponent = () => {
        const onSetTitle = (text) => {
            dispatch(setTitle(text));
        };
        return (
            <View style={styles.subContainer}>
                <View>
                    <CustomInput 
                    value={title}
                    placeholder="title"
                    setValue={onSetTitle}
                    />
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                    <Checkbox
                        status={isPrivate ? 'checked' : 'unchecked'}
                        onPress={() => {
                        setIsPrivate(!isPrivate);
                        }}
                    /> 
                    <Text> Make this only for myself </Text>
                </View>
                <CustomButton 
                onPress={createRecipe} 
                text={'submit'}
                />
            </View>
        );
    };

    const components = [
        {title: 'title', component: titleComponent()},
        {title: 'tags', component: tagComponent()},
        {title: 'ingredients', component: ingredientComponent()},
        {title: 'steps', component: stepComponent()}
    ];

    return(
        <View style={styles.container}>
            <TabSwitch titleComponentArray={components}/>
            
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        backgroundColor: '#fff',
    },

    textInput: {
        borderWidth: 1,
        borderRadius: 1,
        minHeight: 50,
        borderColor: '#000',
        height: 'auto'
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
        width: '100%',
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 5
    },

    subContainer: {
        height: '100%',
        padding: 10
    }
});

export default CreateRecipe