import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { TouchableRipple } from "react-native-paper";
import SearchBar from "../SearchBar";
import * as ServerRequest from '../../API/ServerRequest'
import * as Constant from '../../Constant/Constant';

import { useSelector, useDispatch } from 'react-redux';
import CustomButton from "../CustomButton";
import LoadingView from "../LoadingView";
import TabSwitch from "../TabSwitch";

function FoodDataSelection({navigation, isRecording=false}) {
    
    const { user, currentSubuser, subuserArray } = useSelector(state => state.user);
    const { name: foodName, image, amount_in_grams, nutrient_data, id } = useSelector(state => state.fooddata.fooddata);

    const dispatch = useDispatch();

    const headerHeight = useHeaderHeight();

    const [data, setData] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [isMyFood, setMyFood] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    // https://reactnative.dev/docs/network
    const getFood = async (query='', myfood=false) => {
        try {
            const isLoggedin = (user != undefined && typeof(user.username) == 'string'  && user.username !== '');
            const endpoint = ((myfood || isMyFood) && isLoggedin) ? `api/useraccounts/${user.username}/myfooddata/` : 'api/fooddata/';
            const response = await ServerRequest.httpRequest({
                method: 'GET', 
                endpoint: endpoint + query,
                navigation: navigation,
                isAuthRequired: isLoggedin
            });
            const json = response.json;
            if (response.response.status == 200) {
                setData(json);
                setLoading(false);
            } else {
                setData([]);
                setLoading(false);
            }
          } catch (error) {
            setData([]);
            setLoading(false);
          } 
    };
    

    const onSearch = (searchQuery) => {
        setLoading(true);
        getFood('?name='+searchQuery);
    };

    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
        const reload = navigation.addListener('focus', () => {
          // The screen is focused
          // Call any action
        });
        setMyFood(false);
        setData([]);
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
    }, [navigation]);

    const onPress = (id) => {
        navigation.navigate('Confirm fooddata', { fooddataID: id, isRecording: isRecording })
    };

    const renderData = (item) => {
        var image = null;
        
        var url = Constant.ROOT_URL + item.main_img
        url = url.replace(/\/\//g, '/')
        url = url.replace(':/', '://')

        if (typeof(item.main_img)=='string' && item.main_img != '') {
            image = 
                <View style={styles.imageContainer} >
                    <Image
                        resizeMode="contain"
                        resizeMethod="scale"
                        style={styles.image}
                        source={{uri: url}}
                    />
                </View>
        }
        return(
            <TouchableOpacity 
            style={styles.foodContainer}
            onPress={() => {onPress(item.id)}}
            >
                    { image }
                
                <View style={styles.detail}>
                    <Text style={styles.detailTitle}>{item.name}</Text>
                    {
                        item.uploader != 'admin' &&
                        <Text style={styles.detailText}>created by {item.uploader}</Text>
                    }   
                </View>
            </TouchableOpacity>
        )
    }

    const onMyFood = () => {
        if (!isLoading) {
            setMyFood(true);
            getFood('', true);
            setLoading(true);
        }
    };

    const onAllFood = () => {
        if (!isLoading) {
            setMyFood(false);
            setData([]);
        }
    };

    const tabs = () => {
        return (
            <View style={styles.tabContainer} >
                <View style={styles.switchMyButtonContainer}>
                    <View  style={[styles.title, !isMyFood ? styles.focused : null]}>
                        <TouchableRipple style={styles.tab} onPress={onAllFood}> 
                            <Text > All food </Text> 
                        </TouchableRipple>
                    </View>
                </View>
                {
                    user.username !== '' &&
                    <View style={styles.switchMyButtonContainer}>
                        <View  style={[styles.title, isMyFood ? styles.focused : null]}>
                            <TouchableRipple style={styles.tab} onPress={onMyFood}> 
                                <Text > My food </Text> 
                            </TouchableRipple>
                        </View>
                    </View>
                }   
            </View>
        );
    };

    const header = () => {
        return (
            <View style={styles.headerContainer}>
                { tabs() }
                <View style={styles.searchBarContainer}>
                    <SearchBar
                    value={searchValue}
                    setValue={setSearchValue}
                    onSearch={()=>{onSearch(searchValue)}}
                    />
                </View>
            </View>
        );
    }
    
    const content = () => {
        if (isLoading) {
            return (
                <View >
                    { header() }
                   <LoadingView />
                </View>
            );
        }   
        return (
            <FlatList
                ListHeaderComponent={
                    header()
                }

                data = {data}
                renderItem = {({item}) => {
                    return renderData(item);
                }}
                keyExtractor = {item => `${item.id}`}
                
                ListFooterComponent={
                    <Text></Text>
                }
                ListFooterComponentStyle={{marginBottom: 100}}
            />
        );
    }

    return(
        <View style={styles.container}>
            { content() }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 50,
        height: '100%'
    },
    headerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    switchMyButtonContainer: {
        flex: 1,
        minHeight: 50
    },
    searchBarContainer: {
        width: '100%',
        marginTop: 10,
        paddingHorizontal: 10
    },
    foodContainer: {
        flexDirection: 'row',
        height: 120,
        width: '95%',
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 10,
        margin: 10,

        elevation: 3,
        shadowColor: '#eee',
        shadowRadius: 0,
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 100
        },
    },
    detail: {
        marginLeft: 10,
        flex: 1,
        overflow: 'hidden'
    },
    detailTitle: {
        flexWrap: 'wrap',
        fontSize: 16,
        overflow: 'hidden'
    },
    detailText: {
        flexWrap: 'wrap',
        overflow: 'hidden'
    },
    imageContainer: {
        flex: 1,
    },
    image: {
        flex:1,
        width: null,
        height: '100%',
        borderRadius: 15,
    },
    tabContainer: {
        width: '100%',
        flexDirection: 'row'
    },
    tab: {
        minHeight: 50,
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        flex: 1,
        backgroundColor: '#000',
        height: 50,
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    focused: {
        backgroundColor: '#eee',
        borderBottomWidth: 3,
        borderBottomColor: '#561ddb'
    },
});

export default FoodDataSelection;