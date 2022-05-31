import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text, TextInput, View, StyleSheet, Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import ProfileIcon from '../ProfileIcon';
import { MAIN_COLOUR } from '../../Constant/Constant';

export default function SubuserBanner() {

    const { user, currentSubuser } = useSelector(state => state.user);

    if (user != undefined && currentSubuser != undefined && typeof(user.username) == 'string' && typeof(currentSubuser.name) == 'string' && user.username.length > 0 && currentSubuser.name.length > 0) {
        
        return (
            <View style={styles.container}>
                <View style={{width: '10%'}}>
                    <ProfileIcon iconNumber={currentSubuser.icon_number} iconBackground={currentSubuser.icon_background} />
                </View>  
                <Text style={styles.user}>{ user.username } > {currentSubuser.name}</Text>
            </View>
        );
    }

    return <></>;
}

const styles = StyleSheet.create({

    container: {
        flexDirection: 'row',
        height: 30,
        alignItems: 'center',
        backgroundColor: '#c3d6ca',
        paddingHorizontal: 10
    },
    user: {
        height: '100%',
        color: '#000',
        flex: 1,
        paddingLeft: 20,
        fontWeight: 'bold',
        textAlignVertical: 'center',
        backgroundColor: '#c3d6ca'
    },
    subuserContainer: {
        height: '100%',
        flexDirection: 'row',
        flex: 6,
        //padding: 5,
        //transform: [ { skewY: '45deg' } ],
        backgroundColor: '#561ddb'
    },
  });

