import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface queslistState {
    value: number;
}

const initialState: queslistState = {
    value: 0,
};


export const totalquesSlice = createSlice({
    name: 'totalques',
    initialState,
    reducers: {
        addTotalQues: (state, action: PayloadAction<number>) => {
            return {
                ...state,
                value: action.payload,
            };
        },
    },
})

export const { addTotalQues } = totalquesSlice.actions
export default totalquesSlice.reducer