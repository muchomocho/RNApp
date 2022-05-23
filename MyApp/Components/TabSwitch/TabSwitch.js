import React, { useState, useEffect } from "react";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Text, TextInput, View, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { TouchableRipple } from "react-native-paper";


const {height, width} = Dimensions.get("window");

export default function TabSwitch({titleComponentArray=[]}) {

    const [showIndex, setShowIndex] = useState(0);
    const [showComponent, setShowComponent] = useState(null);
    const [tabDimensions, setTabDimensions] = useState({x:0, y: 0, height: 0, width: 0});
    const headerHeight = useHeaderHeight();

    var arr = titleComponentArray.map((element, index) => {return { ...element, id: index}})

    const tabs = () => {
        
        // https://stackoverflow.com/questions/30203154/get-size-of-a-view-in-react-native
        const onLayout = (event) => {
            const {x, y, width, height} = event.nativeEvent.layout;
            setTabDimensions({x, y, width, height});
        }

        return (
            <View style={styles.tabContainer} onLayout={onLayout} >
                {
                    arr.map(element => {
                        const onPress = () => {
                            setShowIndex(element.id);
                            if (Object.prototype.hasOwnProperty.call(element, 'onPress')) {
                                element.onPress();
                            }
                        }
                        return (
                            <View  key={element.id} style={[styles.title, element.id == showIndex ? styles.focused : null]}>
                                <TouchableRipple key={element.id} style={styles.tab} onPress={onPress}> 
                                    <Text > { element.title } </Text> 
                                </TouchableRipple>
                            </View>
                        );
                    })
                }
            </View>
        );
    };

    const components = () => {
    
        return (
            arr.map((element, index) => {
                const component = () => {
                    
                        return (
                            <View key={index} style={[styles.componentContainer, {height: (height - (tabDimensions.height + headerHeight + 60 + 30)), width: '100%', marginTop: tabDimensions.height, position: 'absolute'}, element.id != showIndex ? {transform: [{scale: 0}], zIndex: -1} : { zIndex: 1, flex: 1 } ]}>
                                {/* https://stackoverflow.com/questions/47378068/using-display-none-instead-of-condition-state-rendering */}
                                <View style={[element.id != showIndex ? {transform: [{scale: 0}], zIndex: -1} : { zIndex: 1, flex: 1 } ]}>
                                    {element.component}
                                </View>
                            </View>
                        );
                    
                }
                return (
                     component()
                );
            })
        );
    };

    return (
        <View style={styles.container}>
            { tabs() }
            { components() }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        //backgroundColor: '#000',
        flex:1,
    },
    tabContainer: {
        width: '100%',
        flexDirection: 'row'
    },
    tab: {
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        flex: 1,
        height: 50,
        alignItems: 'center',
        backgroundColor: '#fff'
    },
    focused: {
        backgroundColor: '#eee',
        borderBottomWidth: 3,
        borderBottomColor: '#561ddb'
    },
    componentContainer: {
        flex:1
    },
  });

