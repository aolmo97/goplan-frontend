import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import StorageService from '../../services/storage';
import { User } from '../../types';
import { UI_CONFIG } from '../../config';

const { COLORS, SPACING, TYPOGRAPHY } = UI_CONFIG;

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await StorageService.getUserData();
      
      if (userData) {
        setUser(userData);
      } else {
        // Datos de ejemplo para desarrollo
        const defaultUser = {
          id: '1',
          name: 'Usuario de Prueba',
          email: 'usuario@ejemplo.com',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          bio: '¡Hola! Me encanta conocer gente nueva y participar en actividades interesantes.',
          interests: ['Deportes', 'Música', 'Viajes', 'Fotografía'],
          availability: {
            weekdays: true,
            weekends: true,
            mornings: true,
            afternoons: true,
            evenings: true,
          },
          plansCreated: 3,
          plansJoined: 5,
        };
        await StorageService.saveUserData(defaultUser);
        setUser(defaultUser);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleSettings = () => {
    router.push('/profile/settings');
  };

  const handleChangePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permiso Denegado',
          'Necesitamos acceso a tu galería para cambiar la foto de perfil.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        // Aquí iría la lógica para subir la imagen al servidor
        // Por ahora, solo actualizamos localmente
        if (user) {
          const updatedUser = {
            ...user,
            image: result.assets[0].uri,
          };
          await StorageService.saveUserData(updatedUser);
          setUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Error al cambiar la foto:', error);
      Alert.alert(
        'Error',
        'No se pudo cambiar la foto de perfil. Inténtalo de nuevo.'
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAuthData();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión. Inténtalo de nuevo.');
            }
          },
        },
      ]
    );
  };

  const renderAvailability = () => {
    if (!user?.availability) return null;

    const availabilityText = [];
    if (user.availability.weekdays) availabilityText.push('Entre semana');
    if (user.availability.weekends) availabilityText.push('Fines de semana');
    if (user.availability.mornings) availabilityText.push('Mañanas');
    if (user.availability.afternoons) availabilityText.push('Tardes');
    if (user.availability.evenings) availabilityText.push('Noches');

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Disponibilidad</Text>
        <View style={styles.availabilityContainer}>
          {availabilityText.map((text, index) => (
            <View key={index} style={styles.availabilityItem}>
              <Text style={styles.availabilityText}>{text}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar el perfil</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadUserData}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleChangePhoto}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: user.avatar }} style={styles.profileImage} />
            <View style={styles.changePhotoButton}>
              <FontAwesome name="camera" size={16} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user.name}</Text>
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.plansCreated || 0}</Text>
          <Text style={styles.statLabel}>Planes Creados</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{user.plansJoined || 0}</Text>
          <Text style={styles.statLabel}>Planes Unidos</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Intereses</Text>
        <View style={styles.tagsContainer}>
          {user.interests?.map((interest, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>

      {renderAvailability()}

      <TouchableOpacity
        style={styles.editButton}
        onPress={handleEditProfile}
      >
        <FontAwesome name="edit" size={20} color="#fff" />
        <Text style={styles.editButtonText}>Editar Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={handleSettings}
      >
        <FontAwesome name="cog" size={20} color="#666" />
        <Text style={styles.settingsButtonText}>Configuración</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <FontAwesome name="sign-out" size={20} color={COLORS.ERROR} />
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.LARGE,
  },
  errorText: {
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    color: COLORS.ERROR,
    textAlign: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.MEDIUM,
    borderRadius: 25,
  },
  retryButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.LARGE,
    paddingTop: 40,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: SPACING.MEDIUM,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  changePhotoButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.PRIMARY,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.BACKGROUND,
  },
  name: {
    fontSize: TYPOGRAPHY.SIZES.XLARGE,
    fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.TINY,
  },
  bio: {
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    color: COLORS.GRAY,
    textAlign: 'center',
    paddingHorizontal: SPACING.LARGE,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.LARGE,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginVertical: SPACING.LARGE,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.GRAY,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.SIZES.XLARGE,
    fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    color: COLORS.PRIMARY,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.SIZES.SMALL,
    color: COLORS.GRAY,
    marginTop: SPACING.TINY,
  },
  section: {
    padding: SPACING.LARGE,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.SIZES.LARGE,
    fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.MEDIUM,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.TINY,
  },
  tag: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: 20,
    margin: SPACING.TINY,
  },
  tagText: {
    color: COLORS.BACKGROUND,
    fontSize: TYPOGRAPHY.SIZES.SMALL,
  },
  availabilityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.TINY,
  },
  availabilityItem: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: 20,
    margin: SPACING.TINY,
  },
  availabilityText: {
    color: COLORS.BACKGROUND,
    fontSize: TYPOGRAPHY.SIZES.SMALL,
  },
  editButton: {
    backgroundColor: COLORS.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.MEDIUM,
    marginHorizontal: SPACING.LARGE,
    borderRadius: 10,
    marginTop: SPACING.LARGE,
  },
  editButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    marginLeft: SPACING.SMALL,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.MEDIUM,
    marginHorizontal: SPACING.LARGE,
    borderRadius: 10,
    marginTop: SPACING.MEDIUM,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  settingsButtonText: {
    color: COLORS.GRAY,
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    marginLeft: SPACING.SMALL,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.MEDIUM,
    marginHorizontal: SPACING.LARGE,
    borderRadius: 10,
    marginTop: SPACING.MEDIUM,
    marginBottom: SPACING.LARGE,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  logoutButtonText: {
    color: COLORS.ERROR,
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    marginLeft: SPACING.SMALL,
  },
});
