import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, StyleSheet, Pressable, FlatList } from 'react-native';
import foodDataJson from '../../assets/JSON/food_integrated_dataset.json'
import foodDataUnitJson from '../../assets/JSON/food_integrated_dataset_units.json'
import CustomButton from '../CustomButton';
import SearchBar from '../SearchBar';

export default function FoodDataSelection({navigation}) {

    const [searchValue, setSearchValue] = useState('');
    const [foodList, setFoodList] = useState([]);

    const getFoodList = () => {
        var arr = new Array();
        foodDataJson.forEach((element, index, array) => {
            if (searchValue.length > 0) {
                if (element['name'].toLowerCase().includes(searchValue.toLowerCase())) {
                    arr.push(
                        {
                            "id": element['id'],
                            "name": element['name']
                        });
                }
            }
        });
        return arr;
    };

    const foodDetails = (foodName) => {
        return foodDataJson[foodName];
    };

    const renderItem = (item) => {
        return(
            <CustomButton
            text={item.name}
            buttonStyle={styles.button}
            onPress={() => {onPress(foodDataJson[item.id-1])}}
            />
        );
    };

    const onSearch = () => {
        setFoodList(getFoodList());
    };

    const onPress = (foodDataParam) => {
        navigation.navigate('Confirm fooddata', { food_data: foodDataParam })
    };

    return (
        <View style={styles.container}>
            <FlatList
            ListHeaderComponent={
                <SearchBar
                value={searchValue}
                setValue={setSearchValue}
                onSearch={()=>{onSearch(searchValue)}}
                />
            }
            numColumns={2}
            //contentContainerStyle={{flexDirection : "row", flexWrap : "wrap"}} 
            data={foodList} renderItem={
               ({item}) => renderItem(item)
            }
            keyExtractor={item => `${item.id}`}
            ListFooterComponent={
                <View style={styles.footer}>

                </View>
            }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignContent: 'center',
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
    }
});
