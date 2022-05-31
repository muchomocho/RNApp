import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, StyleSheet, Pressable, FlatList, Alert } from 'react-native';
import fooddataJson from '../../assets/JSON/food_integrated_dataset.json'
import fooddataUnitJson from '../../assets/JSON/food_integrated_dataset_units.json'
import CustomButton from '../CustomButton';
import SearchBar from '../SearchBar';
import { useSelector, useDispatch } from 'react-redux';
import { addRecordSelection, clearRecord } from '../../redux/mealRecordSlice'
import { httpRequest } from '../../API/ServerRequest';
import { amountFormatter, clean } from '../../API/helper';
import { clearAllFoodData, setFoodAmount, setFoodName, setNutrition, setFoodID, setImage, addNutrition } from '../../redux/foodDataSlice';
import { addIngredient } from '../../redux/recipeSlice';
import { MAIN_COLOUR } from '../../Constant/Constant';

export default function FoodDataSpec({navigation, fooddata, status, isRecording=false, isRecipe=false}) {

    const { user } = useSelector(state => state.user);
    const { mealRecordContent } = useSelector(state => state.mealRecord);
    const dispatch = useDispatch();
    const [foregroundHeight, setForegroundHeight] = useState(0);
    const [amount, setAmount] = useState(amountFormatter(fooddata.amount_in_grams ? fooddata.amount_in_grams : '0'));


    const onDelete = async () => {
        const deleteErrorAlert = () => {
            Alert.alert(
            "Error",
            `Could not load image. If camera image is not loading, try from gallery.`,
            [
                { text: "OK", onPress: () => {} }
            ]
            );
        };

        try {
            const endpoint = `api/useraccounts/${user.username}/myfooddata/${fooddata.id}/`
            const response = await httpRequest({
                method: 'DELETE', 
                endpoint: endpoint,
                navigation: navigation,
                isAuthRequired: true
            });
        
            if (response.response.status == 200) {
                navigation.navigate('Fooddata')
            }
            else {
                deleteErrorAlert();
            }

        } catch (error) {
            deleteErrorAlert();
        } 
    };

    const dispatchCleanNutrientData = () => {

        var nutrient_data = fooddata.nutrient_data;
        nutrient_data.forEach((element, index) => {
            var value = element.value;
            dispatch(addNutrition({ tempID: index, name: clean(element.name), unit: element.unit, value: String(element.value) }));
        });
        return;
    };

    const onEdit = () => {
        
        dispatch(clearAllFoodData());
        dispatch(setFoodID(fooddata.id));
        dispatch(setFoodAmount(String(parseFloat(fooddata.amount_in_grams))));
        dispatch(setFoodName(fooddata.name));

        if (typeof(fooddata.main_img) == 'string') {
            dispatch(setImage({ uri: fooddata.main_img, type: '',  name: ''}))
        }

        dispatchCleanNutrientData()
        
        navigation.navigate('Create record', { isShowManualModal: true, isEditingFood: true })
    }

    const addToRecord = () => {
        var fooddataWrapper = {};
        fooddataWrapper.food_data = fooddata;
        fooddataWrapper.amount_in_grams = parseFloat(amount).toFixed(10);
       
        if (isRecipe) {
            dispatch(addIngredient(fooddataWrapper));
            navigation.navigate('Create recipe')
        }
        else {
            dispatch(addRecordSelection(fooddataWrapper));
            navigation.navigate('Create record')
        }
        
    }

    const renderData = (item) => {
        var unit =  fooddataUnitJson[item.key];
        if (unit == 'microg') { unit = '\u00b5g'; }
        return(
            <View style={styles.infoContainer}>
                <View style={{maxWidth: '50%'}}>
                    <Text style={styles.infoContainerTextLeft}>{ item.key }</Text>
                </View>
                <View style={{maxWidth: '50%'}}>
                    <Text style={styles.infoContainerTextRight}>{ item.value + unit }</Text>
                </View>
            </View>
        )
    }

    const foregroundElement = () => {
        if (isRecording) {
            return (
                // https://stackoverflow.com/questions/30203154/get-size-of-a-view-in-react-native
                <View style={styles.foreground} onLayout={(event) => {setForegroundHeight(event.nativeEvent.layout.height);}}>
                    { 
                        !isRecipe &&
                        <View style={[{alignContent: 'center'}, styles.amount]}>
                            
                                
                            <Text> amount : </Text>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <TextInput 
                                    style={styles.amountInput}
                                    keyboardType='numeric'
                                    onChangeText={(input)=> {
                                        input.replace(/[^0-9]/g, '');
                                        setAmount(input)
                                    }}
                                    value={amount}
                                    maxLength={4}  //setting limit of input
                                />
                                <Text>grams</Text>
                            </View>
            
                        </View>
                    }
                    <CustomButton
                        //buttonStyle={styles.button}
                        onPress={addToRecord}
                        text={'add to list'}
                    />
                </View>
            );
        }
    };

    const footer = () => {
        if (isRecording) {
            return(
                <View style={[{marginBottom: foregroundHeight},]}>
                    
                </View>
            );
        }
        return(
            <View style={[{marginBottom: 70}]}>

            </View>
        );
    }

    const fooddataView = (fooddata) => {
        var objArray = [];
   
        fooddata.nutrient_data.forEach((nutrient) => {
            var value = String((nutrient.value * parseFloat(amount) / fooddata.amount_in_grams).toFixed(10))
            value = amountFormatter(value);
            objArray.push({key: nutrient.name, value: value })
        });
    
        return(
            <View>
                <FlatList
                ListHeaderComponent={
                    <View style={[styles.nameContainer, styles.header]}>
                        <Text style={[styles.nameContainerText, {marginTop: 10}]}>{ fooddata.name }, </Text>
                        <Text style={[styles.nameContainerText, {marginBottom: 10}]}>per { amountFormatter(amount) }g</Text>
                        {
                            fooddata.uploader == user.username &&
                            <View>
                                <CustomButton
                                    text="edit"
                                    onPress={onEdit}
                                />
                                <CustomButton
                                    text="delete"
                                    onPress={onDelete}
                                />
                            </View>
                        }
                    </View>
                }

                data = {objArray}
                renderItem = {({item}) => {
                    return renderData(item)
                }}
                keyExtractor = {item => item.key}
                
                ListFooterComponent={
                    footer()
                }
                
                />
                { foregroundElement() }
            </View>
        );
    };

    if (status == 401) {
        return (
        <View>
            <Text>This data is private. Only owner can see.</Text>
        </View>
        );
    }
    if (status == 404) {
        return (
        <View>
            <Text>This data is not available.</Text>
        </View>
        );
    }
    if (status == -1 || fooddata == null || fooddata == undefined || fooddata.amount_in_grams == undefined || fooddata.nutrient_data == undefined) {
        return (
            <View style={{justifyContent: 'center', height: '100%', alignItems: 'center'}}>
                <Text>could not load.</Text>
                <CustomButton 
                text="back"
                onPress={()=>{ navigation.navigate('Fooddata') }}
                />
            </View>
        );
    }
    return (
        fooddataView(fooddata)
    );
}

