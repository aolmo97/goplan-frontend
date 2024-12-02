import { API_CONFIG } from '../config';
import StorageService from './storage';
import { router } from 'expo-router';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    // Otros campos del usuario que necesites
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}
interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  phone: string;
}

class AuthService {
  private static instance: AuthService;
  private baseUrl: string;
  private timeout: number;

  private constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en el inicio de sesión');
      }

      const data: LoginResponse = await response.json();
      console.log(data);
      
      // Guardar el token y los datos del usuario
      await StorageService.setAuthToken(data.token);
      await StorageService.setUserData(data.user);

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('La solicitud ha excedido el tiempo límite');
      }
      console.error('Error en login:', error);
      throw error;
    }
  }
  async register(credentials: RegisterCredentials): Promise<void> {
    console.log(credentials);
    
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error en el registro');
      } else {
        await this.login({ email: credentials.email, password: credentials.password });
        router.push('/auth/profile-setup');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('La solicitud ha excedido el tiempo límite');
      }
      console.error('Error en registro:', error);
      throw error;
    }
  }
  async socialLogin(provider: string, token: string): Promise<LoginResponse> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.SOCIAL_LOGIN}/${provider}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error en el inicio de sesión con ${provider}`);
      }

      const data: LoginResponse = await response.json();
      
      // Guardar el token y los datos del usuario
      await StorageService.setAuthToken(data.token);
      await StorageService.setUserData(data.user);

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('La solicitud ha excedido el tiempo límite');
      }
      console.error(`Error en login con ${provider}:`, error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = await StorageService.getAuthToken();
      if (token) {
        await this.fetchWithTimeout(
          `${this.baseUrl}${API_CONFIG.ENDPOINTS.AUTH.LOGOUT}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }
      // Limpiar datos de autenticación
      await StorageService.clearAuthToken();
      await StorageService.clearUserData();
    } catch (error) {
      // Si hay un error en el logout del servidor, aún así limpiamos los datos locales
      await StorageService.clearAuthToken();
      await StorageService.clearUserData();
      console.error('Error en logout:', error);
      throw error;
    }
  }
}

export default AuthService.getInstance();
