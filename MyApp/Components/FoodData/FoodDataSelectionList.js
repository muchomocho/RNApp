import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, StyleSheet, Pressable, FlatList, Picker } from 'react-native';
import foodDataJson from '../../assets/JSON/food_integrated_dataset.json'
import foodDataUnitJson from '../../assets/JSON/food_integrated_dataset_units.json'
import CustomButton from '../CustomButton';
import SearchBar from '../SearchBar';

import { useSelector, useDispatch } from 'react-redux';
import { addRecordSelection, deleteRecordSelection, clearRecord, setMealRecord, setMealRecordTitle, addRecipeRecordSelection, deleteRecipeRecordSelection } from '../../redux/mealRecordSlice'
import { httpRequest } from '../../API/ServerRequest';
import CustomInput from '../CustomInput';
import DateTimePicker from '@react-native-community/datetimepicker';
import { amountFormatter } from '../../API/helper';

export default function FoodDataSelectionList({onSubmit, navigation}) {

    const { user, currentSubuser, subuserArray } = useSelector(state => state.user);
    const { mealRecord, recordList, isMealUpdate, recipeRecordList } = useSelector(state => state.mealRecord);
    const dispatch = useDispatch();

    const [title, setTitle] = useState(mealRecord.title);

    const recordDate = (mealRecord.time == '' ? new Date() : new Date(mealRecord.time));
    const [datetime, setDatetime] = useState(recordDate);
    const [isDateEntryAuto, setIsDateEntryAuto] = useState(mealRecord.time == '' ? false : true);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    
    /* https://github.com/react-native-datetimepicker/datetimepicker */
    // datepicker module is used in this component.
    // date and time can be picked from an interactive popup.

    const onPress = () => {
        if (recordList.length > 0 || recipeRecordList.length > 0) {
            const endpoint = 'api/useraccounts/'
                + user.username
                + '/subuser/'
                + currentSubuser.id
                + '/usermealrecord/';
            
            if (isMealUpdate) {
                // TODO update
                // back end iterates all records of the specified date -> if what was recorded is not there 
                sendData('PUT', endpoint + mealRecord.id + '/')
                return;
            }
  
            sendData('POST', endpoint)
            return;
        }
    };

    const sendData = async (method, endpoint) => {

        const recordListFormatted = () => {
            var returnList = new Array();
            const recordListCopy = recordList.slice();
            recordListCopy.forEach(element => {
                var obj = {};
                obj.amount_in_grams = amountFormatter(String(parseFloat(element.amount_in_grams).toFixed(5)));
                if (Object.prototype.hasOwnProperty.call(element.food_data, 'id')) {
                    obj.food_data = element.food_data.id;
                }
                else {
                    obj.food_data = element.food_data;
                }
                returnList.push(obj)
            });
            return returnList;
        };

        const body = {
            subuser: currentSubuser.id,
            time: datetime,
            title: (title.length <= 0 ? 'no title' : title),
            meal_content: recordListFormatted(),
            recipe_meal_content: recipeRecordList.map(element=>{ return { recipe: element.recipe.id }})
        };

        console.log(body)

        try {
            const result = await httpRequest({
                method: method,
                endpoint: endpoint,
                body: body,
                isAuthRequired: true,
                navigation: navigation
            });

            if (result.response.status == 201) {
                dispatch(clearRecord());
                onSubmit();
            } 
            else {
                Alert.alert(
                    "Error",
                    `Could not send data. Check network is avaiable`,
                    [
                        { text: "OK", onPress: () => {} }
                    ]
                );
            }
        } catch (error) {
            Alert.alert(
                "Error",
                `Could not send data. Check network is avaiable`,
                [
                    { text: "OK", onPress: () => {} }
                ]
            );
        }
        
    };

    const validate = () => {
        
    };

    
    const onDateConfirm = (event, date) => {
        if (event.type == 'set') {
            var dateTemp = datetime;
            const dateObj = new Date(date)
            dateTemp.setFullYear(dateObj.getFullYear());
            dateTemp.setMonth(dateObj.getMonth());
            dateTemp.setDate(dateObj.getDate());
            setDatetime(dateTemp);
        }
        setShowDatePicker(false);
    };

    const onTimeConfirm = (event, date) => {
        if (event.type == 'set') {           
            var dateTemp = datetime;
            const dateObj = new Date(date)
            console.log(dateObj.getHours())
            dateTemp.setHours(dateObj.getHours());
            dateTemp.setMinutes(dateObj.getMinutes());
            setDatetime(dateTemp);
        }
        setShowTimePicker(false);
    };

    const timePicker = () => {
        return (
            <View style={styles.timeContainer}>
                <Text>Time: </Text>
                
                <View style={styles.datePickerContainer}>
                    <View style={styles.datePickerTextContainer}>
                        <Text> { datetime.getFullYear() } / { datetime.getMonth()+1 } / { datetime.getDate() } </Text>
                    </View>
                    <View style={styles.datePickerButtonContainer}>
                        <CustomButton
                            text={'pick date'}
                            onPress={() => {setShowDatePicker(true)}}
                        />
                    </View>
                </View>
                <View style={styles.datePickerContainer}>
                    <View style={styles.datePickerTextContainer}>
                        <Text> { datetime.getHours() } : { datetime.getMinutes() } </Text>
                    </View>
                    <View style={styles.datePickerButtonContainer}>
                        <CustomButton
                            text={'pick time'}
                            onPress={() => {setShowTimePicker(true)}}
                        />
                    </View>
                </View>

                { showDatePicker && <DateTimePicker value={datetime} onChange={onDateConfirm} mode="date" />}
                { showTimePicker && <DateTimePicker value={datetime} onChange={onTimeConfirm} mode="time" /> }
            </View>
        );
    };

    const foodFlatList = () => {
        const renderItem = (item) => {
            const onDelete = () => {
                dispatch(deleteRecordSelection(item.food_data.id));
            };
            return(
                <View style={styles.itemContainer}>
                    <View style={styles.item}>
                        <Text style={styles.itemTextLeft}>{item.food_data.name}</Text>
                        <Text style={styles.itemTextRight}>{amountFormatter(item.amount_in_grams)} g</Text>
                        <CustomButton
                        buttonStyle={styles.itemButton}
                        textStyle={styles.itemButtonText}
                        text={'delete'}
                        onPress={onDelete}
                        />
                    </View>
                </View>
            );
        };
        return (
            <FlatList
            
            data={recordList} 
            renderItem={
                ({item}) => renderItem(item)
            }
            keyExtractor={item => `${item.food_data.id}`}
            />
        );
    };

    const recipeFlatList = () => {
        const renderItem = (item) => {
            const onDelete = () => {
                dispatch(deleteRecipeRecordSelection(item.tempID));
            };
            console.log(item)
            return(
                <View style={styles.itemContainer}>
                    <View style={styles.item}>
                        <Text style={styles.itemTextLeft}>{item.recipe.title}</Text>
                        <CustomButton
                        buttonStyle={styles.itemButton}
                        textStyle={styles.itemButtonText}
                        text={'delete'}
                        onPress={onDelete}
                        />
                    </View>
                </View>
            );
        };
        return (
            <FlatList
            data={recipeRecordList} 
            renderItem={
                ({item}) => renderItem(item)
            }
            keyExtractor={item => `${item.tempID}`}
            />
        );
    };

    const flatlistComponents = [
        { id: 1, component: foodFlatList() },
        { id: 2, component: recipeFlatList() }
    ]

    const renderLists = ({item}) => {
        return item.component;
    };

    return (
        <View style={styles.container}>
            <FlatList
            ListHeaderComponent={
                <View>
                    <Text>Title: </Text>
                    <CustomInput 
                        defaultValue={mealRecord.title != '' && mealRecord.title != null || mealRecord.title != undefined ? mealRecord.title : '' }
                        value={title}
                        setValue={setTitle}
                        placeholder="no title"
                    />
                    
                    { timePicker() }

                    
                </View>
            }
            
            data={flatlistComponents}
            renderItem={renderLists}
            keyExtractor={item=>item.id}
            
            ListFooterComponent={
                <View style={styles.footer}>
                    <CustomButton
                    buttonStyle={recordList.length > 0 || recipeRecordList.length > 0 ? {} : {backgroundColor: '#ddd'}}
                    text={'submit'}
                    onPress={onPress}
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
    timeContainer: {
        width: 'auto',
        padding: 10,
    },
    datePickerTextContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#555',
        marginVertical: 5,
        marginRight: 10
    },
    datePickerButtonContainer: {
        flex: 1,
        height: '100%',
        padding: 0,
    },
    datePickerContainer: {
        flexDirection: 'row',
        width: '100%'
    },
    item: {
        flexDirection: 'row',
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
});
