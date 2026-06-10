import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Question, TestCaseResult } from '@/lib/utils';

export interface queslistState {
  value: Question[];
}

const initialState: queslistState = {
  value: [],
};


export const questionsSlice = createSlice({
  name: 'queslist',
  initialState,
  reducers: {
    addQues: (state, action: PayloadAction<Question>) => {
      return {
        ...state,
        value: [...state.value, action.payload],
      };
    },
    addSubmission: (state, action: PayloadAction<{id: number, code: string, cases: TestCaseResult[] }>) => {
      return {
        ...state,
        value: state.value.map((question) => {
          if (question.id === action.payload.id) {
            return {
              ...question,
              submission: {
                submitted: true,
                code: action.payload.code,
                cases: action.payload.cases,
              },
            };
          }
          return question;
        }),
      };
    }
  },
})

export const { addQues, addSubmission } = questionsSlice.actions
export default questionsSlice.reducer