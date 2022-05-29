import React from 'react';
import { View, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setLogoutAlertOff } from '../../redux/userSlice'

function ProfileIcon({iconNumber, iconBackground}) {
    const white = '#fff';
    const green = '#27ad15';
    const red = '#d93909';
    const orange = '#f5b42a';
    const blue = '#093dd9';
    const purple = '#a131bd'
    const lightBlue = '#31bdb6'
    const yellow = '#e3d83b';
    const black = '#000';

    var background = iconBackground > 8 || iconBackground < 0 ? 0 : iconBackground
    const backgroundColor = {
        0: white,
        1: green,
        2: red,
        3: orange,
        4: blue,
        5: purple,
        6: lightBlue,
        7: yellow,
        8: black
    }[background]
    var number = iconNumber > 7 || iconNumber < 0 ? 0 : iconNumber
    const foreground = {
        0: require('../../assets/icons/profIcons/proficon0.png'),
        1: require('../../assets/icons/profIcons/proficon1.png'),
        2: require('../../assets/icons/profIcons/proficon2.png'),
        3: require('../../assets/icons/profIcons/proficon3.png'),
        4: require('../../assets/icons/profIcons/proficon4.png'),
        5: require('../../assets/icons/profIcons/proficon5.png'),
        6: require('../../assets/icons/profIcons/proficon6.png'),
        7: require('../../assets/icons/profIcons/proficon7.png')
    }[number]

    return (
        <View style={{backgroundColor: backgroundColor, borderRadius: 10}}>
            <Image source={foreground} style={{ width: '100%',
                height: undefined,
                aspectRatio: 1,}} 
            />
        </View>
    );
}

export default ProfileIcon;