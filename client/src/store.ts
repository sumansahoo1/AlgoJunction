import { configureStore } from '@reduxjs/toolkit'
import queslistReducer from './lib/features/questions/questions'
import totalquesReducer from './lib/features/totalques/totalques'

export const store = configureStore({
    reducer: {
        queslist: queslistReducer,
        totalques: totalquesReducer
    },
  })

  
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch