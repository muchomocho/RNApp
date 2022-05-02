// import { createStore, combineReducers, applyMiddleware } from 'redux';
// import thunk from 'redux-thunk';
// import userReducer from './reducers';

// https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers
//https://redux-toolkit.js.org/tutorials/quick-start

import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice';
import mealRecordReducer from './mealRecordSlice';
import foodDataReducer from './foodDataSlice';

export const store = configureStore({
  reducer: {
      user: userReducer,
      mealRecord: mealRecordReducer,
      fooddata: foodDataReducer
  },
})

// const rootReducer = combineReducers({ userReducer });

// export const Store = createStore(rootReducer, applyMiddleware(thunk));