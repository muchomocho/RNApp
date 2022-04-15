export const SET_USER = 'SET_USER';
export const SET_CURRENT_SUBUSER = 'SET_CURRENT_SUBUSER';
export const SET_SUBUSERS = 'SET_SUBUSERS';
export const SET_USER_ID = 'SET_USER_ID'; 
export const SET_USER_USERNAME = 'SET_USER_USERNAME'; 
export const SET_USER_EMAIL = 'SER_USER_EMAIL';
export const SET_LOGOUT = 'SET_LOGOUT';

// https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers

export const setUser = user => dispatch => {
    dispatch({
        type: SET_USER,
        payload: user,
    });
};

export const setUsername = username => dispatch => {
    dispatch({
        type: SET_USER_USERNAME,
        payload: username,
    });
};

export const setUserID = user_id => dispatch => {
    dispatch({
        type: SET_USER_ID,
        payload: user_id,
    });
};

export const setUserEmail = user_email => dispatch => {
    dispatch({
        type: SET_USER_EMAIL,
        payload: user_email,
    });
};

export const setCurrentSubuser = subuser => dispatch => {
    dispatch({
        type: SET_CURRENT_SUBUSER,
        payload: subuser,
    });
};

export const setSubuserArray = subuserArray => dispatch => {
    dispatch({
        type: SET_SUBUSERS,
        payload: subuserArray,
    });
};

export const setLogout = () => dispatch => {
    dispatch({
        type: SET_LOGOUT,
        payload: null,
    });
};