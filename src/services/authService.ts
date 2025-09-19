import { apiService } from './api';
import { User } from '../types';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(uuid: string): boolean {
  return UUID_REGEX.test(uuid);
}

class AuthService {
  async sendOtp(mobile: string): Promise<void> {
    // Using dummy OTP for development - remove this in production
    return Promise.resolve();
  }

  async verifyOtp(mobile: string, otp: string): Promise<User> {
    // Using dummy OTP validation - remove this in production
    if (otp === '9999') {
      const dummyUser: User = {
        id: crypto.randomUUID(),
        mobile: mobile,
        name: 'Test User',
        email: `user${mobile}@example.com`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Store dummy token
      localStorage.setItem('authToken', 'dummy-auth-token');
      localStorage.setItem('currentUser', JSON.stringify(dummyUser));
      return dummyUser;
    } else {
      throw new Error('Invalid OTP. Please use 9999 for testing.');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // For development, get user from localStorage
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user && user.id && isValidUUID(user.id)) {
          return user;
        }
      }
      
      // Fallback to API call in production
      const user = await apiService.get<User>('/auth/me');
      if (user && user.id && isValidUUID(user.id)) {
        return user;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();