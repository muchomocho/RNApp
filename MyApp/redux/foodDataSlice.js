import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    fooddata: {
        id: -1,
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
    setFoodID: (state, action) => {
        state.fooddata.id = action.payload;
    },
    
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
                    ...state.image,
                    ...action.payload
                }
                
            }
        }
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

    setNutrition: (state, action) => {
        var newNutrition = action.payload.map(element => {
            return { 
                tempID: String(element.id),
                name: String(element.name),
                value: String(element.value),
                unit: String(element.unit)
             }
        })

        return {
            ...state,
            fooddata: {
                ...state.fooddata,
                nutrient_data: [
                    ...newNutrition
                ]
            }
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
                id : -1,
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
export const { setFoodID, setFoodName, setFoodAmount, setImage, setNutrition, addNutrition, addEmpty, updateNutrition, deleteNutritionByName, clearAllFoodData } = foodDataSlice.actions

export default foodDataSlice.reducer