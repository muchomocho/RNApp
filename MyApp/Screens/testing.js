import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

function Testing () {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const getMovies = async () => {
     try {
      const response = await fetch('http://192.168.0.32:8081/api/recipes/', {
          method: 'GET'
        });
      const json = await response.json();
      setData(json);
      console.log(json.user_ID)
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getMovies();
  }, []);

  return (
    <View style={{ flex: 1, padding: 24 }}>
      {isLoading ? <ActivityIndicator/> : (
        <FlatList
          data={data}
          keyExtractor={({ id }, index) => id}
          renderItem={({ item }) => (
            <Text>{item.id}, {item.user_ID}, {item.main_image_url}</Text>
          )}
        />
      )}
    </View>
  );
}

export default Testing