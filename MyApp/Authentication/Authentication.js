import React from 'react';
import GlobalConstant from '../Global/Global';
import * as SecureStore from 'expo-secure-store';

    export const fetchToken = async (username, password) => {
        try {
            const response = await fetch(GlobalConstant.rootUrl + '/api/token/', {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });
            const json = await response.json();

            if (response.status == 200) {
              console.warn('token acquired!')
              setAccessToken(json.access);
              setRefreshToken(json.refresh);

              getStoredAccessToken().then(access => {
                  console.log('access=', access);
              });
              getStoredRefreshToken().then(access => {
                console.log('refresh=', access);
            });

            } else if (response.status === 400) {
              console.warn('user already exists');
            } else {
              console.warn(json);
            }
        } catch (error) {
            console.warn(error);
        }
    };

    export const refreshAccessToken = async () => {
        const refreshToken = getStoredRefreshToken()
        try {
            const response = await fetch(GlobalConstant.rootUrl + '/api/token/refresh/', {
                method: "POST",
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refresh: refreshToken
                })
            });

            const token = await response.json();
            console.log(json);

            if (response.status == 201) {
              console.warn('token acquired!')
              setAccessToken(token.access);
              return true;
            } else if (response.status === 400) {
              console.warn('user already exists')
            } else {
              console.warn(json)
            }
          } catch (error) {
            console.warn(error);
          }
          return false;
    };

    /* 
    https://reactnative.dev/docs/asyncstorage#setitem
    */
    export const setAccessToken = async (accessToken) => {
        try {
          await SecureStore.setItemAsync(
              "access", accessToken
          );
        } catch (error) {
          // Error saving data
          console.log('store access token failed: ' + error)
        }
    };

    export const getStoredAccessToken = async () => {
        var value = null;
        try {
            value = await SecureStore.getItemAsync('access');
            if (value !== null) {
                // We have data!!
                console.log('from funtion get access', value);
            }
        } catch (error) {
            // Error retrieving data
            console.log('get access token failed: ' + error)
        }
        return value
    };

    export const setRefreshToken = async (refreshToken) => {
        try {
            await SecureStore.setItemAsync(
                "refresh", refreshToken
            );
          } catch (error) {
            // Error saving data
            console.log('store refresh token failed: ' + error)
          }
    };

    export const getStoredRefreshToken = async () => {
        var value = null;
        try {
            value = await SecureStore.getItemAsync('refresh');
            if (value !== null) {
                // We have data!!
                console.log('from funtion get refresh', value);
            }
        } catch (error) {
            // Error retrieving data
            console.log('get refresh token failed: ' + error)
        }
        return value
    };


