// import { 
//     SET_USER, 
//     SET_USER_ID, 
//     SET_USER_USERNAME, 
//     SET_USER_EMAIL,
//     SET_SUBUSERS,
//     SET_CURRENT_SUBUSER,
//     SET_LOGOUT, 
//     ADD_RECORD_SELECTION, 
//     DELETE_RECORD_SELECTION,
//     CLEAR_RECORD_SELECTION, 
//     SET_MEAL_RECORD,
//     CLEAR_MEAL_RECORD,
//     SET_MEAL_RECORD_TITLE,
//     SET_IS_MEAL_UPDATE
// } from './actions'

// //https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers

// const initialState = {
//     user: {
//         id: null,
//         username: '',
//         email: ''
//     },

//     currentSubuser: {
//         id: '',
//         name: '',
//         age: '',
//         gender: ''
//     },

//     subuserArray: [],

//     mealRecord: {
//         id: '',
//         title: '',
//         time: ''
//     },

//     recordList: [],

//     isMealUpdate: false,
// };

// function userReducer(state = initialState, action) {
    
//     switch (action.type) {
        
//         case SET_USER:

//             Object.assign(state.user, {
//                 id: action.payload.id,
//                 username : action.payload.username,
//                 email: action.payload.email
//             });

//             return { ...state, };

//         case SET_USER_ID:

//             Object.assign(state.user, {
//                 ...state.user,
//                 id: action.payload
//             });

//             return { ...state, };

//         case SET_USER_USERNAME:
//             user = {
//                 ...state.user,
//                 username : action.payload
//             } 

//             Object.assign(state.user, {
//                 ...state.user,
//                 username : action.payload
//             });
            
//             return { ...state };
//         case SET_USER_EMAIL:

//             Object.assign(state.user, {
//                 ...state.user,
//                 email: action.payload
//             });

//             return { ...state, };

//         case SET_CURRENT_SUBUSER:

//             Object.assign(state.currentSubuser, {
//                 id: action.payload.id,
//                 name: action.payload.name,
//                 age: action.payload.age,
//                 gender: action.payload.gender
//             }); 

//             return { ...state, };

//         case SET_SUBUSERS:

//             Object.assign(state.subuserArray, [...action.payload]);         
    
//             return { ...state, };

//         case SET_LOGOUT:

//             Object.assign(state, {
//                 user: {
//                     id: null,
//                     username: '',
//                     email: ''
//                 },
        
//                 currentSubuser: {
//                     name: '',
//                     age: '',
//                     gender: ''
//                 },
        
//             subuserArray: []
//         });

//         return { ...state }

//         case SET_MEAL_RECORD:
//             // action.payload.meal_content.forEach(element => {
//             //     element.foodData = element.food_data;
//             //     delete element['food_data'];
//             // });

//             console.log(action.payload.meal_content)

//             Object.assign(state, {
//                 ...state,

//                 mealRecord: {
//                     id: action.payload.id,
//                     title: action.payload.title,
//                     time: action.payload.time
//                 },

//                 recordList: [...action.payload.meal_content]
//         });

//         return { ...state }


//         case CLEAR_MEAL_RECORD:
//             Object.assign(state.mealRecord, {
//                     mealRecord: {
//                         id: '',
//                         title: '',
//                         time: ''
//                     },
//                 },
//             );
//             console.log(state)

//             return { ...state }

//         case SET_MEAL_RECORD_TITLE:

//             Object.assign(state.mealRecord, {
//                     ...state.mealRecord,
//                     title: action.payload,
//                 },
//             );

//         return { ...state }

//         case ADD_RECORD_SELECTION:

//             for (var index in state.recordList) {
//                 if (state.recordList[index].food_data.id == action.payload.food_data.id) {
//                     state.recordList[index].amount_in_grams += action.payload.amount_in_grams;
//                     for (var prop in state.recordList[index].food_data.value) {
//                         state.recordList[index].food_data.value[prop] += action.payload.food_data.value[prop];
//                     }
                
//                 Object.assign(state.recordList, [...state.recordList]);
//                 return { ...state }
//                 }
//             }
//             Object.assign(state.recordList, [...state.recordList, action.payload]);
//             return { ...state }

//         case DELETE_RECORD_SELECTION:
//             for (var index in state.recordList) {
//                 if (state.recordList[index].food_data.id == action.payload) {
//                     state.recordList.splice(index, 1)
//                     Object.assign(state.recordList, [...state.recordList]);
//                     return { ...state }
//                 }
//             }
//             return { ...state }

//         case CLEAR_RECORD_SELECTION:
           
//             Object.assign(state, {
//                 ...state,
//                 mealRecord: {
//                     id: '',
//                     title: '',
//                     time: ''
//                 },
//                 recordList: []
//         });

//         return { ...state }

//         case SET_IS_MEAL_UPDATE:
//             console.log('reducer, set is meal update', action.payload);
//             Object.assign(state, {
//                 ...state,
//                 isMealUpdate: action.payload
//             });
//             console.log('reducer, set is meal update', state.isMealUpdate);
            
//         return { ...state }

//         default:
//             return state;
//     }
// };

// export default userReducer;