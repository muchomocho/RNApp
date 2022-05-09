import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    
    id: -1,
    title: '',
    image: {
        uri: '',
        name: '',
        type: ''
    },
    steps: [],
    tags: [],
    ingredients: []
    
}

export const recipeSlice = createSlice({
  name: 'recipe',
  initialState,
  reducers: {
    setRecipeID: (state, action) => {
        state.id = action.payload;
    },
    setTitle: (state, action) => {
        state.title = action.payload;
    },
    setReicpeImage: (state, action) => {

        return {
            ...state, 
                image: {
                    ...state.image,
                    ...action.payload
                } 
        }
    },

    setSteps: (state, action) => {
        var newSteps = action.payload.map(element => {
            return { 
                text: element.text
             }
        });

        return {
            ...state,
            steps: [
                ...newSteps
            ]
        }
    },
    setTags: (state, action) => {

        return {
            ...state,
            steps: [
                ...action.payload
            ]
        }
    },
    addStep: (state) => {

        if (!state.steps.some((element) => element.text.replace(/s+/) === '')) {
            state.steps.push(
                {   
                    step_number : state.steps.length + 1,
                    text: ''
                }
            );
        }
    },
    updateStep: (state, action) => {
        console.log(action.payload)
        const index = state.steps.findIndex((element) => element.step_number === action.payload.old_step_number)
        
        if (index >= 0) {
            state.steps[index].step_number = action.payload.step_number;
            state.steps[index].text = action.payload.text;
        }
    },
    deleteStep: (state, action) => {
        const index = state.steps.findIndex((element) => element.step_number === action.payload);
        var afterIndex = state.steps.slice(index+1);
        afterIndex.map(element => {
            return { 
                ...element,
                step_number: element.step_number -= 1
            }
        });

        if (index >= 0) {
            state.steps = [
                ...state.steps.slice(0, index),
                ...afterIndex
            ]
        }
    },
    addTag: (state, action) => {
        // check there are no empty steps
        if (!state.tags.some((element) => element.text.replace(/s+/) === action.payload)) {
            state.tags.push(
                {   
                    text: action.payload
                }
            );
        }
    },
    deleteTag: (state, action) => {
  
        const index = state.tags.findIndex((element) => element.text === action.payload);

        if (index >= 0) {
            return {
                ...state,
                tags: [
                    ...state.tags.slice(0, index),
                    ...state.tags.slice(index+1)
                ]
            }
        }
    },
    addIngredient: (state, action) => {
        var exists = false
        state.recordList.forEach((element, index) => {
            if (state.ingredients[index].food_data.id == action.payload.food_data.id) {
                const newValue = parseFloat(state.ingredients[index].amount) + parseFloat(action.payload.amount_in_grams);
                state.recordList[index].amount_in_grams = String(newValue);
                exists = true;
            }
        });

        if (!exists) {
            return { 
                ...state, 
                ingredients: [
                    ...state.recordList, 
                    action.payload
                ]
            }
        }
    },
    deleteIngredient: (state, action) => {
        for (var index in state.recordList) {
            if (state.recordList[index].food_data.id == action.payload) {
                state.recordList.splice(index, 1)
                return;
            }
        }
    },

    clearAllRecipe: (state) => {
        return {
            id: -1,
            title: '',
            image: {
                uri: '',
                name: '',
                type: ''
            },
            steps: [],
            tags: [],
            ingredients: []
        }
    },
}
});

// Action creators are generated for each case reducer function
export const { setRecipeID, setRecipeImage, setSteps, setTags, setTitle, addTag, addStep, addIngredient, updateStep, deleteTag, deleteStep, deleteIngredient } = recipeSlice.actions

export default recipeSlice.reducer