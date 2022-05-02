import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    mealRecord: {
        id: '',
        title: '',
        time: ''
    },

    recordList: [],

    isMealUpdate: false,
}

export const mealRecordSlice = createSlice({
  name: 'mealrecord',
  initialState,
  reducers: {
    setMealRecord: (state, action) => { 
        return {
            ...state,

            mealRecord: {
                id: action.payload.id,
                title: action.payload.title,
                time: action.payload.time
            },

            recordList: [...action.payload.meal_content]
        }
    },

    addRecordSelection: (state, action) => {

        return { 
            ...state, 
            recordList: [
                ...state.recordList, 
                action.payload
            ]
        }
    },

    deleteRecordSelection: (state, action) => {
        console.log('state', state, 'pl', action.payload)
        for (var index in state.recordList) {
            console.log('index', index)
            console.log('record at index', state.recordList[index])
            console.log('food datat in record at index', state.recordList[index].food_data)
            if (state.recordList[index].food_data.id == action.payload) {
                state.recordList.splice(index, 1)
                return;
            }
        }
    },

    clearRecord: (state) => {
        return {
            ...state,
            mealRecord: {
                id: '',
                title: '',
                time: ''
            },
            recordList: []
        }
    },

    setIsMealUpdate: (state, action) => {
        return {
            ...state,
            isMealUpdate: action.payload
        }
    },
  },
})

// Action creators are generated for each case reducer function
export const { setMealRecord, addRecordSelection, clearRecord, deleteRecordSelection, setSubuserArray, setIsMealUpdate } = mealRecordSlice.actions

export default mealRecordSlice.reducer