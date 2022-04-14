import React from 'react';
import * as Constant from '../Constant/Constant';
import * as Authentication from '../Authentication/Authentication'

// https://reactnative.dev/docs/network
export const httpRequest = async ({method, endpoint, headers={}, body={}, isAuthRequired=false}) => {
    var returnObj = {};
    var request = {
        method: method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...headers
        },
    };
    if (method !== 'GET' && method !== 'HEAD') {
        console.log('body');
        request.body = JSON.stringify(body);
    }
    
    try {
        console.log(endpoint)
        if (isAuthRequired) {
            const token = await Authentication.getStoredAccessToken();
            request.headers.Authorization = 'Bearer ' + token; 
        }
        const response = await fetch(Constant.ROOT_URL + endpoint, request);
        returnObj.response = response;
        const json = await response.json();
        returnObj.json = json;

        if (isAuthRequired && json.code === 'token_not_valid') {
            console.log('refreshing');
            const refreshedToken = await Authentication.refreshAccessToken();
            console.log('refreshed', refreshedToken);
            request.headers.Authorization = ('Bearer ' + refreshedToken); 

            const response = await fetch(Constant.ROOT_URL + endpoint, request);
            returnObj.response = response;
            const json = await response.json();
            returnObj.json = json;
        }
        //console.log('request', request);
    } catch (error) {
        console.error(error);
        returnObj.error = error;
    } 
    return returnObj;
};
