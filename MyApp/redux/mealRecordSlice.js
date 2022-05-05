import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    mealRecord: {
        id: '',
        title: '',
        time: ''
    },

    recordList: [],
    recipeRecordList: [],

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

            recordList: [...action.payload.meal_content],
            recipeRecordList: [...action.payload.recipe_content]
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
        for (var index in state.recordList) {
            if (state.recordList[index].food_data.id == action.payload) {
                state.recordList.splice(index, 1)
                return;
            }
        }
    },

    addRecipeRecordSelection: (state, action) => {

        return { 
            ...state, 
            recipeRecordList: [
                ...state.recipeRecordList, 
                action.payload
            ]
        }
    },

    deleteRecipeRecordSelection: (state, action) => {
        for (var index in state.recipeRecordList) {
            if (state.recipeRecordList[index].recipe.id == action.payload) {
                state.recipeRecordList.splice(index, 1)
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
            recordList: [],
            recipeRecordList: []
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