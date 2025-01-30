import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ResearchTask } from '../../types';

interface ResearchState {
  tasks: ResearchTask[];
  loading: boolean;
  error: string | null;
}

const initialState: ResearchState = {
  tasks: [],
  loading: false,
  error: null,
};

const researchSlice = createSlice({
  name: 'research',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<ResearchTask>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<ResearchTask>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
  },
});

export const { addTask, updateTask } = researchSlice.actions;
export default researchSlice.reducer;