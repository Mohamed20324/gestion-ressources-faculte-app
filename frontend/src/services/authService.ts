import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api/auth';

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  message: string;
}

const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
    if (response.data.accessToken) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  registerSupplier: async (nomSociete: string, email: string, motDePasse: string) => {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      nomSociete,
      email,
      motDePasse,
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default authService;
