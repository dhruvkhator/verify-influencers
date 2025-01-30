import { configureStore } from '@reduxjs/toolkit';
import influencersReducer from './slices/influencersSlice';
import researchReducer from './slices/researchSlice';

export const store = configureStore({
  reducer: {
    influencers: influencersReducer,
    research: researchReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;