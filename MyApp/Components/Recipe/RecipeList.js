import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, Image } from 'react-native';
import { TouchableOpacity } from "react-native";
import SearchBar from "../../Components/SearchBar";
import * as ServerRequest from '../../API/ServerRequest'
import * as Constant from '../../Constant/Constant';

import { useSelector, useDispatch } from 'react-redux';
import { setSubuserArray, setCurrentSubuser, setUser, setLogout } from '../../redux/userSlice'
import LoadingView from "../../Components/LoadingView";
import CustomButton from "../../Components/CustomButton";

function RecipeList({ navigation }) {
    const { user, currentSubuser, subuserArray } = useSelector(state => state.user);

    const [data, setData] = useState([]);
    const [isMyRecipe, setMyRecipe] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    // https://reactnative.dev/docs/network
    const getRecipe = async (query='') => {
        try {
            const baseEndpoint = (isMyRecipe && user.username !== '') ? `api/useraccounts/${user.username}/myrecipes/` : 'api/recipes/'
            const endpoint = query == '' ? baseEndpoint : `${baseEndpoint}${query}`
            const response = await ServerRequest.httpRequest({
                method: 'GET', 
                endpoint: endpoint,
                navigation: navigation,
                isAuthRequired: (isMyRecipe && user.username !== '')
            });
            const json = response.json;
            setData(json);
            console.log(json)
          } catch (error) {
            console.error(error);
          } 
    };

    const onSearch = (searchQuery) => {
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

    const switchIsMyRecipe = () => {
        setMyRecipe(!isMyRecipe);
        if (isMyRecipe) {
            getRecipe();
        }
    };

    return(
        <View style={styles.container}>
            <FlatList
            
            ListHeaderComponent={
                <View style={styles.headerContainer}>
                    {
                        user.username !== '' &&
                        <View style={styles.switchMyButtonContainer}>
                            <CustomButton
                            buttonStyle={(isMyRecipe && user.username !== '') ? {} : { backgroundColor: '#bbb' }}
                            text="my recipe"
                            onPress={switchIsMyRecipe}
                            />
                        </View>
                    }   
                    <View style={styles.searchBarContainer}>
                        <SearchBar
                        value={searchValue}
                        setValue={setSearchValue}
                        onSearch={()=>{onSearch(searchValue)}}
                        />
                    </View>
                </View>
            }

            data = {data}
            renderItem = {({item}) => {
                return renderData(item)
            }}
            keyExtractor = {item => `${item.id}`}
            
            ListFooterComponent={
                <Text></Text>
            }
            ListFooterComponentStyle={{marginBottom: 100}}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 50
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    switchMyButtonContainer: {
        flex: 4,
        paddingHorizontal: 10
    },
    searchBarContainer: {
        flex: 6,
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
});

export default RecipeList