import React, { useState, useEffect } from 'react';
import { Text, TextInput, View, StyleSheet, Pressable, FlatList, ActivityIndicator, Modal, Alert } from 'react-native';
import { httpRequest } from '../../API/ServerRequest';
import foodDataJson from '../../assets/JSON/food_integrated_dataset.json'
import foodDataUnitJson from '../../assets/JSON/food_integrated_dataset_units.json'
import CustomButton from '../CustomButton';
import SearchBar from '../SearchBar';
import { useSelector, useDispatch } from 'react-redux';
import { clearRecord, setMealRecord, setIsMealUpdate } from '../../redux/mealRecordSlice'
import { amountFormatter } from '../../API/helper';

export default function MealRecord({data, parentSet, navigation}) {

    const { user, currentSubuser, subuserArray } = useSelector(state => state.user);
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);
    const [showConfirmModal, setShowConfirm] = useState(false);
    const [showFailModal, setShowFail] = useState('');
    const [focusData, setFocusData] = useState({});
    const dispatch = useDispatch();

    const singleMealRecord = (singleData) => {

        const onDelete = async (id) => {

            try {
                const result = await httpRequest({
                    method: 'DELETE',
                    endpoint: `api/useraccounts/${user.username}/subuser/${currentSubuser.name}/usermealrecord/${id}/`,
                    isAuthRequired: true,
                    navigation: navigation
                });

                setShowDeleteWarning(false);

                if (result.response.status == 200) {
                    setShowConfirm(true);
                }
                else if (result.response.status == 404) {
                    setShowFail('server could not find entry');
                }
                else {
                    setShowFail('server failed to process');
                }
            } catch (error) {
                setShowFail('network error');
            }
        };

        const modal = ({text, visible, onYes, onCancel, onOk}) => {
            
            return (
                <Modal 
                    transparent={true}
                    visible={visible}
                    // style={{height: '100%', backgroundColor: '#000'}}
                >   
                    <View style={{height: '100%', flexDirection: 'column', justifyContent: 'center', backgroundColor: 'rgba(52, 52, 52, 0.8)', padding: '5%' }}>
                        <View style={{backgroundColor: '#fff', borderRadius: 10, height: '30%', justifyContent: 'space-between'}}>
                            { text }
                            <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
                                {
                                    onYes != undefined && 
                                    <CustomButton
                                        buttonStyle={{width: '40%'}}
                                        text={'yes'}
                                        onPress={ () => { onYes(); } }
                                    />
                                }
                                {
                                    onCancel != undefined &&
                                    <CustomButton
                                        buttonStyle={{width: '40%'}}
                                        text={'cancel'}
                                        onPress={ () => { onCancel() } }
                                    />
                                }
                                {
                                    onOk != undefined &&
                                    <CustomButton
                                        buttonStyle={{width: '40%'}}
                                        text={'ok'}
                                        onPress={ () => { onOk() } }
                                    />
                                }
                            </View>
                        </View>
                    </View>
                </Modal>
            );
        };

        const deleteWarning = () => {
            const textComp = 
                (<View>
                    <View style={{alignItems : 'center'}}>
                        <Text> are you sure you want to delete this entry? </Text>
                    </View>
                    <View style={{alignItems : 'center'}}>
                        <Text> { focusData.title } </Text>
                    </View>
                </View>);

            const cancel = () => {
                setShowDeleteWarning(false)
            };

            const yes = () => {
                 onDelete(focusData.id)
            };

            return( modal({text: textComp, visible: showDeleteWarning, onCancel: cancel, onYes: yes}) )
        };

        const deleteConfirmModal = () => {
            const textComp = 
                (<View>
                    <View style={{alignItems : 'center'}}>
                        <Text> entry was successfully deleted </Text>
                    </View>
                </View>);

            const ok = () => {
                setShowConfirm(false)
                parentSet();
            };

            return( modal({text: textComp, visible: showConfirmModal, onOk: ok,}) )
        };

        const deleteFailModal = () => {
            const textComp = 
                (<View>
                    <View style={{alignItems : 'center'}}>
                        <Text> entry delted failed </Text>
                        <Text> { showFailModal } </Text>
                    </View>
                </View>);

            const ok = () => {
                setShowFail('');
            };

            return( modal({text: textComp, visible: showFailModal.length > 0, onOk: ok,}) )
        };

        const header = () => {
            return (
                <View style={styles.mealContentHeader}>
                    { deleteWarning() }
                    { deleteConfirmModal() }
                    { deleteFailModal() }
                    { timeText(singleData.time) }
                    <CustomButton
                        buttonStyle={styles.mealContentHeaderButton}
                        textStyle={styles.mealContentHeaderButtonText}
                        text={'edit'}
                        onPress={() => {
                            dispatch(clearRecord());
                            dispatch(setMealRecord(singleData));
                            dispatch(setIsMealUpdate(true));
                            navigation.navigate('Create record');
                        }}
                    />
                    <CustomButton
                        buttonStyle={styles.mealContentHeaderButton}
                        textStyle={styles.mealContentHeaderButtonText}
                        text={'delete'}
                        onPress={() => { setFocusData(singleData); setShowDeleteWarning(true) }}
                    />
                </View>
            );
        };

        const timeText = (time) => {
  
            const formatTime = time.split('T')[1].split('Z')[0].split('.')[0]

            return(
                <View style={[styles.timeText , {flex: 4}]}>
                    <Text>{ formatTime.split(':')[0] + ':' + formatTime.split(':')[1]}</Text>
                </View>
            );
        };
      
        const renderItem = (item) => {

            return (
                <View style={styles.mealContent}>
                    <View style={styles.foodNameText}>
                        <Text>{item.food_data.name}</Text>
                    </View>
                    <View>
                        <Text>{amountFormatter(item.amount_in_grams)} g</Text>
                    </View>
                </View>
            );
        };
    
        return (
            <FlatList
                style={styles.container}
                ListHeaderComponent={()=> {
                    return (
                        <View> 
                            { header() }
                            <View>
                                <Text style={styles.mealTitleText}>
                                    { singleData.title }
                                </Text>
                            </View>
                        </View>
                    )
                }}

                data={singleData.meal_content} 
                renderItem={
                    ({item}) => {return renderItem(item)}
                }
                keyExtractor={item => `${item.id}`}
                
            />
        );
    };

    const renderItem = (item) => {
    
        return(
            singleMealRecord(item)
        );
    };

    return (
        <View style={styles.mealContentListContainer}>
            <FlatList
            nestedScrollEnabled={true}
            style={{flex:1, flexGrow: 1,}}
            data={data} 
            renderItem={
                ({item}) => {return renderItem(item)}
            }
            keyExtractor={item => `${item.id}`}

            ListFooterComponent={
                <View style={styles.footer}></View>
            }
            />
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 100,
        height: 'auto',
        width: '95%',
        backgroundColor: '#fff',
        borderRadius: 5,
        marginTop: '5%',
        alignSelf: 'center',
        // marginLeft: '2.5%',

        elevation: 3,
        shadowColor: '#eee',
        shadowRadius: 0,
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 100
        },
    },
    mealContentListContainer: {
        height: 300,
    },
    mealContentHeader: {
        flexDirection: 'row'
    },
    mealContentHeaderButton: {
        flex: 1,
        height: 'auto',
        width: 2000,
        padding: 2,
        marginRight: 5
    },
    mealContentHeaderButtonText: {
        fontSize: 10
    },
    mealContent: {
        padding: 5,
        flexDirection: 'column',
        justifyContent: 'center',
        // textAlignVertical: 'center',
        alignItems: 'center',
        marginBottom: 10,
        marginHorizontal: 10,
        borderColor: '#aaa', 
        borderWidth: 1,
        borderRadius: 10
    },
    mealTitleText: {
        alignContent: 'center',
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 5
    },
    timeText: {
        marginTop: 10,
        marginLeft: 10
    },
    foodNameText: {
        alignItems: 'center',  
        padding: 10
    },
    footer: {
        marginBottom: 10
    },

});
