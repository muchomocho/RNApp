import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View, Button, FlatList, Alert, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Checkbox } from "react-native-paper";
import { httpRequest } from "../API/ServerRequest";
import { useSelector, useDispatch } from 'react-redux';
import CustomInput from "../Components/CustomInput";
import TabSwitch from "../Components/TabSwitch";
import CustomButton from "../Components/CustomButton";
import * as Authentication from "../Authentication/Authentication";
import { setSubuserArray, setCurrentSubuser, setUser, setLogout } from '../redux/userSlice'


function Request({ navigation }) {
    const { user, currentSubuser, subuserArray } = useSelector(state => state.user);
    const dispatch = useDispatch();

    const [fromData, setFromData] = useState([]);
    const [toData, setToData] = useState([]);
    const [isShowMakeRequestModal, setShowMakeRequestModal] = useState(false);
    const [isShowRequestDetailModal, setShowRequestDetailModal] = useState(false);

    const [toUser, setToUser] = useState(''); // request sending to
    const [requestText, setRequestText] = useState('');
    const [requestDetail, setRequestDetail] = useState(); // for detailed view
    const [isRecordableRequest, setIsRecordableRequest] = useState(false);
    const [isViewableRequest, setIsViewableRequest] = useState(false);
    const [isRespondDetail, setIsRespondDetail] = useState(false);

    const[chosenSubusers, setChosenSubuser] = useState({});

    //console.log('req', user)
    // https://reactnative.dev/docs/network
    // https://reactnavigation.org/docs/function-after-focusing-screen/
    useEffect(() => {
        const reload = navigation.addListener('focus', async () => {
            // The screen is focused
            // Call any action
            await getRequestFrom();
            await getRequestTo();
            await getUserProfile();
            setChosenSubuser({});
            isRecordableRequest(false);
            isViewableRequest(false);
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

    const dismissRequest = async (fromOrTo, id) => {
        if (user.username == '') return;
        try {
            const result = await httpRequest({
                method: 'DELETE',
                endpoint: `api/useraccounts/${user.username}/${fromOrTo}/${id}/`,
                isAuthRequired: true,
                navigation: navigation
            });

            if (result.response.status == 200) {
                getRequestFrom();
                getRequestTo();
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
                getRequestTo();
                setShowMakeRequestModal(false);
                setToUser();
                setRequestText();
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

    const getUserProfile = async () => {
        try {
            const username = await Authentication.getUsername();

            if (username == '' || username == null || username == undefined) {
                return
            }
           
            const endpoint = `api/useraccounts/${username}/userprofile/`;
            const result = await httpRequest({
                method: 'GET',
                endpoint: endpoint,
                isAuthRequired: true,
                navigation: navigation
            });

            const subusers = {
                privilege_all: result.json.subuser,
                privilege_record: result.json.recordable_subuser,
                privilege_view: result.json.viewable_subuser
            }

            if (result.response.status == 200) {
                dispatch(setSubuserArray(subusers));
            }

        } catch (error) {
            networkErrorAlert();
        }
        
    };

    const share = async (to_user, recordable_subuser=[], viewable_subuser=[]) => {
        try {
            const username = await Authentication.getUsername();

            if (username == '' || username == null || username == undefined) {
                return
            }

            const body = {
                share_with_user: to_user,
                recordable_subuser: recordable_subuser,
                viewable_subuser: viewable_subuser
            }
           
            const endpoint = `api/useraccounts/${username}/share/`;
            const result = await httpRequest({
                method: 'POST',
                endpoint: endpoint,
                body: body,
                isAuthRequired: true,
                navigation: navigation
            });

            if (result.response.status == 200) {
                return;
            }
            networkErrorAlert();

        } catch (error) {
            networkErrorAlert();
        }
    };

    const makeRequestButton = () => {
        const onPress = () => {
            setShowMakeRequestModal(true);
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
            setShowMakeRequestModal(!isShowMakeRequestModal);
        };
        const onPress = () => {
            makeRequestTo(toUser, requestText);
        };
        return (
            <Modal                                
            animationType="slide"
            visible={isShowMakeRequestModal}
            >
                <View style={styles.modal}>
                    <CustomButton
                    buttonStyle={styles.closeButton}
                    textStyle={styles.closeButtonText}
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
                </View>
            </Modal>
        );
    };

    const subuserList = () => {
        
        const onPress = (id) => {
            if (Object.prototype.hasOwnProperty.call(chosenSubusers, id)) {
                var newChosenSubuser = chosenSubusers;
                delete newChosenSubuser[id];
                setChosenSubuser({...newChosenSubuser});
                return;
            }
            var newChosenSubuser = chosenSubusers;
            newChosenSubuser[id] = true;
            setChosenSubuser({
                ...newChosenSubuser
            });
        };
        const renderData = ({item}) => {
            if (item.privilege_all) {
                return (
                    <TouchableOpacity 
                    style={styles.subuserContainer}
                    onPress={()=>{onPress(item.id)}}
                    >
                        <Checkbox
                            status={Object.prototype.hasOwnProperty.call(chosenSubusers, item.id) ? 'checked' : 'unchecked'}
                        /> 
                        <View>
                            <Text>{item.name}</Text>
                            <Text>{item.date_of_birth}</Text>
                        </View>
                    </TouchableOpacity>
                );
            }
        };
        return (
            <FlatList 
            data={subuserArray}
            renderItem={renderData}
            keyExtractor={item=>item.id}
            />
        );
    };

    const detailModal = () => {
        const switchShowModal = () => {
            setShowRequestDetailModal(false);
        };
        const onDismiss = () => {
            return (
                Alert.alert(
                    "Confirmation",
                    `Do you want to dismiss this request?`,
                    [
                        {
                            text: "Cancel", onPress: () => {/*dont do anything*/}
                        },
                        { 
                            text: "OK", onPress: () => {
                                dismissRequest(isRespondDetail ? 'request-from' : 'request-to', requestDetail.id);
                                setShowRequestDetailModal(false);
                            },
                            
                        },
                    ]
                )
            );
        };
        const onPress = () => {
            if (!isRecordableRequest && ! isViewableRequest) return;
            if (isRecordableRequest) {
                share(requestDetail.request_received_from, Object.keys(chosenSubusers), []);
                setShowRequestDetailModal(false);
            }
            share(requestDetail.request_received_from, [], Object.keys(chosenSubusers));
            setShowRequestDetailModal(false);

        };

        if (requestDetail == undefined) return;
        return (
            <Modal                                
            animationType="slide"
            visible={isShowRequestDetailModal}
            >
                <View style={styles.modal}>
                    <FlatList 
                    ListHeaderComponent={
                        <View>
                            <CustomButton
                            buttonStyle={styles.closeButton}
                            textStyle={styles.closeButtonText}
                            text="close"
                            onPress={switchShowModal}
                            />
                            <View style={styles.requestInfo}>
                                <Text>From user: { requestDetail.request_received_from }</Text>
                                <Text>To user: { requestDetail.request_sent_to }</Text>
                                <Text>Comment:</Text>
                                <Text style={{marginVertical: 10}}>{ requestDetail.text }</Text>
                            </View>
                            <CustomButton 
                            text="dismiss"
                            onPress={onDismiss}
                            />
                        </View>
                    }
                    ListFooterComponent={
                        <View>
                        {
                            isRespondDetail &&
                            <View >
                                { subuserList() }
                                <Text style={{width: '100%', textAlign: 'center', marginTop: 50}}>Response</Text>
                                <TouchableOpacity 
                                style={styles.checkbox}
                                onPress={() => {
                                    setIsViewableRequest(!isViewableRequest);
                                    setIsRecordableRequest(false);
                                    }}
                                >
                                    <Checkbox
                                        status={isViewableRequest ? 'checked' : 'unchecked'}
                                    /> 
                                    <Text>User can view subuser(s)</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                style={styles.checkbox}
                                onPress={() => {
                                    setIsRecordableRequest(!isRecordableRequest);
                                    setIsViewableRequest(false);
                                    }}
                                >
                                    <Checkbox
                                        status={isRecordableRequest ? 'checked' : 'unchecked'}
                                        
                                    /> 
                                    <Text>User can view and record subuser(s)</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        
                        { 
                            isRespondDetail &&
                            <CustomButton
                            text="submit"
                            buttonStyle={[((!isRecordableRequest && !isViewableRequest) || Object.keys(chosenSubusers).length === 0) ? {backgroundColor: '#aaa'} : {}]}
                            onPress={onPress}
                            />
                        }
                        
                        </View>
                    }
                    />
                </View>
            </Modal>
        );
    };

    const onShowDetail = (detail=null, isRespond=false) => {
        setRequestDetail(detail);
        setShowRequestDetailModal(true);
        setIsRespondDetail(isRespond);
    };

    const requestReceivedFlatList = () => {
        const renderData = ({item}) => {
            return (
                <TouchableOpacity 
                onPress={()=>{onShowDetail(item, true)}} 
                style={styles.requestContainer}
                >
                    <Text>From {item.request_received_from}</Text>
                    <Text>Comment: {item.text.substring(0, 50)}</Text>
                </TouchableOpacity>
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
                <TouchableOpacity 
                onPress={()=>{onShowDetail(item, false)}}
                style={styles.requestContainer}
                >
                    <Text>To {item.request_sent_to}</Text>
                    <Text>Comment: {item.text.substring(0, 50)}</Text>
                </TouchableOpacity>
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
        { title: 'Received', component: requestReceivedFlatList(), onPress: getRequestFrom },
        { title: 'Sent', component: requestSentFlatList(), onPress: getRequestTo },
    ]

    if (user.username != '') {
        return (
            < >  
                { makeRequestButton() }
                { makeRequestModal() }
                { detailModal() }
                <TabSwitch titleComponentArray={tabComponents}/>
                
            </>
        );
    }

    return (
        <View style={{alignSelf: 'center', flex: 1, justifyContent: 'center'}}>
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
        right: 30,
        zIndex:10,
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
        textAlignVertical: 'center',
        
    },
    requestContainer: {
        width: '95%',
        minHeight: 50,
        backgroundColor: '#fff',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#aaa',
        elevation: 3,
        marginVertical: 10,
        alignSelf: 'center',
        padding: 10
    },
    modal: {
        padding: 10,
    },
    closeButton: {
        backgroundColor: '#fff',
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#000',
        alignSelf: 'center',
        width: '50%'
    },
    closeButtonText: {
        color: '#000'
    },
    requestInfo: {
        borderRadius: 5,
        borderWidth: 1,
        borderBottomColor: '#000',
        padding: 10,
        marginVertical: 10
    },
    checkbox: {
        borderRadius: 100,
        borderWidth: 1,
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    subuserContainer: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#000',
        padding: 10,
        marginVertical: 10,
        flexDirection: 'row',
    },
});

export default Request;