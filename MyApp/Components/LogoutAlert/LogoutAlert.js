import React from 'react';
import { Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setLogoutAlertOff } from '../../redux/userSlice'

function LogoutAlert({navigation}) {

    const { logoutAlert } = useSelector(state => state.user);
    const dispatch = useDispatch();
    
    if (logoutAlert) {
        dispatch(setLogoutAlertOff());
        Alert.alert(
            "Warning",
            `Your session has expired. You are now logged out.`,
            [
                { 
                    text: "OK", onPress: () => { 
                        if (navigation !== undefined && navigation !== null) {
                            navigation.navigate('Profile')
                        }
                    }
                }
            ]
        );
    }
    return <></>;
}

export default LogoutAlert;