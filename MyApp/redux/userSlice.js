import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    logoutAlert: false,

    user: {
        id: null,
        username: '',
        email: ''
    },
    currentSubuser: {
        id: '',
        name: '',
        age: '',
        gender: '',
        date_of_birth: '',
        icon_number: 0,
        icon_background: 0,
        privilege_all: false,
        privilege_recordable: false,
        privilege_viewable: false
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
            logoutAlert: true,
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
                gender: action.payload.gender,
                icon_number: action.payload.icon_number,
                icon_background: action.payload.icon_background,
                date_of_birth: action.payload.date_of_birth,
                privilege_all: action.payload.privilege_all,
                privilege_recordable: action.payload.privilege_recordable,
                privilege_viewable: action.payload.privilege_viewable
            }
        } 
    },
    setSubuserArray: (state, action) => {

        subuser_ids = {};

        var subuser_all = action.payload.privilege_all.map(element => {
            element.privilege_all = true;
            element.privilege_recordable = true;
            element.privilege_viewable = true;
            return element;
        });

        for (var element of subuser_all){
            subuser_ids[element.id] = true;
        }

        var recordable_subuser = action.payload.privilege_record.filter(element => 
            !(Object.prototype.hasOwnProperty.call(subuser_ids, element.id))
        );

        recordable_subuser = recordable_subuser.map(element => {
            element.privilege_all = false;
            element.privilege_recordable = true;
            element.privilege_viewable = true;
            return element;
        });

        for (var element of recordable_subuser){
            subuser_ids[element.id] = true;
        }

        var viewable_subuser = action.payload.privilege_view.filter(element => 
            !(Object.prototype.hasOwnProperty.call(subuser_ids, element.id))
        );
        
        viewable_subuser = viewable_subuser.map(element => {
            element.privilege_all = false;
            element.privilege_recordable = false;
            element.privilege_viewable = true;
            return element;
        });
        
        return {
            ...state, 
            subuserArray: [
                ...viewable_subuser,
                ...recordable_subuser,
                ...subuser_all
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
                id: '',
                name: '',
                age: '',
                gender: '',
                date_of_birth: '',
                icon_number: 0,
                icon_background: 0,
                privilege_all: false,
                privilege_recordable: false,
                privilege_viewable: false
            },

            subuserArray: []
        }
    },
    setLogoutAlertOff: (state) => {
        state.logoutAlert = false;
    }
  },
})

// Action creators are generated for each case reducer function
export const { setUser, setUsername, setUserID, setUserEmail, setCurrentSubuser, setSubuserArray, setLogout, setLogoutAlertOff } = userSlice.actions

export default userSlice.reducer