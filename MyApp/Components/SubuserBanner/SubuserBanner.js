import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text, TextInput, View, StyleSheet, Pressable } from 'react-native';
import { useSelector } from 'react-redux';

export default function SubuserBanner() {

    const { user, currentSubuser } = useSelector(state => state.user);

    if (user != undefined && currentSubuser != undefined && typeof(user.username) == 'string' && typeof(currentSubuser.name) == 'string' && user.username.length > 0 && currentSubuser.name.length > 0) {
        
        return (
            <View style={styles.container}>
                <Text style={styles.user}>user : { user.username }</Text>
                <View style={styles.subuserContainer}>
                    <View style={styles.tri}></View>
                    <Text style={styles.subuser}>{currentSubuser.name}</Text>
                </View>
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
        backgroundColor: '#fff',
    },
    user: {
        height: '100%',
        color: '#000',
        flex: 2,
        paddingLeft: 20,
        textAlignVertical: 'center',
        backgroundColor: '#c3d6ca'
    },

    // https://stackoverflow.com/questions/30216929/css-triangles-in-react-native
    tri: {
        backgroundColor: '#561ddb',
        height: 10,
        width: 10,
        // borderTopWidth: 15,
        // borderRightWidth: 0,
        // borderBottomWidth: 15,
        // borderLeftWidth: 15,
        // borderTopColor: 'transparent',
        // borderRightColor: 'transparent',
        // borderBottomColor: 'transparent',
        // borderLeftColor: "#c3d6ca",
    },
    subuserContainer: {
        height: '100%',
        flexDirection: 'row',
        flex: 6,
        //padding: 5,
        //transform: [ { skewY: '45deg' } ],
        backgroundColor: '#561ddb'
    },
    subuser: {
        textAlignVertical: 'center',
        color: '#fff',
        paddingLeft: 10
    }
  });

