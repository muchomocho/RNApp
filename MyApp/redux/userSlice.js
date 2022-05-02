import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user: {
        id: null,
        username: '',
        email: ''
    },
    currentSubuser: {
        id: '',
        name: '',
        age: '',
        gender: ''
    },

    subuserArray: [],
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {

        return { 
            ...state, 
            user: {
                ...state.user,
                id: action.payload.id,
                username : action.payload.username,
                email: action.payload.email
            }
        }
    },

    setUserID: (state, action) => {
        state.user.id = action.payload
    },

    setUsername: (state, action) => {
        state.user.username = action.payload;
    },

    setUserEmail: (state, action) => {
        state.user.email = action.payload;
    },
    setCurrentSubuser: (state, action) => {
        return {
            ...state,
            currentSubuser: {
                id: action.payload.id,
                name: action.payload.name,
                age: action.payload.age,
                gender: action.payload.gender
            }
        } 
    },
    setSubuserArray: (state, action) => {
        console.log(action.payload)
        console.log(state)
        return {
            ...state, 
            subuserArray: [
                ...action.payload
            ]
        }
    },
    setLogout: (state) => {
        return {
            ...state, 
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
        }
    },
  },
})

// Action creators are generated for each case reducer function
export const { setUser, setUsername, setUserID, setUserEmail, setCurrentSubuser, setSubuserArray, setLogout } = userSlice.actions

export default userSlice.reducer