import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert } from 'react-native';
import * as ServerRequest from '../API/ServerRequest';

function RecipeDetail(props) {
    const [data, setData] = useState([]);

    // https://reactnative.dev/docs/network

    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
        const reload = props.navigation.addListener('focus', async () => {
            // The screen is focused
            // Call any action
            try {
                const result = await ServerRequest.httpRequest({
                method: 'GET',
                endpoint: 'api/recipes/' + props.route.params.recipe.id + '/'
            });
            setData(result.json);
        } catch (error) {
            console.log('recipedetail', error)
        }
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

    // https://reactnative.dev/docs/flatlist
    return(
        <View >
            <FlatList
            style={styles.container}

            // top of list
            ListHeaderComponent={
                <View style={[styles.account, styles.header]}>
                    <Text style={styles.accountText}>
                        id: {data.id + '\n'} 
                        title: {data.title}
                    </Text>
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
        marginTop: '15%'
    },
    footer: {
        alignItems: 'center',
        marginBottom: '30%'
    },
    account:{
        backgroundColor: '#561ddb',
        borderRadius: 5,
        padding: 20,
        margin: 10,
    },
    accountText:{
        color: '#fff'
    },
    iconContainer: {
        flex: 1,
        backgroundColor: '#eee',
        borderRadius: 100
    },
    peopleTab: {
        flexDirection: 'row',
        height: 100,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 20,
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
    peopleDetailContainer: {
        flex: 2,
        margin: 0, 
        //backgroundColor: '#000',
        marginLeft: '10%',
        //alignContent: 'center',
        //alignItems: 'center'
    },
    labelContainer:{
        flexDirection: 'row',
        borderBottomColor: '#000',
        borderBottomWidth: 0
    },
    peopleTextName:{
        fontSize: 20,
    },
    peopleText: {
        marginLeft: 10,
    },
    button: {
        width: '95%',
    }
});

export default RecipeDetail