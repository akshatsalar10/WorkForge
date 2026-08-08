import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, AuthTokens } from '../types/auth';

const storedAccessToken = localStorage.getItem('workforge_access_token');
const storedRefreshToken = localStorage.getItem('workforge_refresh_token');
const storedActiveOrgId = localStorage.getItem('workforge_active_org_id');

const initialState: AuthState = {
  user: null,
  accessToken: storedAccessToken,
  refreshToken: storedRefreshToken,
  isAuthenticated: !!storedAccessToken,
  isLoading: true,
  activeOrganizationId: storedActiveOrgId
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; tokens: AuthTokens }>
    ) => {
      const { user, tokens } = action.payload;
      state.user = user;
      state.accessToken = tokens.accessToken;
      state.refreshToken = tokens.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;

      localStorage.setItem('workforge_access_token', tokens.accessToken);
      localStorage.setItem('workforge_refresh_token', tokens.refreshToken);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isLoading = false;
    },
    setActiveOrganization: (state, action: PayloadAction<string | null>) => {
      state.activeOrganizationId = action.payload;
      if (action.payload) {
        localStorage.setItem('workforge_active_org_id', action.payload);
      } else {
        localStorage.removeItem('workforge_active_org_id');
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.activeOrganizationId = null;

      localStorage.removeItem('workforge_access_token');
      localStorage.removeItem('workforge_refresh_token');
      localStorage.removeItem('workforge_active_org_id');
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    }
  }
});

export const { setCredentials, setUser, setActiveOrganization, logout, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
