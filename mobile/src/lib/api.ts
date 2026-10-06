import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// NOTE: Change this to your computer's local IP address if running on a real device
const API_URL = 'http://localhost:5000/api'; 

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // Error reading token
  }
  return config;
});

export default api;
