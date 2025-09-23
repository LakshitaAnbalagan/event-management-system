import api from './api';

const TOKEN_STORAGE_KEY = 'kongu-auth-token';

class AuthService {
  setAuthToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }

  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response;
    } catch (error) {
      // even if this fails, client will clear local state
      throw error;
    }
  }

  async verifyToken() {
    try {
      const response = await api.get('/auth/verify-token');
      return response;
    } catch (error) {
      throw error;
    }
  }

  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();


