import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, TextInput, Modal, Image, ScrollView, KeyboardAvoidingView } from 'react-native';
import CustomButton from "../Components/CustomButton";
import CustomInput from "../Components/CustomInput";
import * as Constant from "../Constant/Constant";
import * as Authentication from "../Authentication/Authentication"
import TabSwitch from "../Components/TabSwitch";
import { useSelector, useDispatch } from 'react-redux';
import { setRecipeID, setRecipeImage, setSteps, setTags, setTitle, addTag, addStep, addIngredient, updateIngredient, updateStep, deleteTag, deleteStep, deleteIngredient, clearAllRecipe } from '../redux/recipeSlice'
import { Checkbox, Chip, Portal, Provider } from "react-native-paper";
import { Picker } from '@react-native-picker/picker';
import { NavigationContainer } from "@react-navigation/native";
import { FoodDataSelection, FoodDataSelectionList } from "../Components/FoodData";
import ImagePickerComponent from "../Components/ImagePicker/ImagePickerComponent";
import { formatToFormdata } from "../API/helper"
import { httpRequest } from '../API/ServerRequest'


function CreateRecipe(props) {

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
    const [isShowFoodModal, setShowFoodModal] = useState(false);
    const dispatch = useDispatch();


    const createRecipe = async () => {
        const submitAlert = (isTitleValid, isIngredientValid, isStepValid) => {
            Alert.alert(
                "Warning",
                `Could not complete action:\
                ${isTitleValid ? '': 'title name can only have alphanumeric characters and "_-,"'}\
                ${isIngredientValid ? '' : 'Check you ingredient is not empty as well as amount and unit.'}\
                ${isStepValid ? '' : 'you must have at least one entry of step. steps must not be empty'}\
                `,
                [
                  { text: "OK", onPress: () => {} }
                ]
              );
        };
    
        const networkErrorAlert = () => {
            Alert.alert(
                "Error",
                `Could not send due to network error`,
                [
                  { text: "OK", onPress: () => {} }
                ]
              );
        };
        var isTitleValid = false;
        var isIngredientValid = false;
        var isStepValid = false;
        if (title.match(/^[a-zA-Z0-9][a-zA-Z0-9_\-, ]*$/)) {
            isTitleValid = true;
        }
        if (ingredients.length > 0 && !ingredients.some(element => 
            element.amount == '0' || element.amount == 0 || !element.amount.match(/^(\d+)(\.\d+[1-9])?$/) ||
            element.unit == '-')) {
            isIngredientValid = true;
        }

        if (steps.length > 0 && !steps.some(element => 
             element.text.trim().length == 0
        )) {
            isStepValid = true;
        }
    
        if (isTitleValid && isIngredientValid && isStepValid) {
            var is_private = isPrivate;
            if (ingredients.some(element => element.is_private)) {
                is_private = true;
            }
            
            var ingredients_clean = ingredients.map(element => {
                return {
                    ...element,
                    food_data: element.food_data.id
                }
            })
            var obj = { user: user.username, title: title, tags: tags, ingredients: ingredients_clean, steps: steps, is_private: is_private };

            var formdata = formatToFormdata(obj)
            if (image.uri !== '' && image.name !== '' && image.type !== '') {
                formdata.append( 'main_img', {uri: image.uri, name: image.name, type: image.type} )
            }
            
            console.log(formdata)
            try {
                var method = '';
                var endpoint = '';

                if (props.route.params.isUpdate) {
                    method = 'PUT';
                    endpoint = `api/recipes/${id}/`;
                }
                else {
                    method = 'POST';
                    endpoint = `api/recipes/`;
                }
                
                const result = await httpRequest({
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'multipart/form-data; boundary=---randomawesomeboundaryforservertoknowboundary'
                    },
                    method: method,
                    body: formdata,
                    endpoint: endpoint,
                    isAuthRequired: true,
                    navigation: props.navigation
                });
                console.log('res', result.json)

                if (result.response.status == 201) {
     
                    dispatch(clearAllRecipe());
                    props.navigation.navigate('Recipe');
                }
                else {
                    networkErrorAlert();
                }
            } 
            catch (error) {
                console.log(error)
                networkErrorAlert();
            }
        }
        else {
            submitAlert(isTitleValid, isIngredientValid, isStepValid);
            
        }
    };

    // https://reactprops.navigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
        const reload = props.navigation.addListener('focus', async () => {
            setShowFoodModal(false);
        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
    }, [props.navigation]);
        

    const stepComponent = () => {
        const onAddStep = () => {
            dispatch(addStep());
            dispatch(setRecipeID(1))
        };
        const onTitleChange = (text) => {
            dispatch(setTitle(text));
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
                        text="x"
                        onPress={onDelete}
                        />
                    </View>
                    <CustomInput 
                    customStyle={{height: 'auto'}}
                    multiline
                    value={item.text}
                    setValue={onUpdate}
                    />
                </View>
            )
        }
        return (
            <View style={styles.subContainer}>
                
                <FlatList

                style={styles.list}
                data = {steps}
                renderItem = {({item}) => (
                    renderStepsData(item)
                )}
                keyExtractor = {item => `${item.step_number}`}

                ListFooterComponent={
                    <View style={[styles.buttonContainer, {paddingBottom: 200}]}>
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
            if (text != '') {
                dispatch(addTag(text));
                setTagText('');
            }
        };
        const enterTag = ()=> {
            return (
                <View style={[styles.subContainer, {paddingBottom: 200}]}>
                    <View style={[styles.steps, ]}>
                        <CustomInput 
                        placeholder="enter tag name"
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
        const switchShowFoodModal = () => {
            setShowFoodModal(!isShowFoodModal);
        };
        const renderItem = ({item}) => {
            console.log('item', item)
            const units = ['g', 'mg']
            const onDelete = () => {
                dispatch(deleteIngredient(item.food_data.id))
            };
            const updateAmount = (text) => { 
                dispatch(updateIngredient({
                    ...item,
                    amount: text,
                }))
            };
            const updateUnit = (itemValue, itemIndex) => {
                dispatch(updateIngredient({
                    ...item,
                    unit: itemValue,
                }))
            };
            const renderPickerItems = (array) => {
                return array.map((element, index) => {
                    if (element == 'microg') {
                        return <Picker.Item key={index} label={'\u00b5g'} value={element} />
                    }
                    return <Picker.Item key={index} label={element} value={element} />
                });
            }
     
            return(
                <View style={styles.itemContainer}>
                    <View style={styles.item}>
                        <Text style={styles.foodName}>{ item.name }</Text>
                        <CustomButton
                            buttonStyle={styles.itemButton}
                            textStyle={styles.itemButtonText}
                            text="x"
                            onPress={ onDelete }
                        /> 
                    </View>
                    <View style={styles.item}>
                        <View style={styles.value}>
                            <TextInput 
                                style={[styles.input, styles.picker, item.value == '0' ? styles.pickerEmpty : {}]}
                                keyboardType='numeric'
                                placeholder="amount"
                                onChangeText={(input)=> {
                                    input.replace(/[^0-9]/g, '');
                                    updateAmount(input)
                                }}
                                value={item.value}
                                maxLength={4}  //setting limit of input
                            />
                        </View>
                        <View style={[styles.unit, styles.picker, item.unit == '-' ? styles.pickerEmpty : {}]}>
                            <Picker
                                selectedValue={item.unit}
                                onValueChange={updateUnit}
                            >
                            { renderPickerItems(units) }
    
                            </Picker>
                        </View>
                    </View>
                </View>
            );
        };

        return (
            <View style={styles.subContainer}>
                <FlatList 
                    data={ingredients}
                    renderItem={renderItem}
                    keyExtractor={item => item.food_data.id}
                    ListFooterComponent={
                        <View style={{paddingBottom: 200}}>
                            <CustomButton
                                text="add ingredient"
                                onPress={switchShowFoodModal}
                            />
                            
                            <Modal
                            style={styles.foodModal}
                            visible={isShowFoodModal}
                            >
                                <CustomButton
                                    buttonStyle={styles.closeButton}
                                    textStyle={styles.closeButtontext}
                                    text="close"
                                    onPress={switchShowFoodModal}
                                />
                                <FoodDataSelection navigation={props.navigation} isRecording={true} isRecipe={true} />
                            </Modal>
                     
                        </View>
                    }
                />
            </View>
        );
    };

    const titleComponent = () => {
        const onSetTitle = (text) => {
            dispatch(setTitle(text));
        };
        const onClear = () => {
            dispatch(clearAllRecipe())
        };
        const onImageSelect = (uri, type, ext) => {
            dispatch(setRecipeImage({
                uri: uri,
                name: `${user.username}${new Date().getTime()}.${ext}`,
                type: `${type}/${ext}`,
            }));
        };
        return (
                <ScrollView style={styles.subContainer}>
                
                <View>
                    <CustomInput 
                    value={title}
                    placeholder="title"
                    setValue={onSetTitle}
                    />
                </View>
                <Text>add image:</Text>
                {
                    image !== null && image !== undefined && image.uri !== '' ?
                    (<View style={styles.imageContainer}>
                        <Image source={ image }
                        style={styles.image}
                    
                        />
                    </View>) : null
                }
                <ImagePickerComponent onImageSelect={onImageSelect} />

                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                    <Checkbox
                        status={isPrivate ? 'checked' : 'unchecked'}
                        onPress={() => {
                        setIsPrivate(!isPrivate);
                        }}
                    /> 
                    <Text> Make this only for myself </Text>
                </View>
                <Text style={{backgroundColor: '#fff', borderRadius: 5, borderWidth: 1, borderColor: '#000', padding: 10}}>
                    note: if you use food from 'my food' only for you, the recipe will automatically be only for you. 
                    When you choose to delete the recipe, its food data will be retained to calculate the nutrition values.
                </Text>

                <CustomButton 
                onPress={createRecipe} 
                text={'submit'}
                />
                <CustomButton 
                modest
                text="clear all"
                onPress={onClear}
                />
               
            </ScrollView>
        );
    };

    const components = [
        {title: 'title', component: titleComponent()},
        {title: 'tags', component: tagComponent()},
        {title: 'ingredients', component: ingredientComponent()},
        {title: 'steps', component: stepComponent()}
    ];

    return(
        <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column',justifyContent: 'center',}} behavior="padding" enabled   keyboardVerticalOffset={100}>       
      
            <TabSwitch titleComponentArray={components}/>
            
     
        </KeyboardAvoidingView>

    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    closeButton: {
        backgroundColor: '#ffffff00'
    },
    closeButtontext: {
        color: '#000'
    },
    foodModal: {
        height: '100%',
        backgroundColor: '#fff'
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
    },
    name: {
        flex: 9
    },
    value : {
        flex: 5
    },
    unit: {
        flex: 5
    },
    picker: {
        borderColor: '#000',
        borderWidth: 1,
        margin: 10, 
        borderRadius: 10,
    },
    pickerEmpty: {
        borderWidth: 2, 
        borderColor: '#ff0000'
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    foodName: {
        flex: 9,
        margin: 10,
        fontSize: 14
    },
    amountContainer: {
        width: '100%',
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    itemContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        height: 'auto',
        width: 'auto',
        margin: 5,
        borderRadius: 5,
        elevation: 2,
    },
    input: {
        height: 50,
        padding: 10,
        marginVertical: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#888',
        borderRadius: 5
    },
    itemButton: {
        //width: '100%',
        flex: 1,
    },
    itemButtonText: {
        fontSize: 15
    },
    itemTextLeft: {
        flex: 2,
        paddingRight: 10,
        borderRightColor: '#000',
        borderRightWidth: 1,
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    itemTextRight: {
        flex: 1,
        margin: 10,
        textAlign: 'center',
        textAlignVertical: 'center'
    },
    imageContainer: {
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: '20%'
    },
    image: {
        width: null,
        height: 300,
        borderRadius: 10,
    },
});

export default CreateRecipe