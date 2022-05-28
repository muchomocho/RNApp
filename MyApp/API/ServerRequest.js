import React from 'react';
import * as Constant from '../Constant/Constant';
import * as Authentication from '../Authentication/Authentication'

// https://reactnative.dev/docs/network
export const httpRequest = async ({method, endpoint, headers={}, body={}, isAuthRequired=false, navigation=null}) => {
    var returnObj = {};
    var request = {
        method: method,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'app-server-key': 'fdf03d813f4190725026b4e95087daeaadc4432e37f184c3',
            ...headers
        },
    };
    if (method !== 'GET' && method !== 'HEAD') {
        if (body instanceof FormData) {
            request.body = body;
        }
        else { request.body = JSON.stringify(body);}
    }
    
    try {
        if (isAuthRequired) {
            const token = await Authentication.getStoredAccessToken();
            request.headers.Authorization = 'Bearer ' + token; 
        }
        const response = await fetch(Constant.ROOT_URL + endpoint, request);
        returnObj.response = response;
        const json = await response.json();
        returnObj.json = json;

        if (isAuthRequired && json.code === 'token_not_valid') {
            const refreshedToken = await Authentication.refreshAccessToken();

            if ((refreshedToken == null || refreshedToken == '')) {
                Authentication.logOut(navigation);
            }
            request.headers.Authorization = ('Bearer ' + refreshedToken); 

            const response = await fetch(Constant.ROOT_URL + endpoint, request);
            returnObj.response = response;
            const json = await response.json();
            returnObj.json = json;
        }
    } catch (error) {
        returnObj.error = error;
    } 
    return returnObj;
};
