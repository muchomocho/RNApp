import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, Image } from 'react-native';
import { TouchableOpacity } from "react-native";
import { TouchableRipple } from "react-native-paper";
import SearchBar from "../../Components/SearchBar";
import * as ServerRequest from '../../API/ServerRequest'
import * as Constant from '../../Constant/Constant';

import { useSelector, useDispatch } from 'react-redux';
import { setSubuserArray, setCurrentSubuser, setUser, setLogout } from '../../redux/userSlice'
import LoadingView from "../../Components/LoadingView";
import CustomButton from "../../Components/CustomButton";
import { clean } from '../../API/helper'

function RecipeList({ navigation, isRecording=false, isRecommendation=false }) {
    const { user, currentSubuser, subuserArray } = useSelector(state => state.user);

    const [data, setData] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [isMyRecipe, setMyRecipe] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    // https://reactnative.dev/docs/network
    const getRecipe = async (query='', myrecipe=false) => {
        try {
                var endpoint = ''
                var isLoggedin = false
                if (isRecommendation) {
                    endpoint = `api/useraccounts/${user.username}/subuser/${currentSubuser.name}/reciperecommendation/`;
                    isLoggedin = true;
                }
                else {
                    isLoggedin = (user != undefined && typeof(user.username) == 'string'  && user.username !== '');
                    const baseEndpoint = ((isMyRecipe || myrecipe) && isLoggedin) ? `api/useraccounts/${user.username}/myrecipes/` : 'api/recipes/'
                    endpoint = query == '' ? baseEndpoint : `${baseEndpoint}${query}`
                }
                setLoading(true);
                const response = await ServerRequest.httpRequest({
                    method: 'GET', 
                    endpoint: endpoint,
                    navigation: navigation,
                    isAuthRequired: isLoggedin
                });
                setLoading(false);
                if (response.response.status == 200) {
                    setData(response.json);
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
        getRecipe(`?title=${searchQuery}`);
    };

    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
        const reload = navigation.addListener('focus', () => {
          // The screen is focused
          // Call any action
          if (isRecommendation) {
            setMyRecipe(true);
            getRecipe();
          } else {
            setMyRecipe(false);
          }
        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
    }, [navigation]);

    const renderData = (item) => {
        var image = null;
        
        var url = Constant.ROOT_URL + item.main_img
        url = url.replace(/\/\//g, '/')
        url = url.replace(':/', '://')

        if (typeof(item.main_img)=='string' && item.main_img != '') {
            image = 
                <View style={styles.imageContainer} >
                    <Image
                        resizeMode="center"
                        resizeMethod="resize"
                        style={styles.image}
                        source={{uri: url}}
                    />
                </View>
        }
       
        return(
            <TouchableOpacity 
            style={styles.recipeContainer}
            onPress={() => {navigation.navigate('Recipe detail', {recipe: item});}}
            >   
                { image }
                <View style={styles.detail}>
                    <Text style={styles.detailTitle}>{item.title}</Text>
                    <Text style={styles.detailText}>created by {item.user}</Text>
                    { 
                        isRecommendation &&
                        <Text>High in: { clean(item.high_in) } </Text>
                    }
                </View>
            </TouchableOpacity>
        )
    }

    const createButton = () => {
        return (
            <View style={styles.buttonContainer}>
                <CustomButton
                buttonStyle={styles.button}
                textStyle={styles.buttonText}
                text="+"
                onPress={()=>{ navigation.navigate('Create recipe') }}
                />
            </View>
        );
    };

    const onMyRecipe = () => {
        if(!isLoading) {
            setMyRecipe(true);
            setLoading(true);
            getRecipe('', true);
        }
    };

    const onAllRecipe = () => {
        if (!isLoading) {
            setMyRecipe(false);
            setData([]);
        }
    };

    const tabs = () => {
        return (
            <View style={styles.tabContainer} >
                <View style={styles.switchMyButtonContainer}>
                    <View  style={[styles.title, !isMyRecipe? styles.focused : null]}>
                        <TouchableRipple style={styles.tab} onPress={onAllRecipe}> 
                            <Text > All recipe </Text> 
                        </TouchableRipple>
                    </View>
                </View>
                {
                    user.username !== '' &&
                    <View style={styles.switchMyButtonContainer}>
                        <View  style={[styles.title, isMyRecipe ? styles.focused : null]}>
                            <TouchableRipple style={styles.tab} onPress={onMyRecipe}> 
                                <Text > My recipe </Text> 
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
                {
                    !isRecommendation &&
                    tabs()
                }
                {
                    !isRecommendation &&
                <View style={styles.searchBarContainer}>
                    <SearchBar
                    value={searchValue}
                    setValue={setSearchValue}
                    onSearch={()=>{onSearch(searchValue)}}
                    />
                </View>
                }
            </View>
        );
    };

    const content = () => {
        if (isLoading) {
            return (
                <View >
                    { header() }
                   <LoadingView />
                </View>
            );
        }   
       return(
            <FlatList
            
            ListHeaderComponent={
                header()  
            }

            data = {data}
            renderItem = {({item}) => {
                return renderData(item)
            }}
            keyExtractor = {item => `${item.id}${item.title}${item.high_in}`}
            
            ListFooterComponent={
                <Text></Text>
            }
            ListFooterComponentStyle={{marginBottom: 0}}
            />
        ); 
    };

    return(
        <View style={styles.container}>
            { content() }
            { 
                (
                    !isRecording &&
                    !isRecommendation &&
                    user != undefined &&
                    
                    typeof(user.username) == 'string' &&
                    
                    user.username.length > 0 
                ) && createButton() 
            }
        </View>
    );
    
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 50,
        height: '100%',
        //backgroundColor: '#000'
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
    recipeContainer: {
        flexDirection: 'row',
        height: 150,
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
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        flex: 1,
        height: 50,
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    focused: {
        backgroundColor: '#eee',
        borderBottomWidth: 3,
        borderBottomColor: '#561ddb'
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 90,
        right: 20,
    },
    button: {
   
        width: 70,
        height: 70,
        borderRadius: 45,
        elevation: 10,

    },
    buttonText: {
        color: '#fff',
        fontSize: 30,
        alignSelf: 'center',
        height: '100%',
        alignItems: 'center',
        textAlignVertical: 'center'
    },
});

export default RecipeList