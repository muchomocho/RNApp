import React, { Component } from "react";
import { StyleSheet, Text, View, Button } from 'react-native';

export class ClassTest extends Component {

    state = {
        name: "bob"
    }

    render() {
        return (
            <View>
                <Text>
                    Hello from Home!
                    {this.state.name}
                </Text>

                <Button title="click" onPress={() => this.setState({name:"Text"})}/>  
            </View>
        )
    }
}

export default ClassTest