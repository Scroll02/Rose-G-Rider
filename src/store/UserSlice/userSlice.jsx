import { createSlice } from "@reduxjs/toolkit";
import { usePersistedAuthState } from "../usePersistedAuthState";

const initialState = {
  user: null,
  isLoggedIn: false,
  signInClicked: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    userLogInState: (state, action) => {
      state.user = action.payload;
      state.isLoggedIn = true;
    },
    userLogOutState: (state) => {
      state.user = null;
      state.isLoggedIn = false;
    },
    setSignInClicked: (state, action) => {
      state.signInClicked = action.payload;
    },
  },
});

export const { userLogInState, userLogOutState, setSignInClicked } =
  userSlice.actions;

export const selectUser = (state) => state.user.user;

export const useAuthState = () => usePersistedAuthState();

export default userSlice.reducer;
