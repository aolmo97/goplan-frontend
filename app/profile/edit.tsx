import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { UI_CONFIG } from '../../config';
import ProfileService from '../../services/profile';
import { User } from '../../types';

const { COLORS } = UI_CONFIG;
const { width } = Dimensions.get('window');

const MAX_PHOTOS = 6;

export default function EditProfile() {
  const [user, setUser] = useState<User>({
    id: '',
    name: '',
    email: '',
    bio: '',
    photos: [],
    interests: [],
    availability: {
      weekdays: false,
      weekends: false,
      mornings: false,
      afternoons: false,
      evenings: false,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await ProfileService.getProfile();
      console.log('userData', userData);
      
      setUser({
        ...userData,
        photos: userData.photos || []
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoSelect = async () => {
    if (user.photos.length >= MAX_PHOTOS) {
      Alert.alert('Límite alcanzado', 'Ya has agregado el máximo de fotos permitidas');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploadingImage(true);
        const formData = new FormData();
        const photoUri = result.assets[0].uri;
        
        // Asegurarse de que tenemos la extensión correcta
        const filename = photoUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1] : 'jpg';
        const type = `image/${ext}`;

        // En iOS, necesitamos convertir el URI de asset-library:// a un URI de archivo
        const finalUri = Platform.OS === 'ios' ? photoUri.replace('file://', '') : photoUri;

        // Crear el objeto del archivo con el formato correcto
        formData.append('photos', {
          uri: finalUri,
          type: type,
          name: `photo.${ext}`,
        } as any);

        console.log('Enviando FormData:', {
          uri: finalUri,
          type: type,
          name: `photo.${ext}`,
        });

        const photoUrls = await ProfileService.uploadPhotos(formData);
        setUser(prev => ({
          ...prev,
          photos: [...prev.photos, ...photoUrls],
        }));
      }
    } catch (error) {
      console.error('Error al subir foto:', error);
      Alert.alert('Error', 'No se pudo subir la foto');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    try {
      await ProfileService.deletePhoto(photoUrl);
      setUser(prev => ({
        ...prev,
        photos: prev.photos.filter(url => url !== photoUrl),
      }));
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la foto');
    }
  };

  const renderPhotos = () => {
    const photoSize = (width - 40) / 3;

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    return (
      <View style={styles.photosContainer}>
        {user.photos.map((photo, index) => (
          <View key={photo} style={[styles.photoWrapper, { width: photoSize, height: photoSize * 1.25 }]}>
            <Image 
              source={{ uri: photo }} 
              style={styles.photo}
              loadingIndicatorSource={<ActivityIndicator />}
            />
            <TouchableOpacity
              style={styles.deletePhotoButton}
              onPress={() => handleDeletePhoto(photo)}
            >
              <View style={styles.deleteButtonBackground}>
                <Ionicons name="close" size={20} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        ))}
        
        {user.photos.length < MAX_PHOTOS && (
          <TouchableOpacity
            style={[
              styles.addPhotoButton,
              { width: photoSize, height: photoSize * 1.25 }
            ]}
            onPress={handlePhotoSelect}
          >
            {uploadingImage ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="add" size={40} color={COLORS.primary} />
                <Text style={styles.addPhotoText}>Agregar foto</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const toggleInterest = (interest: string) => {
    setUser(prev => ({
      ...prev,
      interests: prev.interests?.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...(prev.interests || []), interest]
    }));
  };

  const toggleAvailability = (key: keyof typeof user.availability) => {
    setUser(prev => ({
      ...prev,
      availability: {
        ...(prev.availability || {}),
        [key]: !prev.availability?.[key]
      }
    }));
  };

  const handleSave = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await ProfileService.updateProfile({
        bio: user.bio || '',
        interests: user.interests || [],
        photos: user.photos,
        availability: user.availability || {
          weekdays: false,
          weekends: false,
          mornings: false,
          afternoons: false,
          evenings: false,
        }
      });
      await ProfileService.setUserData(user);
      router.back();
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      Alert.alert('Error', 'No se pudo guardar el perfil. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <FontAwesome name="times" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[styles.headerButton, isLoading && styles.disabledButton]}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} size="small" />
          ) : (
            <FontAwesome name="check" size={24} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {renderPhotos()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre ti</Text>
          <TextInput
            style={styles.bioInput}
            placeholder="Escribe algo sobre ti..."
            multiline
            value={user.bio}
            onChangeText={(text) => setUser(prev => ({ ...prev, bio: text }))}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intereses</Text>
          <View style={styles.interestsContainer}>
            {['Cultura', 'Gastronomía', 'Conciertos', 'Viajes', 'Deporte', 'Cine', 'Teatro', 'Música', 'Arte', 'Fotografía', 'Naturaleza', 'Tecnología', 'Gaming', 'Lectura', 'Baile'].map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestChip,
                  user.interests?.includes(interest) && styles.selectedInterest
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[
                  styles.interestText,
                  user.interests?.includes(interest) && styles.selectedInterestText
                ]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disponibilidad</Text>
          <View style={styles.availabilityContainer}>
            {Object.entries(user.availability || {}).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.availabilityChip,
                  value && styles.selectedAvailability
                ]}
                onPress={() => toggleAvailability(key as keyof typeof user.availability)}
              >
                <Text style={[
                  styles.availabilityText,
                  value && styles.selectedAvailabilityText
                ]}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: 16,
      },
    }),
  },
  headerButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  photoWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  deletePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
  },
  deleteButtonBackground: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  addPhotoText: {
    color: COLORS.primary,
    marginTop: 5,
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: COLORS.text,
  },
  bioInput: {
    minHeight: 100,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    textAlignVertical: 'top',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  selectedInterest: {
    backgroundColor: COLORS.primary,
  },
  interestText: {
    color: COLORS.text,
  },
  selectedInterestText: {
    color: '#fff',
  },
  availabilityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  availabilityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  selectedAvailability: {
    backgroundColor: COLORS.primary,
  },
  availabilityText: {
    color: COLORS.text,
  },
  selectedAvailabilityText: {
    color: '#fff',
  },
});
