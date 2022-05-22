import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, Modal } from 'react-native';
import { httpRequest } from "../API/ServerRequest";
import { useSelector, useDispatch } from 'react-redux';
import CustomInput from "../Components/CustomInput";
import TabSwitch from "../Components/TabSwitch";
import CustomButton from "../Components/CustomButton";

function Request({ navigation }) {
    const { user, currentSubuser, subuserArray } = useSelector(state => state.user);
    const [fromData, setFromData] = useState([]);
    const [toData, setToData] = useState([]);
    const [isShowModal, setShowModal] = useState(false);
    const [toUser, setToUser] = useState('');
    const [requestText, setRequestText] = useState('');

    // https://reactnative.dev/docs/network
    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
        const reload = navigation.addListener('focus', async () => {
            // The screen is focused
            // Call any action
            await getRequestFrom();
            await getRequestTo();
        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return reload;
    }, [navigation]);


    const networkErrorAlert = (text) => {
        return (
            Alert.alert(
                "Error",
                `${text ? text : 'network error'}`,
                [
                  { text: "OK", onPress: () => {} }
                ]
            )
        );
    };

    const getRequestFrom = async () => {
        if (user.username == '') return;
        try {
            const result = await httpRequest({
                method: 'GET',
                endpoint: `api/useraccounts/${user.username}/request-from/`,
                isAuthRequired: true,
                navigation: navigation
            });

            if (result.response.status == 200) {
                setFromData(result.json);
                return;
            }
            if (result.response.status == 400) {
                networkErrorAlert(result.json)
                return;
            }
            networkErrorAlert();
        } catch (error) {
            networkErrorAlert();
        }
    };

    const getRequestTo = async () => {
        if (user.username == '') return;
        try {
            const result = await httpRequest({
                method: 'GET',
                endpoint: `api/useraccounts/${user.username}/request-to/`,
                isAuthRequired: true,
                navigation: navigation
            });

            if (result.response.status == 200) {
                setToData(result.json);
                return;
            }
            if (result.response.status == 400) {
                networkErrorAlert(result.json)
                return;
            }
            networkErrorAlert();
        } catch (error) {
            networkErrorAlert();
        }
    };

    const dismissRequest = () => {

    };

    const makeRequestTo = async (username, text) => {
        if (user.username == '') return;

        try {
            const result = await httpRequest({
                method: 'POST',
                endpoint: `api/useraccounts/${user.username}/request-to/`,
                body: {
                    request_sent_to: username,
                    text: text
                },
                isAuthRequired: true,
                navigation: navigation
            });
            if (result.response.status == 201) {
                setToData(result.json);
                setShowModal(false);
                return;
            }
            if (result.response.status == 400) {
                networkErrorAlert(result.json)
                return;
            }
            networkErrorAlert();
        } catch (error) {
            networkErrorAlert();
        }
    };

    const makeRequestButton = () => {
        const onPress = () => {
            setShowModal(true);
        };
        return (
            <View style={styles.addButtonContainer}>
                <CustomButton
                buttonStyle={styles.addButton} 
                textStyle={styles.buttonText}
                text="+"
                onPress={onPress}
                />
            </View>
        );
    };

    const makeRequestModal = () => {
        const switchShowModal = () => {
            setShowModal(!isShowModal);
        };
        const onPress = () => {
            makeRequestTo(toUser, requestText);
        };
        return (
            <Modal visible={isShowModal}>
                <CustomButton
                text="close"
                onPress={switchShowModal}
                />
                <Text>Send to user:</Text>
                <CustomInput
                value={toUser}
                setValue={setToUser}
                placeholder="Send request to..."
                />
                <CustomInput
                value={requestText}
                setValue={setRequestText}
                placeholder="comment regarding text..."
                />
                <CustomButton
                text="submit"
                onPress={onPress}
                />
                
            </Modal>
        );
    };

    const requestReceivedFlatList = () => {
        const renderData = ({item}) => {
            return (
                <View>
                    <Text>From {item.request_received_from}</Text>
                    <Text>Comment: {item.text}</Text>
                </View>
            );
        };
        return (
            <FlatList 
            data={fromData}
            renderItem={renderData}
            keyExtractor={item=>item.id}
            />
        );
    };

    const requestSentFlatList = () => {
        const renderData = ({item}) => {
            return (
                <View>
                    <Text>To {item.request_sent_to}</Text>
                    <Text>Comment: {item.text}</Text>
                </View>
            );
        };
        return (
            <FlatList 
            data={toData}
            renderItem={renderData}
            keyExtractor={item=>item.id}
            />
        );
    };

    const tabComponents = [
        { title: 'Received', component: requestReceivedFlatList(),  },
        { title: 'Sent', component: requestSentFlatList(),  },
    ]

    if (user.username != '') {
        return (
            < >  
                { makeRequestButton() }
                { makeRequestModal() }
                <TabSwitch titleComponentArray={tabComponents}/>
                
            </>
        );
    }

    return (
        <View>
            <Text>Requires login</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 50,
        marginBottom: 50
    },
    addButtonContainer: {
        position: 'absolute',
        width: 60,
        height: 60,
        bottom: 90,
        right: 30
    },
    addButton: {
        width: 70,
        height: 70,
        borderRadius: 45,
        elevation: 10,
        zIndex: 10
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

export default Request;