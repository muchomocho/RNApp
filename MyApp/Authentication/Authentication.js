import React from 'react';
import * as Constant from '../Constant/Constant';
import * as SecureStore from 'expo-secure-store';

export const fetchToken = async (username, password) => {
    try {
        const response = await fetch(Constant.ROOT_URL + 'api/token/', {
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
            storeAccessToken(json.access);
            storeRefreshToken(json.refresh);
            storeUsername(username)
            return true;

        } else if (response.status === 400) {
            return false;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
};

export const refreshAccessToken = async () => {
    
    try {
        const refreshToken = await getStoredRefreshToken();
        const response = await fetch(Constant.ROOT_URL + 'api/token/refresh/', {
            method: "POST",
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refresh: refreshToken
            })
        });
    
        const json = await response.json();

        if (response.status == 200) {
            await storeAccessToken(json.access);
            return json.access;
        } else if (response.status === 400) {
            await logOut();
        } else {
            await logOut();
        }
    } catch (error) {
        await logOut();
    }
    return '';
};

/* 
https://reactnative.dev/docs/asyncstorage#setitem
*/
export const storeAccessToken = async (accessToken) => {
    try {
        await SecureStore.setItemAsync(
            "access", accessToken
        );
    } catch (error) {
        // Error saving data
        console.log('store access token failed: ' + error)
    }
};

export const storeRefreshToken = async (refreshToken) => {
    try {
        await SecureStore.setItemAsync(
            "refresh", refreshToken
        );
        } catch (error) {
        // Error saving data
        console.log('store refresh token failed: ' + error)
        }
};

export const storeUsername = async (username) => {
    try {
        await SecureStore.setItemAsync("username", username);
        return true;
        } catch (error) {
            return false;
        }
        
};

export const getStoredRefreshToken = async () => {
    var value = '';
    try {
        value = await SecureStore.getItemAsync('refresh');
        if (value !== '') {
            // We have data!!
            console.log('from funtion get refresh', value);
        }
    } catch (error) {
        // Error retrieving data
        console.log('get refresh token failed: ' + error)
    }
    return value
};

export const getStoredAccessToken = async () => {
    var value = '';
    try {
        value = await SecureStore.getItemAsync('access');
        if (value !== '') {
            // We have data!!
            console.log('from funtion get access', value);
        }
    } catch (error) {
        // Error retrieving data
        console.log('get access token failed: ' + error)
    }
    return value
};

export const getUsername = async () => {
    var value = '';
    try {
        value = await SecureStore.getItemAsync('username');
        if (value !== '') {
            // We have data!!
            console.log('from funtion get username', value);
        }
    } catch (error) {
        // Error retrieving data
        console.log('get access token failed: ' + error)
    }
    return value
};

export const tokenRequest = async (requestFunction, onFail) => {
    try {
        const result = await requestFunction();
        const json = await result.response.json;
        
        if (json.code === 'token_not_valid') {
            onFail();
        }

    } catch (error) {
        onFail();
    }
};

export const logOut = async (navigation) => {

    try {
        await SecureStore.deleteItemAsync('username');
        await SecureStore.deleteItemAsync('access');
        await SecureStore.deleteItemAsync('refresh');

        setTimeout(() => {
            if (navigation !== undefined && navigation !== null) {
                navigation.navigate('Profile', { logoutRedirect: true })
            }
        }, 500);
        return true;
    } catch (error) {
        return false;
    }
};
    /*
    export const tokenRequest = async (requestFunction, onFail) => {
        // first try get stored jwt access token (proof logged in / authentication)
        getStoredAccessToken()
        .then(token => {
            // if token is stored, send http request
            if (token.length > 0) {
              requestFunction(token)
              .then((success) => {
                  if (success) {
                      return
                  }
                  // when request fails
                  onFail();
              });
            } else {
                // if token is not stored, attempt to refresh with refresh token
                getStoredRefreshToken()
                .then(isRefreshed => {
                    if (isRefreshed) {
                        // if refreshed, get access token and send http request
                        Authentication.getStoredAccessToken()
                        .then(refreshedToken => {
                            requestFunction(refreshedToken);
                        });
                    } else {
                        // if all fails, run onFail()
                        onFail()
                    }
                });
            }
        });
    };*/