const styles = StyleSheet.create({
    container: {
        width: '90%',
        marginLeft: '5%',
    },
    nameContainer: {
        backgroundColor: MAIN_COLOUR,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        height: 'auto',
        alignItems: 'center',
    },
    nameContainerText: {
        color: '#fff',
        height: 25,
        textAlignVertical: 'center'
    },
    header: {
        marginTop: '15%'
    },
    infoContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomColor: '#aaa',
        borderBottomWidth: 0.5,
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 20,
        minHeight: 30,
        height: 'auto',
        width: '100%'
    },
    infoContainerTextLeft: {
        height: 'auto',
        minHeight: 30,
        textAlignVertical: 'center',
        flexWrap: 'wrap',
    },
    infoContainerTextRight: {
        height: 'auto',
        minHeight: 30,
        textAlignVertical: 'center',
    },
    foreground:{
        left: 0,
        bottom: 0,
        position: 'absolute',
        width: '100%'
    },
    amount: {
        height: 100,
        marginTop: 10,
        borderRadius: 10,
        backgroundColor: '#fff',
        elevation: 3,
        borderWidth: 1,
        borderColor: '#ccc'
    },
    amountInput: {
        borderColor: '#000',
        borderRadius: 5,
        borderWidth: 2,
        padding: 10,
        margin: 10,
        width: '70%',
        alignSelf: 'center'
    },
    footer: {
        alignItems: 'center',
        marginBottom: '30%'
    },
});