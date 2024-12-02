import { router } from 'expo-router';
import { API_CONFIG } from '../config';
import { ProfileData } from '../types';
import StorageService from './storage';

interface ProfileData {
  bio: string;
  interests: string[];
  photos: string[];
  availability: {
    weekdays: boolean;
    weekends: boolean;
    mornings: boolean;
    afternoons: boolean;
    evenings: boolean;
  };
}

class ProfileService {
  private static instance: ProfileService;
  private baseUrl: string;
  private timeout: number;

  private constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  public static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  private async getAuthHeaders(): Promise<Headers> {
    const token = await StorageService.getAuthToken();
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        ...options,
        headers: options.headers ? 
          new Headers({
            ...Object.fromEntries(headers.entries()),
            ...Object.fromEntries(new Headers(options.headers).entries())
          }) : 
          headers,
        signal: controller.signal
      });
      
      clearTimeout(id);
      
      if (response.status === 401) {
        // Token expirado o inválido
        await StorageService.clearAuthToken();
        router.replace('/auth/welcome');
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  async getProfile(): Promise<ProfileData> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USER.PROFILE}`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener el perfil');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  }

  async updateProfile(profileData: ProfileData): Promise<void> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USER.PROFILE}`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async uploadPhotos(photos: FormData): Promise<string[]> {
    try {
      const headers = await this.getAuthHeaders();
      headers.delete('Content-Type'); // Importante: dejar que fetch establezca el boundary correcto
      
      console.log('URL completa:', `${this.baseUrl}/user/photos`);
      
      const response = await fetch(`${this.baseUrl}/user/photos`, {
        method: 'POST',
        headers,
        body: photos,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir las fotos');
      }

      const data = await response.json();
      return data.photoUrls || [];
    } catch (error) {
      console.error('Error detallado en uploadPhotos:', error);
      throw error;
    }
}
  async deletePhoto(photoId: string): Promise<void> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}${API_CONFIG.ENDPOINTS.USER.DELETE_PHOTO}/${photoId}`, {
        method: 'DELETE',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la foto');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }

  async uploadProfileImage(imageUri: string): Promise<string> {
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : 'image';

      formData.append('photo', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const headers = await this.getAuthHeaders();
      headers.delete('Content-Type'); // Permitir que el navegador establezca el Content-Type correcto para FormData

      const response = await this.fetchWithTimeout(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.USER.UPLOAD_IMAGE}`,
        {
          method: 'POST',
          headers,
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await response.json();
      return data.photoUrl;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw error;
    }
  }

  async deleteProfileImage(photoUrl: string): Promise<void> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.USER.DELETE_IMAGE}`,
        {
          method: 'DELETE',
          headers: await this.getAuthHeaders(),
          body: JSON.stringify({ photoUrl }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al eliminar la imagen');
      }
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      throw error;
    }
  }
}

export default ProfileService.getInstance();
