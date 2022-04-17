import { 
    SET_USER, 
    SET_USER_ID, 
    SET_USER_USERNAME, 
    SET_USER_EMAIL,
    SET_SUBUSERS,
    SET_CURRENT_SUBUSER,
    SET_LOGOUT, 
    ADD_RECORD_SELECTION, 
    DELETE_RECORD_SELECTION,
    CLEAR_RECORD_SELECTION 
} from './actions'

//https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers

const initialState = {
    user: {
        id: null,
        username: '',
        email: ''
    },

    currentSubuser: {
        name: '',
        age: '',
        gender: ''
    },

    subuserArray: [],

    recordList: [],
};

function userReducer(state = initialState, action) {
    
    switch (action.type) {
        
        case SET_USER:

            Object.assign(state.user, {
                id: action.payload.id,
                username : action.payload.username,
                email: action.payload.email
            });

            return { ...state, };

        case SET_USER_ID:

            Object.assign(state.user, {
                ...state.user,
                id: action.payload
            });

            return { ...state, };

        case SET_USER_USERNAME:
            user = {
                ...state.user,
                username : action.payload
            } 

            Object.assign(state.user, {
                ...state.user,
                username : action.payload
            });
            
            return { ...state };
        case SET_USER_EMAIL:

            Object.assign(state.user, {
                ...state.user,
                email: action.payload
            });

            return { ...state, };

        case SET_CURRENT_SUBUSER:

            Object.assign(state.currentSubuser, {
                name: action.payload.name,
                age: action.payload.age,
                gender: action.payload.gender
            }); 

            return { ...state, };

        case SET_SUBUSERS:

            Object.assign(state.subuserArray, [...action.payload]);         
    
            return { ...state, };

        case SET_LOGOUT:

            Object.assign(state, {
                user: {
                    id: null,
                    username: '',
                    email: ''
                },
        
                currentSubuser: {
                    name: '',
                    age: '',
                    gender: ''
                },
        
            subuserArray: []
        });

        return { ...state }

        case ADD_RECORD_SELECTION:

            for (var index in state.recordList) {
                if (state.recordList[index].foodData.id == action.payload.foodData.id) {
                    state.recordList[index].amount_in_grams += action.payload.amount_in_grams;
                    for (var prop in state.recordList[index].foodData.value) {
                        state.recordList[index].foodData.value[prop] += action.payload.foodData.value[prop];
                    }
                
                Object.assign(state.recordList, [...state.recordList]);
                return { ...state }
                }
            }
            Object.assign(state.recordList, [...state.recordList, action.payload]);
            return { ...state }

        case DELETE_RECORD_SELECTION:
            for (var index in state.recordList) {
                if (state.recordList[index].foodData.id == action.payload) {
                    state.recordList.splice(index, 1)
                    Object.assign(state.recordList, [...state.recordList]);
                    return { ...state }
                }
            }
            return { ...state }

        case CLEAR_RECORD_SELECTION:

            Object.assign(state, {
                ...state,
                recordList: []
        });

        return { ...state }

        default:
            return state;
    }
};

export default userReducer;