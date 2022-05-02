import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, StyleSheet, Pressable, FlatList, Image, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import unitJson from '../../assets/JSON/gov_diet_recommendation_units.json'
import CustomButton from '../CustomButton';
import { useSelector, useDispatch } from 'react-redux';
import { setFoodName, addNutrition, deleteNutritionByName, clearAllFoodData, updateNutrition, addEmpty } from '../../redux/foodDataSlice'
import { addRecordSelection } from '../../redux/mealRecordSlice'
import CustomInput from '../CustomInput';
import * as ImagePicker from 'expo-image-picker';

export default function ManualFoodDataInput({onSubmit}) {
    
    const { name, image_uri, amount_in_grams, nutritions } = useSelector(state => state.fooddata.fooddata);
    console.log(name, image_uri, amount_in_grams, nutritions)
    const dispatch = useDispatch();

    const [image, setImage] = useState('');
    const [camerastatus, requestCameraPermission] = ImagePicker.useCameraPermissions();
    const [mediastatus, requestMediaPermission] = ImagePicker.useMediaLibraryPermissions();
    
    const onPress = () => {
        
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
            return !nutritions.some(nutritionElement => {
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
        
            console.log(result);
        
            if (!result.cancelled) {
                setImage(result.uri);
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
        
            console.log(result);
        
            if (!result.cancelled) {
                setImage(result.uri);
                console.log(result.uri)
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
                    value={name}
                    setValue={onFoodNameChange}
                    placeholder="Enter food name"
                    />
                
                    {
                        image !== '' ?
                        (<View style={styles.imageContainer}>
                            <Image source={ {uri: image} }
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
            data = {nutritions}
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
        width: '50%',
        height: '50%'
    },
    image: {
        width: null,
        height: 300
    },
});
