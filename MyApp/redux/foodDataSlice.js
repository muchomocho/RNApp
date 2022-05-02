import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    fooddata: {
        name: '',
        image_uri: null,
        amount_in_grams: '0',
        nutritions: []
    }
}

export const foodDataSlice = createSlice({
  name: 'fooddata',
  initialState,
  reducers: {
    
    setFoodName: (state, action) => {
        state.fooddata.name = action.payload;
    },

    setFoodAmount: (state, action) => {
        state.fooddata.amount_in_grams = action.payload;
    },

    addEmpty: (state) => {
        if (!state.fooddata.nutritions.some((element) => element.name === '-')) {
            state.fooddata.nutritions.push(
                {   
                    tempID: state.fooddata.nutritions.length,
                    name: '-',
                    value: '0',
                    unit: '-'
                }
            );
        }
    },

    addNutrition: (state, action) => {
        if (!state.fooddata.nutritions.some((element) => element.name === action.payload.name)) {
            state.fooddata.nutritions.push(action.payload);
        }
    },

    updateNutrition: (state, action) => {
        const index = state.fooddata.nutritions.findIndex((element) => element.name === action.payload.oldName)
        console.log(index)
        var newNutrition = state.fooddata.nutritions[index] // copy
        for (var key in action.payload.newNutrition) {
            if (Object.prototype.hasOwnProperty.call(action.payload.newNutrition, key)) {
                newNutrition[key] = action.payload.newNutrition[key];
            }
        }
        // if (index >= 0) {
        //     return {
        //         ...state,
        //         fooddata: {
        //             ...state.fooddata,
        //             nutritions: [
        //                 ...state.fooddata.nutritions.slice(0, index),
        //                 newNutrition,
        //                 ...state.fooddata.nutritions.slice(index)
        //             ]
        //         }
        //     }
        // }
    },

    deleteNutritionByName: (state, action) => {
        const index = state.fooddata.nutritions.findIndex((element) => element.name === action.payload);
        var afterIndex = state.fooddata.nutritions.slice(index+1);
        afterIndex.map(element => {element.tempID -= 1;})
        console.log('del', index)
        console.log([
            ...state.fooddata.nutritions.slice(0, index),
            ...afterIndex
        ])
        if (index >= 0) {
            return {
                ...state,
                fooddata: {
                    ...state.fooddata,
                    nutritions: [
                        ...state.fooddata.nutritions.slice(0, index),
                        ...afterIndex
                    ]
                }
            }
        }
    },

    clearAllFoodData: (state) => {
        return {
            ...state,
            fooddata: {
                name: '',
                amount_in_grams: 0,
                nutritions: []
            }
        }
    },
  },
});

// Action creators are generated for each case reducer function
export const { setFoodName, setFoodAmount, addNutrition, addEmpty, updateNutrition, deleteNutritionByName, clearAllFoodData } = foodDataSlice.actions

export default foodDataSlice.reducer