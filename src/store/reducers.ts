import { combineReducers } from "redux";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface GlobalState{
    activeGroup: number
}

const initialState: GlobalState = {
    activeGroup: 0
}

interface PayloadType {
    activeGroup: number
}

export const globalSlice = createSlice({
    name: 'global',
    initialState,
    reducers:{
        updateActiveGroup: (state, action: PayloadAction<PayloadType>)=>{
            let group = action.payload.activeGroup+0;
            action.payload.activeGroup = 
            state.activeGroup = group;
        }
    }
})

export const {
    updateActiveGroup
} = globalSlice.actions

export default globalSlice.reducer;