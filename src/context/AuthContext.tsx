import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (mobile: string) => Promise<void>;
  verifyOtp: (mobile: string, otp: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check for stored auth token on app start
    const checkAuthStatus = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        }
      } catch (error) {
        // User not authenticated
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (mobile: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      await authService.sendOtp(mobile);
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: (error as Error).message });
    }
  };

  const verifyOtp = async (mobile: string, otp: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const user = await authService.verifyOtp(mobile, otp);
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: (error as Error).message });
    }
  };

  const logout = () => {
    authService.logout();
    // Clear all user-related data
    localStorage.clear();
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        verifyOtp,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};