import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../app/store';
import { setCredentials, logout as logoutAction, setUser, setAuthLoading } from '../store/authSlice';
import { useLogoutApiMutation, useGetCurrentUserQuery } from '../services/authApi';
import { useEffect } from 'react';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const [logoutMutation] = useLogoutApiMutation();

  const { data: userData, isError, isLoading: isFetchingUser } = useGetCurrentUserQuery(undefined, {
    skip: !auth.accessToken
  });

  useEffect(() => {
    if (auth.accessToken && userData?.data?.user) {
      dispatch(setUser(userData.data.user));
    } else if (isError) {
      dispatch(logoutAction());
    } else if (!auth.accessToken) {
      dispatch(setAuthLoading(false));
    }
  }, [userData, isError, auth.accessToken, dispatch]);

  const handleLogout = async () => {
    if (auth.refreshToken) {
      try {
        await logoutMutation({ refreshToken: auth.refreshToken }).unwrap();
      } catch (err) {
        // Ignore logout network errors and clear state
      }
    }
    dispatch(logoutAction());
  };

  return {
    user: auth.user,
    accessToken: auth.accessToken,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading || isFetchingUser,
    activeOrganizationId: auth.activeOrganizationId,
    setCredentials: (user: any, tokens: any) => dispatch(setCredentials({ user, tokens })),
    logout: handleLogout
  };
};
