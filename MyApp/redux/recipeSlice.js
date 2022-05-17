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
    setRecipeImage: (state, action) => {

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
                step_number: element.step_number,
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
        var newTags = action.payload.map(element => {
            return { 
                text: element.text
             }
        });
        return {
            ...state,
            tags: [
                ...newTags
            ]
        }
    },
    setIngredient: (state, action) => {
        var newIngredients = action.payload.map(element => {
            return {
                food_data: {
                    id: element.food_data.id,
                },
                name: element.food_data.name,
                is_private: element.food_data.is_private,
                amount: String(element.amount),
                unit: element.unit,
            }
        })
        return {
            ...state,
            ingredients: [...newIngredients]
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

        if (!state.ingredients.some((element) => element.food_data.id === action.payload.food_data.id)) {
            
            console.log({ 
                ...state, 
                ingredients: [
                    ...state.ingredients, 
                    {
                        food_data: {
                            id: action.payload.food_data.id,
                        },
                        name: action.payload.food_data.name,
                        is_private: action.payload.food_data.is_private,
                        amount: 0,
                        unit: 'g',
                    }

                ]
            })
            return { 
                ...state, 
                ingredients: [
                    ...state.ingredients, 
                    {
                        food_data: {
                            id: action.payload.food_data.id,
                        },
                        name: action.payload.food_data.name,
                        is_private: action.payload.food_data.is_private,
                        amount: 0,
                        unit: 'g',
                    }

                ]
            }

        }
    },
    updateIngredient: (state, action) => {
        const index = state.ingredients.findIndex((element) => element.food_data.id === action.payload.food_data.id)

        if (index >= 0){
            state.ingredients[index] = action.payload;
        }

    },
    deleteIngredient: (state, action) => {
        for (var index in state.ingredients) {
            console.log('id', state.ingredients[index].food_data.id, 'id2', action.payload)
            if (state.ingredients[index].food_data.id == action.payload) {
                state.ingredients.splice(index, 1)
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
export const { setRecipeID, setRecipeImage, setSteps, setTags, setTitle, setIngredient, updateIngredient, addTag, addStep, addIngredient, updateStep, deleteTag, deleteStep, deleteIngredient, clearAllRecipe } = recipeSlice.actions

export default recipeSlice.reducer