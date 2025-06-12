// store/warningSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WarningState {
  message: string | null;
}

const initialState: WarningState = {
  message: null,
};

const warningSlice = createSlice({
  name: "warning",
  initialState,
  reducers: {
    setWarning: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    clearWarning: (state) => {
      state.message = null;
    },
  },
});

export const { setWarning, clearWarning } = warningSlice.actions;
export default warningSlice.reducer;
