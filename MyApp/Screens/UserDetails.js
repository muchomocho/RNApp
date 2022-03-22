import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert } from 'react-native';

function UserDetail() {

    const [data, setData] = useState([]);

    const getRecipe = async () => {
        try {
            const response = await fetch('api/recipes/', {
                method: "GET"
            });
            const json = await response.json();
            setData(json);
          } catch (error) {
            console.error(error);
          } 
    }

    useEffect(() => {
        getRecipe();
    }, []);
/*
    useEffect(() => {
        fetch('http://192.168.0.32:8081/api/recipes/', {
            method: "GET"
        })
        .then((resp) => resp.json())
        .then((data) => {
            setData(data)
        })
        .catch(error => Alert.alert("error", error.message))
    }, [])
*/
    const styles = StyleSheet.create({
        cardStyle: {
            width: '95%',
            backgroundColor: '#eee',
            borderRadius: 30,
            padding: 10,
            margin: 10
        }
    });

    const renderData = (item) => {
        return(
            <View style={styles.cardStyle}>
                <Text>{item.id}</Text>
                <Text>{item.user_ID}</Text>
                <Text>{item.main_image_url}</Text>
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
        />
)

    
}

export default Recipe