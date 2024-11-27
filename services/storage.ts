import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Mensajes del chat
  async getChatMessages(planId: string) {
    try {
      const messages = await AsyncStorage.getItem(`chat_messages_${planId}`);
      return messages ? JSON.parse(messages) : [];
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      return [];
    }
  }

  async saveChatMessages(planId: string, messages: any[]) {
    try {
      await AsyncStorage.setItem(`chat_messages_${planId}`, JSON.stringify(messages));
    } catch (error) {
      console.error('Error al guardar mensajes:', error);
    }
  }

  // Planes guardados
  async getSavedPlans() {
    try {
      const plans = await AsyncStorage.getItem('saved_plans');
      return plans ? JSON.parse(plans) : [];
    } catch (error) {
      console.error('Error al obtener planes guardados:', error);
      return [];
    }
  }

  async savePlan(plan: any) {
    try {
      const plans = await this.getSavedPlans();
      const updatedPlans = [...plans, plan];
      await AsyncStorage.setItem('saved_plans', JSON.stringify(updatedPlans));
    } catch (error) {
      console.error('Error al guardar plan:', error);
    }
  }

  async removePlan(planId: string) {
    try {
      const plans = await this.getSavedPlans();
      const updatedPlans = plans.filter((p: any) => p.id !== planId);
      await AsyncStorage.setItem('saved_plans', JSON.stringify(updatedPlans));
    } catch (error) {
      console.error('Error al eliminar plan:', error);
    }
  }

  // Datos del usuario
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  }

  async saveUserData(userData: any) {
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Error al guardar datos del usuario:', error);
    }
  }

  // Configuración de la app
  async getAppSettings() {
    try {
      const settings = await AsyncStorage.getItem('app_settings');
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      return {};
    }
  }

  async saveAppSettings(settings: any) {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error al guardar configuración:', error);
    }
  }

  // Cache de datos
  async getCachedData(key: string) {
    try {
      const data = await AsyncStorage.getItem(`cache_${key}`);
      if (!data) return null;

      const { value, expiry } = JSON.parse(data);
      if (expiry && new Date().getTime() > expiry) {
        await this.removeCachedData(key);
        return null;
      }
      return value;
    } catch (error) {
      console.error('Error al obtener datos en caché:', error);
      return null;
    }
  }

  async setCachedData(key: string, value: any, ttlMinutes: number = 60) {
    try {
      const data = {
        value,
        expiry: new Date().getTime() + ttlMinutes * 60 * 1000,
      };
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error al guardar datos en caché:', error);
    }
  }

  async removeCachedData(key: string) {
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Error al eliminar datos en caché:', error);
    }
  }

  // Limpieza de datos
  async clearAll() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error al limpiar almacenamiento:', error);
    }
  }

  // Auth related
  async clearAuthData() {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'user_data']);
    } catch (error) {
      console.error('Error al limpiar datos de autenticación:', error);
    }
  }
}

export default StorageService.getInstance();
