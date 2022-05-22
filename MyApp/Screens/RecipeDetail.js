import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, Image } from 'react-native';
import * as ServerRequest from '../API/ServerRequest';
import * as Constant from '../Constant/Constant'
import { useSelector, useDispatch } from 'react-redux';
import CustomButton from "../Components/CustomButton";
import { addRecipeRecordSelection } from '../redux/mealRecordSlice'
import { VictoryAnimation, VictoryPie, VictoryLabel } from "victory-native";
import targetJson from '../assets/JSON/gov_diet_recommendation.json';
import unitJson from '../assets/JSON/gov_diet_recommendation_units.json';
import { genderMap, ageMap, amountFormatter } from '../API/helper'
import Svg from "react-native-svg";
import { formatDate, lessThanNutrients } from '../API/helper';
import { setRecipeID, setRecipeImage, setSteps, setTags, setTitle, setIngredient, addTag, addStep, addIngredient, updateIngredient, updateStep, deleteTag, deleteStep, deleteIngredient, clearAllRecipe } from '../redux/recipeSlice'


const green = '#27ad15';
const red = '#d93909';
const orange = '#f5b42a';
const blue = '#093dd9';

function RecipeDetail(props) {
    const { user, currentSubuser, subuserArray } = useSelector(state => state.user);
    const [data, setData] = useState([]);
    const [record, setRecord] = useState();
    const [nutrientData, setNutrientData] = useState();
    const [isShowModal, setIsShowModal] = useState(false);
    const [isShowLegend, setIsShowLegend] = useState(false);

    const dispatch = useDispatch();

    const getRecipeData = async () => {
        try {
            const result = await ServerRequest.httpRequest({
            method: 'GET',
            endpoint: `api/recipes/${props.route.params.recipe.id}/`,
            isAuthRequired: !user.username == '',
            navigation: props.navigation
            });
            if (result.response.status == 200) {
                setData(result.json);

            }
        } catch (error) {
            console.log('recipedetail', error)
        }
    }

    const deleteRecipe = async () => {

        if (user.username == '' || currentSubuser.id == '') {
                return;
            }
        try {
            const result = await ServerRequest.httpRequest({
                method: 'DELETE',
                endpoint: `api/useraccounts/${user.username}/myrecipes/${props.route.params.recipe.id}/`,
                isAuthRequired: true,
                navigation: props.navigation
            });
            if (result.response.status == 200) {
                props.navigation.navigate('Recipe');
            }
        } catch (error) {
            Alert.alert(
                "Error",
                `Could not delete`,
                [
                    { text: "OK", onPress: () => { props.navigation.navigate('Recipe'); } },
                ]
            );
        }
    }

    const getRecipeNutrientData = async () => {
        try {
            const result = await ServerRequest.httpRequest({
            method: 'GET',
            endpoint: `api/recipes/${props.route.params.recipe.id}/nutrients/`,
            isAuthRequired: !user.username == '',
            navigation: props.navigation
            });
            if (result.response.status == 200) {
                setNutrientData(result.json);
                console.log('nuteitn',result.json)
            }
        } catch (error) {
            console.log('recipedetail', error)
        }
    };

    const getUserRecord = async () => {

        if (user.username == '' || currentSubuser.id == '') {
                return;
            }
        try {
            const result = await ServerRequest.httpRequest({
                method: 'GET',
                endpoint: 'api/useraccounts/'
                + user.username
                + '/subuser/'
                + currentSubuser.id
                + '/userrecord/'
                + formatDate(new Date()) + '/',
                isAuthRequired: true,
                navigation: props.navigation
            });
            if (result.response.status == 200) {
                setRecord(result.json);
                console.log('rec', result.json)
            }
        } catch (error) {
            console.log('userrecord...', error)
        }
    }

    // https://reactnative.dev/docs/network
    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
        const reload = props.navigation.addListener('focus', async () => {
            // The screen is focused
            // Call any action
            await getRecipeData();
            await getRecipeNutrientData();
            await getUserRecord();
        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
    }, [props]);

    const recordButton = () => {
        const onAdd = () => {
            dispatch(addRecipeRecordSelection(props.route.params.recipe));
            props.navigation.navigate('Create record')
        };
        if (props.route.params.isRecording) {
            return (
                <View style={styles.floatButtonContainer}>
                    <CustomButton
                        text="Add"
                        onPress={onAdd}
                    />
                </View>
            );
        }
    }
    
    const singleNutrientBox = (nutrient) => {
        if (nutrient.name == 'is_missing_value') {
            return;
        }
        const targetValue = targetJson[ageMap(currentSubuser.age)][genderMap(currentSubuser.gender)][nutrient.name];
        const recordValue = record[nutrient.name];
        const percent = Math.round(100 * (nutrient.value / targetValue))
        const totalPercent = Math.round(100 * ((nutrient.value + recordValue) / targetValue))
        var unit = unitJson[nutrient.name]
        if (unit == 'microg') { unit = '\u00b5g' }
        // https://formidable.com/open-source/victory/gallery/animating-circular-progress-bar/
        return (
        <View key={nutrient.name}>
            <View style={{backgroundColor: '#fff', margin: 5, width: 100, height: 100}}>
                <Svg style={{backgroundColor:'#fff', elevation: 3}} viewBox="0 0 400 400" width="100%" height="100%">
                    <VictoryPie
                        standalone={false}
                        width={400} height={400}
                        labels={()=>null}
                        data={[{ x: 1, y: recordValue }, { x: 2, y: nutrient.value}, { x: 3, y:  targetValue - (nutrient.value + recordValue) }]}
                        innerRadius={120}
                        cornerRadius={25}
                        style={{
                            data: { 
                                fill: ({ datum }) => {
                                    const color = datum.y > targetValue && (lessThanNutrients.includes(nutrient.name)) ? red : green;
                                    return datum.x === 2 ? color : ( datum.x === 1 ? "orange" : "#e6ebea");
                                }
                            }
                        }}
                    />
                    <VictoryLabel
                        textAnchor="middle" verticalAnchor="middle"
                        x={200} y={200}
                        text={[`+${percent}%\n`,`Total: ${totalPercent}%`]}
                        style={[
                            { fontSize: 50 },
                            { fontSize: 40  },
                        ]}
                    />
                </Svg>
            </View>
            <View style={{height: 'auto'}}>
                <Text style={styles.nutrientInfoText}>{ nutrient.name.replace('_', ' ') }</Text>
                <Text style={[styles.nutrientInfoText, percent > 100 ? styles.recipeInfoExceed : styles.recipeInfo ]}>{ nutrient.value } {unit}</Text>
                <Text style={[styles.nutrientInfoText, styles.recordInfo]}>{ recordValue } {unit}</Text>
                <Text style={[styles.nutrientInfoText, styles.targetInfo]}>{ targetValue } {unit}</Text>
            </View>
        </View>
        );
    };

    const nutrientPanel = () => {
        const nutrientFormatted = () => {
            var arr = [];
            for (var prop in nutrientData) {
                if (Object.prototype.hasOwnProperty.call(nutrientData, prop)) {
                    arr.push({ name: prop, value: nutrientData[prop] });
                }
            }
            return arr
        };

        const renderData = (item) => {
            return singleNutrientBox(item);
        };

        if (currentSubuser.name !== '' && currentSubuser.age !== '' && currentSubuser.gender !== '' && record != undefined) {

            return ( 
                <View style={{padding: 10, backgroundColor: '#fff', elevation: 3}}>
                    {
                        isShowLegend &&
                        <View style={{flexDirection: 'column', borderRadius: 5, borderWidth: 1, borderColor: '#000'}}>
                            <View style={[styles.legendContainer]}>
                                <View style={[styles.legend, {backgroundColor: green}]} /> 
                                <Text>Nutrients in this recipe</Text>
                            </View>
                            <View style={[styles.legendContainer]}>
                                <View style={[styles.legend, {backgroundColor: red}]} /> 
                                <Text>Nutrients over your recommended amount</Text>
                            </View>
                            <View style={[styles.legendContainer]}>
                                <View style={[styles.legend, {backgroundColor: orange}]} /> 
                                <Text>Nutrients you had today</Text>
                            </View>
                            <View style={styles.legendContainer}>
                                <View style={[styles.legend, {backgroundColor: blue}]} /> 
                                <Text>Your recommended amount</Text>
                            </View>
                        </View>
                    }
                    <FlatList 
                        horizontal
                        // style={{height: 'auto'}}
                        // main list content
                        data = {nutrientFormatted()}
                        renderItem = {({item}) => {
                            return renderData(item)
                        }}
                        keyExtractor = {item => `${item.name}`}
                        
                    />
                </View>
            );
        }
    };


    const onEdit = () => {
        dispatch(setRecipeID(data.id));
        dispatch(setRecipeImage({ uri: `${Constant.ROOT_URL}${data.main_img.substring(1)}`, type: '', name: '' }));
        dispatch(setSteps(data.steps));
        dispatch(setTags(data.tags));
        dispatch(setTitle(data.title));
        dispatch(setIngredient(data.ingredients));
        props.navigation.navigate('Create recipe', {isUpdate: true})
    };

    const onDelete = () => {
        Alert.alert(
            "Warning",
            `Are you sure you want to delete?`,
            [
                { text: "OK", onPress: () => { deleteRecipe(); } },
                { text: "Cancel", onPress: () => {} }
            ]
        );

    };

    const ingredients = () => {
        const renderItem = ({item}) => {
            
            return(
                <View key={item.food_data.id} style={styles.ingredient}>
                    <Text style={{flex: 2}}>{ item.food_data.name }</Text>
                    <Text style={{flex: 1}}>{ amountFormatter(item.amount) } { item.unit }</Text>
                </View>
            );
        };
        
        return (
            <FlatList 
            style={styles.ingredientContainer}
            data={data.ingredients}
            renderItem={renderItem}
            keyExtractor={item=>item.food_data.id}
            />
        );
    };

    const renderData = (item) => {
        return(
            <View key={item.step_number} style={styles.stepsTab}>
                <Text>{item.step_number}</Text>
                <Text>{item.text}</Text>
            </View>
        )
    }
    // https://reactnative.dev/docs/flatlist
    return(
        <View >
            <FlatList
            style={styles.container}

            // top of list
            ListHeaderComponent={
                <View>
                <View style={[styles.account, styles.header]}>
                    <Text style={styles.titleText}>{data.title}</Text>
                    <Text style={styles.accountText}>
                        created by: {data.user + '\n'} 
                    </Text>
                    {
                        
                        (data != undefined && typeof(data.main_img) == 'string' && data.main_img.length > 0) ?
                        (<View style={styles.imageContainer}>
                            <Image source={{ uri : `${Constant.ROOT_URL}${data.main_img.substring(1)}` }}
                            resizeMode="center"
                            style={styles.image}
                        
                            />
                        </View>) : null
                    }
                   
                    {
                        data.user == user.username &&
                        (
                            <View style={styles.buttonContainer}>
                                <CustomButton
                                buttonStyle={styles.button}
                                text="edit"
                                onPress={onEdit}
                                />
                                <CustomButton
                                buttonStyle={styles.button}
                                text="delete"
                                onPress={onDelete}
                                />
                            </View>
                        )
                    }
                    </View>
                 
                    { nutrientPanel()}
                    { ingredients() }
                </View>
            }
            
            // main list content
            data = {data.steps}
            renderItem = {({item}) => {
                return renderData(item)
            }}
            keyExtractor = {item => `${item.step_number}`}
            
            // bottom of list
            ListFooterComponent={
                <View style={styles.footer}>
                </View>
            }
            />
            { recordButton() }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        //alignContent: 'center'
    },
    header: {
        height: 'auto'
    },
    stepsTab:{
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 20
    },
    account: {
        height: 'auto',
        backgroundColor: '#561ddb',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        margin: 10,
    },
    accountText:{
        color: '#fff',
        margin: 10
    },
    buttonContainer: {
        flexDirection: 'row'
    },
    footer: {
        alignItems: 'center',
        marginBottom: '30%'
    },
    nutrientInfoText: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 1,
        margin: 2,
        textAlign: 'center'
    },
    recordInfo: {
        borderColor: orange
    },
    recipeInfo: {
        borderColor: green
    },
    recipeInfoExceed: {
        borderColor: red
    },
    targetInfo: {
        borderColor: blue
    },
    legend: {
        height: 5, 
        width: 20,
        borderRadius: 20, 
        margin: 10
    },
    legendContainer : {
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    button: {
        flex: 1,
        margin: 10,
        borderWidth: 1,
        borderColor: '#fff'
    },
    titleText: {
        color: '#fff',
        fontSize: 20
    },
    imageContainer: {
        justifyContent: 'center',
        width: '100%',
    },
    image: {
        width: null,
        height: 300,
        borderRadius: 15,
    },
    ingredientContainer: {
        margin: 10, 
        backgroundColor: '#fff'
    },
    ingredient: {
        flexDirection: 'row', 
        margin: 5
    },
    floatButtonContainer: {
        position: 'absolute',
        bottom: 70,
        right: 20
    }
});

export default RecipeDetail