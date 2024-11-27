import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import StorageService from '../../services/storage';
import { AppSettings } from '../../types';
import { UI_CONFIG } from '../../config';

const { COLORS, SPACING, TYPOGRAPHY } = UI_CONFIG;

const defaultSettings: AppSettings = {
  notifications: {
    enabled: true,
    chatMessages: true,
    planUpdates: true,
    reminders: true,
  },
  privacy: {
    shareLocation: true,
    publicProfile: true,
  },
  theme: 'light',
  language: 'es',
};

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await StorageService.getAppSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await StorageService.saveAppSettings(settings);
      Alert.alert('Éxito', 'Configuración guardada correctamente');
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      Alert.alert('Error', 'No se pudo guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  const updateNotificationSetting = (key: keyof AppSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const updatePrivacySetting = (key: keyof AppSettings['privacy'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Activar Notificaciones</Text>
          <Switch
            value={settings.notifications.enabled}
            onValueChange={(value) => updateNotificationSetting('enabled', value)}
            trackColor={{ false: COLORS.GRAY, true: COLORS.PRIMARY }}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Mensajes de Chat</Text>
          <Switch
            value={settings.notifications.chatMessages}
            onValueChange={(value) => updateNotificationSetting('chatMessages', value)}
            trackColor={{ false: COLORS.GRAY, true: COLORS.PRIMARY }}
            disabled={!settings.notifications.enabled}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Actualizaciones de Planes</Text>
          <Switch
            value={settings.notifications.planUpdates}
            onValueChange={(value) => updateNotificationSetting('planUpdates', value)}
            trackColor={{ false: COLORS.GRAY, true: COLORS.PRIMARY }}
            disabled={!settings.notifications.enabled}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Recordatorios</Text>
          <Switch
            value={settings.notifications.reminders}
            onValueChange={(value) => updateNotificationSetting('reminders', value)}
            trackColor={{ false: COLORS.GRAY, true: COLORS.PRIMARY }}
            disabled={!settings.notifications.enabled}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacidad</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Compartir Ubicación</Text>
          <Switch
            value={settings.privacy.shareLocation}
            onValueChange={(value) => updatePrivacySetting('shareLocation', value)}
            trackColor={{ false: COLORS.GRAY, true: COLORS.PRIMARY }}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Perfil Público</Text>
          <Switch
            value={settings.privacy.publicProfile}
            onValueChange={(value) => updatePrivacySetting('publicProfile', value)}
            trackColor={{ false: COLORS.GRAY, true: COLORS.PRIMARY }}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <FontAwesome name="check" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          try {
            await StorageService.clearAuthData();
            router.replace('/auth/welcome');
          } catch (error) {
            console.error('Error al cerrar sesión:', error);
            Alert.alert('Error', 'No se pudo cerrar sesión');
          }
        }}
      >
        <FontAwesome name="sign-out" size={20} color={COLORS.DANGER} />
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={styles.infoSection}>
        <Text style={styles.version}>Versión 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  section: {
    padding: SPACING.LARGE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.SIZES.LARGE,
    fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.MEDIUM,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.MEDIUM,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    color: COLORS.TEXT,
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.MEDIUM,
    margin: SPACING.LARGE,
    borderRadius: 10,
  },
  saveButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    marginLeft: SPACING.SMALL,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.MEDIUM,
    margin: SPACING.LARGE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.DANGER,
  },
  logoutButtonText: {
    color: COLORS.DANGER,
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    marginLeft: SPACING.SMALL,
  },
  infoSection: {
    padding: SPACING.LARGE,
    alignItems: 'center',
  },
  version: {
    fontSize: TYPOGRAPHY.SIZES.SMALL,
    color: COLORS.GRAY,
  },
});
