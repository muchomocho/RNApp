import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert } from 'react-native';
import GlobalConstant from '../Global/Global'

function Recipe({ navigation }) {

    const [data, setData] = useState([]);

    // https://reactnative.dev/docs/network
    const getRecipe = async () => {
        try {
            const response = await fetch(GlobalConstant.rootUrl + 'api/recipetitles/', {
                method: "GET"
            });
            const json = await response.json();
            setData(json);
          } catch (error) {
            console.error(error);
          } 
    }

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


    const styles = StyleSheet.create({
        container: {
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
            textAlign: 'center',
            textAlignVertical: 'center'
        },
    });

    const renderData = (item) => {
        return(
            <View style={styles.container}>
                <Text style={styles.image}>{item.id}</Text>
                <View style={styles.detail}>
                    <Text style={styles.detailTitle}>{item.title}</Text>
                    <Text style={styles.detailText}>created by {item.user}</Text>
                </View>
            </View>
        )
    }

    return(
        <FlatList
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
)

    
}

export default Recipe