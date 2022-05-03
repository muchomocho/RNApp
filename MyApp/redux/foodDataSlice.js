import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    fooddata: {
        name: '',
        image: {
            uri: '',
            name: '',
            type: ''
        },
        amount_in_grams: '0',
        nutrient_data: []
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

    setImage: (state, action) => {

        return {
            ...state, 
            fooddata: {
                ...state.fooddata,
                image: {
                    ...action.payload
                }
                
            }
        }
        state.fooddata.image.uri = action.payload.uri;
        state.fooddata.image.name = action.payload.name;
        state.fooddata.image.type = action.payload.type;
    },

    addEmpty: (state) => {
        if (!state.fooddata.nutrient_data.some((element) => element.name === '-')) {
            state.fooddata.nutrient_data.push(
                {   
                    tempID: state.fooddata.nutrient_data.length,
                    name: '-',
                    value: '0',
                    unit: '-'
                }
            );
        }
    },

    addNutrition: (state, action) => {
        if (!state.fooddata.nutrient_data.some((element) => element.name === action.payload.name)) {
            state.fooddata.nutrient_data.push(action.payload);
        }
    },

    updateNutrition: (state, action) => {
        const index = state.fooddata.nutrient_data.findIndex((element) => element.name === action.payload.oldName)
        console.log(index)
        var newNutrition = state.fooddata.nutrient_data[index] // copy
        for (var key in action.payload.newNutrition) {
            if (Object.prototype.hasOwnProperty.call(action.payload.newNutrition, key)) {
                newNutrition[key] = action.payload.newNutrition[key];
            }
        }
    },

    deleteNutritionByName: (state, action) => {
        const index = state.fooddata.nutrient_data.findIndex((element) => element.name === action.payload);
        var afterIndex = state.fooddata.nutrient_data.slice(index+1);
        afterIndex.map(element => {element.tempID -= 1;})
        console.log('del', index)
        console.log([
            ...state.fooddata.nutrient_data.slice(0, index),
            ...afterIndex
        ])
        if (index >= 0) {
            return {
                ...state,
                fooddata: {
                    ...state.fooddata,
                    nutrient_data: [
                        ...state.fooddata.nutrient_data.slice(0, index),
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
                image: {
                    uri: '',
                    name: '',
                    type: ''
                },
                amount_in_grams: '0',
                nutrient_data: []
            }
        }
    },
  },
});

// Action creators are generated for each case reducer function
export const { setFoodName, setFoodAmount, setImage, addNutrition, addEmpty, updateNutrition, deleteNutritionByName, clearAllFoodData } = foodDataSlice.actions

export default foodDataSlice.reducer