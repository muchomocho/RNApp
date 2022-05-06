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

function RecipeList({ navigation, isRecording=false }) {
    const { user, currentSubuser, subuserArray } = useSelector(state => state.user);

    const [data, setData] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [isMyRecipe, setMyRecipe] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    // https://reactnative.dev/docs/network
    const getRecipe = async (query='', myrecipe=false) => {
        try {
            const isLoggedin = (user != undefined && typeof(user.username) == 'string'  && user.username !== '');
            const baseEndpoint = ((isMyRecipe || myrecipe) && isLoggedin) ? `api/useraccounts/${user.username}/myrecipes/` : 'api/recipes/'
            const endpoint = query == '' ? baseEndpoint : `${baseEndpoint}${query}`
            const response = await ServerRequest.httpRequest({
                method: 'GET', 
                endpoint: endpoint,
                navigation: navigation,
                isAuthRequired: isLoggedin
            });
            const json = response.json;
            setData(json);
            setLoading(false);
          } catch (error) {
            console.error(error);
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
          getRecipe();
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
                <Image
                    resizeMode="contain"
                    resizeMethod="scale"
                    style={styles.image}
                    source={{uri: url}}
                />
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
                </View>
            </TouchableOpacity>
        )
    }

    const createButton = () => {
        return (
            <View style={styles.buttonContainer}>
                <CustomButton
                buttonStyle={styles.button}
                text="+"
                textStyle={{fontSize: 20}}
                onPress={()=>{}}
                />
            </View>
        );
    };

    const switchIsMyRecipe = () => {
        setMyRecipe(!isMyRecipe);
        if (isMyRecipe) {
            getRecipe();
        }
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

    const header = () => {
        return (
            <View style={styles.headerContainer}>
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
                <View style={styles.searchBarContainer}>
                    <SearchBar
                    value={searchValue}
                    setValue={setSearchValue}
                    onSearch={()=>{onSearch(searchValue)}}
                    />
                </View>
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
            keyExtractor = {item => `${item.id}`}
            
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
                    user != undefined &&
                    currentSubuser != undefined &&
                    typeof(user.username) == 'string' &&
                    typeof(currentSubuser.name == 'string') &&
                    user.username.length > 0 && currentSubuser.name.length > 0
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
    image: {
        flexGrow: 1,
        backgroundColor: '#eee',
        
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
        bottom: 60,
        right: 20,
    },
    button: {
        backgroundColor: '#fff',
        width: 70,
        height: 70,
        borderRadius: 45,
        elevation: 10,
    },
});

export default RecipeList