import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert } from 'react-native';
import * as ServerRequest from '../API/ServerRequest';
import { useSelector, useDispatch } from 'react-redux';
import CustomButton from "../Components/CustomButton";
import { addRecipeRecordSelection } from '../redux/mealRecordSlice'
import { VictoryAnimation, VictoryPie, VictoryLabel } from "victory-native";
import targetJson from '../assets/JSON/gov_diet_recommendation.json';
import unitJson from '../assets/JSON/gov_diet_recommendation_units.json';
import { genderMap, ageMap } from '../API/helper'
import Svg from "react-native-svg";
import { formatDate, lessThanNutrients } from '../API/helper';

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
            }
        } catch (error) {
            console.log('recipedetail', error)
        }
    };

    const getUserRecord = async () => {

        if (user.username == '' || currentSubuser.name == '') {
                console.log(2, user.username, currentSubuser.name)

                return;
            }
        try {
            const result = await ServerRequest.httpRequest({
                method: 'GET',
                endpoint: 'api/useraccounts/'
                + user.username
                + '/subuser/'
                + currentSubuser.name
                + '/userrecord/'
                + formatDate(new Date()) + '/',
                isAuthRequired: true,
                navigation: props.navigation
            });
            setRecord(result.json);
            console.log(result.json)
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

    const renderData = (item) => {
        return(
            <View style={styles.peopleTab}>
                <Text>{item.step_number}</Text>
                <Text>{item.text}</Text>
            </View>
        )
    }

    const recordModal = () => {

        return (
            <Modal
                animationType="slide"
                visible={isShowModal} >
                <CustomButton
                    buttonStyle={styles.closeButton}
                    textStyle={styles.closeButtontext}
                    text="close"
                    onPress={switchShowModal}
                />
                <View>
                    <Text> {data.title}</Text>
                </View>
            </Modal>
        );
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
        <View >
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

    const switchShowModal = () => {
        setIsShowModal(!isShowModal);
    };

    const onEdit = () => {

    };

    const onDelete = () => {

    };

    // https://reactnative.dev/docs/flatlist
    return(
        <View >
            <FlatList
            style={styles.container}

            // top of list
            ListHeaderComponent={
                <View>
                <View style={[styles.account, styles.header]}>
                    <Text style={styles.titleText}>title: {data.title}</Text>
                    <Text style={styles.accountText}>
                        created by: {data.user + '\n'} 
                    </Text>
                   
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        //alignContent: 'center'
    },
    header: {
        marginTop: '15%',
    },
    account: {
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
        borderColor: green
    },
    recipeInfo: {
        borderColor: orange
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
});

export default RecipeDetail