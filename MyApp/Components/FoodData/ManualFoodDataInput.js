import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, StyleSheet, Pressable, FlatList, Image, Platform, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import unitJson from '../../assets/JSON/gov_diet_recommendation_units.json'
import CustomButton from '../CustomButton';
import { useSelector, useDispatch } from 'react-redux';
import { setFoodName, addNutrition, deleteNutritionByName, clearAllFoodData, updateNutrition, addEmpty, setFoodAmount, setImage } from '../../redux/foodDataSlice'
import { addRecordSelection } from '../../redux/mealRecordSlice'
import CustomInput from '../CustomInput';
import {amountFormatter, formatToFormdata, clean} from '../../API/helper';
import { httpRequest } from '../../API/ServerRequest';
import { Checkbox } from 'react-native-paper';
import ImagePickerComponent from '../ImagePicker/ImagePickerComponent';


export default function ManualFoodDataInput({navigation, onSubmit, isUpdate=false}) {
    
    const { name: foodName, image, amount_in_grams, nutrient_data, id } = useSelector(state => state.fooddata.fooddata);
    const { user } = useSelector(state => state.user);

    const dispatch = useDispatch();

    const [isPrivate, setIsPrivate] = useState(true);

    const submitAlert = (isNameValid, isAmountValid, isNutritionValid) => {
        Alert.alert(
            "Warning",
            `Could not complete action:\
            ${isNameValid ? '': 'food name. can only have alphanumeric characters and "_-,"'}\
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
        if (foodName.match(/^[a-zA-Z0-9][a-zA-Z0-9_\-, ]*$/)) {
            isNameValid = true;
        }
        if (!nutrient_data.some(element => 
            element.name == '-' && !element.name.match(/^[a-zA-Z0-9][a-zA-Z0-9_\- ]*$/) ||
            element.value == '0' || element.value.length == 0 || !element.value.match(/^(\d+)(\.\d+[1-9])?$/) ||
            element.unit == '-'
        ) && nutrient_data.length > 0) {
            isNutritionValid = true;
        }
        if (amount_in_grams.match(/^(\d+)(\.\d+[1-9])?$/)) {
            isAmountValid = true;
        }
    
        if (isNameValid && isAmountValid && isNutritionValid) {
            
            var obj = { uploader: user.username, source: user.username, name: foodName, amount_in_grams, nutrient_data: nutrient_data, is_private: isPrivate };

            var formdata = formatToFormdata(obj)
            if (image.uri !== '' && image.name !== '' && image.type !== '') {
                formdata.append( 'main_img', {uri: image.uri, name: image.name, type: image.type} )
            }
            
            console.log(formdata)
            try {
                var method = '';
                var endpoint = '';

                if (isUpdate) {
                    method = 'PUT';
                    endpoint = `api/fooddata/${id}/`;
                }
                else {
                    method = 'POST';
                    endpoint = `api/fooddata/`;
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
                        navigation: navigation
                    });
                console.log('res', result.json)

                if (result.response.status == 201) {
                    if (isUpdate) {
                        dispatch(clearAllFoodData());
                        onSubmit();
                        navigation.navigate('Fooddata');
                    }
                    else {
                        obj.id = result.json.id;
                        var mealRecordContent = {};
                        mealRecordContent.food_data = obj;
                        mealRecordContent.amount_in_grams = parseFloat(obj.amount_in_grams).toFixed(5);
                        
                        dispatch(addRecordSelection(mealRecordContent));
                        dispatch(clearAllFoodData());
                        onSubmit();
                    }
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
            if (element == 'microg') {
                return <Picker.Item key={index} label={'\u00b5g'} value={element} />
            }
            return <Picker.Item key={index} label={element} value={element} />
        });
    }
    

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
                        <TextInput 
                            style={[styles.input, styles.picker, item.value == '0' ? styles.pickerEmpty : {}]}
                            keyboardType='numeric'
                            onChangeText={(input)=> {
                                input.replace(/[^0-9]/g, '');
                                updateValue(input)
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

    const onPressAddEmpty = () => {
        dispatch(addEmpty());
    };

    const onPressClear = () => {
        dispatch(clearAllFoodData());
    }

    const onFoodNameChange = (text) => {
        dispatch(setFoodName(text));
    };

    const onFoodAmountChange = (text) => {
        dispatch(setFoodAmount(text));
    };

    const onImageSelect = (uri, type, ext) => {
        dispatch(setImage({
            uri: uri,
            name: `${user.username}${new Date().getTime()}.${ext}`,
            type: `${type}/${ext}`,
        }));
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
                            <TextInput 
                            style={[{flex: 1, paddingHorizontal: 10}, styles.input]}
                            keyboardType='numeric'
                            onChangeText={(input)=> {
                                input.replace(/[^0-9]/g, '');
                                onFoodAmountChange(input)
                            }}
                            value={amount_in_grams}
                            maxLength={4}  //setting limit of input
                        />
                        </View>
                        <Text > g </Text>
                    </View>
                
                    {
                        image !== null && image !== undefined && image.uri !== '' ?
                        (<View style={styles.imageContainer}>
                            <Image source={ image }
                            style={styles.image}
                        
                            />
                        </View>) : null
                    }

                    <ImagePickerComponent onImageSelect={onImageSelect} />
                </View>
            }
            style={styles.list}
            data = {nutrient_data}
            renderItem = {({item}) => {
                return renderData(item)
            }}
            keyExtractor = {item => item.tempID }

            ListFooterComponent={
                <View style={styles.buttonContainer}>
                <CustomButton
                style={styles.button}
                onPress={onPressAddEmpty}
                text={'add nutritional data'}
                />

                <CustomButton
                style={styles.button}
                onPress={onPressClear}
                text={'clear'}
                />

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
    input: {
        height: 50,
        padding: 10,
        marginVertical: 10,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#888',
        borderRadius: 5
    },
});
