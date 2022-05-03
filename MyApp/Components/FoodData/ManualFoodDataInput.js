import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, StyleSheet, Pressable, FlatList, Image, Platform, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import unitJson from '../../assets/JSON/gov_diet_recommendation_units.json'
import CustomButton from '../CustomButton';
import { useSelector, useDispatch } from 'react-redux';
import { setFoodName, addNutrition, deleteNutritionByName, clearAllFoodData, updateNutrition, addEmpty, setFoodAmount, setImage } from '../../redux/foodDataSlice'
import { addRecordSelection } from '../../redux/mealRecordSlice'
import CustomInput from '../CustomInput';
import * as ImagePicker from 'expo-image-picker';
import {formatToFormdata} from '../../API/helper';
import { httpRequest } from '../../API/ServerRequest';

export default function ManualFoodDataInput({navigation, onSubmit}) {
    
    const { name: foodName, image, amount_in_grams, nutrient_data } = useSelector(state => state.fooddata.fooddata);
    const { user } = useSelector(state => state.user);

    const dispatch = useDispatch();

    const [camerastatus, requestCameraPermission] = ImagePicker.useCameraPermissions();
    const [mediastatus, requestMediaPermission] = ImagePicker.useMediaLibraryPermissions();


    const submitAlert = (isNameValid, isAmountValid, isNutritionValid) => {
        Alert.alert(
            "Warning",
            `Could not complete action:\
            ${isNameValid ? '': 'food name. can only have alphanumeric characters and "_-"'}\
            ${isAmountValid ? '' : 'food amount must be greater than 0'}\
            ${isNutritionValid ? '' : 'you must have at least one entry of nutrition. nutrition amount must be greater than 0, name or unit must not be empty'}\
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

    const onPress = async () => {
        var isNameValid = false;
        var isAmountValid = false;
        var isNutritionValid = false;
        if (foodName.match(/^[a-zA-Z0-9][a-zA-Z0-9_\- ]+$/)) {
            isNameValid = true;
        }
        if (!nutrient_data.some(element => 
            element.name == '-' && !element.name.match(/^[a-zA-Z0-9][a-zA-Z0-9_\- ]+$/)||
            element.value == '0' || element.value.length == 0 ||
            element.unit == '-'
        ) && nutrient_data.length > 0) {
            isNutritionValid = true;
        }
        if (amount_in_grams !== '0') {
            isAmountValid = true;
        }
    
        if (isNameValid && isAmountValid && isNutritionValid) {
            
            var obj = { uploader: user.username, source: user.username, name: foodName, amount_in_grams, nutrient_data: nutrient_data };

            var formdata = formatToFormdata(obj)
            if (image.uri !== '') {
                formdata.append( 'main_img', {uri: image.uri, name: image.name, type: image.type} )
            }
            
            try {
                const result = await httpRequest({
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'multipart/form-data; boundary=---jnkasdlkjhsaniffha'
                    },
                    method: 'POST',
                    endpoint: 'api/fooddata/',
                    body: formdata,
                    isAuthRequired: true,
                    navigation: navigation
                });
                console.log(result.json)

                if (result.response.status == 201) {
                    obj.id = result.json.id;
                    var mealRecordContent = {};
                    mealRecordContent.food_data = obj;
                    mealRecordContent.amount_in_grams = parseFloat(obj.amount_in_grams);
                    
                    dispatch(addRecordSelection(mealRecordContent));
                    dispatch(clearAllFoodData());
                    onSubmit();
                }
                else {
                    networkErrorAlert();
                }
            } 
            catch (error) {
                networkErrorAlert();
            }
        }
        else {
            submitAlert(isNameValid, isAmountValid, isNutritionValid);
            
        }
    };

    const renderPickerItems = (array) => {
        return array.map((element, index) => {
            return <Picker.Item key={index} label={element} value={element} />
        });
    };

    const clean = (text) => {
        return text.replace('_kcal', '').replace('_kj', '').replace('_', ' ').trim();
    };

    const renderNutritionNamePickerItems = (id) => {
        var names = Object.keys(unitJson)
        names.splice(0, 1);
        const choices = ['-'].concat(names)
        .map(element => {
            return clean(element)
        })
        .filter(choiceElement => {
            return !nutrient_data.some(nutritionElement => {
                return choiceElement === nutritionElement.name && id !== nutritionElement.tempID
            })
        });
        return renderPickerItems(choices);
    };

    const renderData = (item) => {
        const name = clean(item.name);
        const units = item.name == 'energy' ? ['-', 'kcal', 'kj'] : ['-', 'g', 'mg', 'microg']
        const onDelete = () => { dispatch(deleteNutritionByName(item.name)); };
        const updateName = (itemValue, itemIndex) => { 
            dispatch(updateNutrition({
                oldName: item.name, 
                newNutrition: { name: itemValue } 
            })); 
        };
        const updateValue = (text) => { 
            dispatch(updateNutrition({
                oldName: item.name, 
                newNutrition: { value: text } 
            })); 
        };
        const updateUnit = (itemValue, itemIndex) => {
            dispatch(updateNutrition({
                oldName: item.name,
                newNutrition: { unit: itemValue }
            }))
        };
 
        return(
            <View style={styles.itemContainer}>
                <View style={styles.item}>
                    <View style={[styles.name, styles.picker, name == '-' ? styles.pickerEmpty : {}]}>
                        <Picker
                            selectedValue={name}
                            onValueChange={updateName}
                        >
                            { renderNutritionNamePickerItems(item.tempID)}

                        </Picker>
                    </View>
                    <CustomButton
                        buttonStyle={styles.itemButton}
                        textStyle={styles.itemButtonText}
                        text={'x'}
                        onPress={ onDelete }
                    /> 
                </View>
                <View style={styles.item}>
                    <View style={styles.value}>
                        <CustomInput 
                            customStyle={[styles.picker, item.value == '0' ? styles.pickerEmpty : {}]}
                            value={item.value}
                            setValue={updateValue}
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

    const onPressAddEmpty = () => {
        dispatch(addEmpty());
    };

    const onFoodNameChange = (text) => {
        dispatch(setFoodName(text));
    };

    const onFoodAmountChange = (text) => {
        dispatch(setFoodAmount(text));
    };

    const pickImage = async () => {
        try {
            if (Platform.OS === 'ios') {
                await requestMediaPermission();
                if (mediastatus !== 'granted') {
                    return
                }
            }
            // No permissions request is necessary for launching the image library
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                //aspect: [4, 3],
                quality: 1,
            });
        
            if (!result.cancelled) {
                var uri = result.uri;
                var ext = uri.substr(result.uri.lastIndexOf('.') + 1);
                if (ext == 'jpg') { ext = 'jpeg' }
                dispatch(setImage({
                    uri: result.uri,
                    name: `${user.username}${new Date().getTime()}.${ext}`,
                    type: `${result.type}/${ext}`,
                }));
            }
        }
        catch (error) {

        }
      };
    const pickFromCamera = async () => {
        try {
            if (Platform.OS === 'ios') {
                await requestCameraPermission();
                if (camerastatus !== 'granted') {
                    return
                }
            }
            // No permissions request is necessary for launching the image library
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                //aspect: [4, 4],
                quality: 1,
            });
        
            if (!result.cancelled) {
                var uri = result.uri;
                var ext = uri.substr(result.uri.lastIndexOf('.') + 1);
                if (ext == 'jpg') { ext = 'jpeg' }
                dispatch(setImage({
                    uri: result.uri,
                    name: `${user.username}${new Date().getTime()}.${ext}`,
                    type: `${result.type}/${ext}`,
                }));
            }
        }
        catch (error) {

        }
    };
    
    return(
    
        <View style={styles.container}>
        
            <FlatList
            ListHeaderComponent={
                <View>
                    <CustomInput
                    value={foodName}
                    setValue={onFoodNameChange}
                    placeholder="Enter food name"
                    />
                    <View style={styles.amountContainer}>
                        <Text> amount: </Text>
                        <View style={{flex: 1, paddingHorizontal: 10}}>
                            <CustomInput
                                value={amount_in_grams}
                                setValue={onFoodAmountChange}
                                placeholder="food amount"
                            />
                        </View>
                        <Text > g </Text>
                    </View>
                
                    {
                        image !== null && image.uri !== '' ?
                        (<View style={styles.imageContainer}>
                            <Image source={ image }
                            style={styles.image}
                        
                            />
                        </View>) : null
                    }

                    <CustomButton
                        text="open photos"
                        onPress={pickImage}
                    />
                    <CustomButton
                        text="open camera"
                        onPress={pickFromCamera}
                    />
                </View>
            }
            style={styles.list}
            data = {nutrient_data}
            renderItem = {({item}) => {
                return renderData(item)
            }}
            keyExtractor = {item => item.name }

            ListFooterComponent={
                <View style={styles.buttonContainer}>
                <CustomButton
                style={styles.button}
                onPress={onPressAddEmpty}
                text={'+'}
                />

                <CustomButton 
                onPress={onPress} 
                text={'submit'}
                />
                </View>
            }
            />
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignContent: 'center',
        width: '95%',
        marginLeft: '2.5%',
    },
    footer: {
        marginBottom: 100
    },
    button: {
        textAlign: 'center',
        textAlignVertical: 'center',
        height: 100,
        width: '40%',
        margin: '5%'
    },
    buttonContainer: {
        marginBottom: 100,
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
