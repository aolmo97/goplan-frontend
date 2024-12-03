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
import StorageService from '../../services/storage'; // Importar StorageService
import { User } from '../../types';
import { API_CONFIG } from '../../config';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  interests: string[];
  photos: string[];
  availability: {
    days: string[];
    timeRanges: string[];
  };
  settings: {
    notifications: {
      enabled: boolean;
      chatMessages: boolean;
      planUpdates: boolean;
      reminders: boolean;
    };
    privacy: {
      shareLocation: boolean;
      publicProfile: boolean;
    };
  };
}

const { COLORS } = UI_CONFIG;
const { width } = Dimensions.get('window');

const MAX_PHOTOS = 6;

export default function EditProfile() {
  const [user, setUser] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    bio: '',
    interests: [],
    photos: [],
    availability: {
      days: [],
      timeRanges: []
    },
    settings: {
      notifications: {
        enabled: true,
        chatMessages: true,
        planUpdates: true,
        reminders: true
      },
      privacy: {
        shareLocation: true,
        publicProfile: true
      }
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('Iniciando carga de datos del perfil...');
      setIsLoading(true);
      setError(null);

      // Primero intentar cargar datos locales
      const localUserData = await StorageService.getUserData();
      console.log('Datos locales obtenidos:', localUserData);

      if (localUserData) {
        const formattedLocalData = {
          id: localUserData.id || '',
          name: localUserData.name || '',
          email: localUserData.email || '',
          bio: localUserData.bio || '',
          interests: localUserData.interests || [],
          photos: localUserData.photos || [],
          availability: {
            days: localUserData.availability?.days || [],
            timeRanges: localUserData.availability?.timeRanges || []
          },
          settings: {
            notifications: {
              enabled: localUserData.settings?.notifications?.enabled ?? true,
              chatMessages: localUserData.settings?.notifications?.chatMessages ?? true,
              planUpdates: localUserData.settings?.notifications?.planUpdates ?? true,
              reminders: localUserData.settings?.notifications?.reminders ?? true
            },
            privacy: {
              shareLocation: localUserData.settings?.privacy?.shareLocation ?? true,
              publicProfile: localUserData.settings?.privacy?.publicProfile ?? true
            }
          }
        };
        console.log('Estableciendo datos locales:', formattedLocalData);
        setUser(formattedLocalData);
      }

      // Obtener datos del servidor
      console.log('Solicitando datos del servidor...');
      const serverData = await ProfileService.getProfile();
      console.log('Datos del servidor recibidos:', serverData);

      if (serverData) {
        const formattedServerData = {
          id: serverData.id || '',
          name: serverData.name || '',
          email: serverData.email || '',
          bio: serverData.bio || '',
          interests: serverData.interests || [],
          photos: serverData.photos || [],
          availability: {
            days: serverData.availability?.days || [],
            timeRanges: serverData.availability?.timeRanges || []
          },
          settings: {
            notifications: {
              enabled: serverData.settings?.notifications?.enabled ?? true,
              chatMessages: serverData.settings?.notifications?.chatMessages ?? true,
              planUpdates: serverData.settings?.notifications?.planUpdates ?? true,
              reminders: serverData.settings?.notifications?.reminders ?? true
            },
            privacy: {
              shareLocation: serverData.settings?.privacy?.shareLocation ?? true,
              publicProfile: serverData.settings?.privacy?.publicProfile ?? true
            }
          }
        };
        console.log('Actualizando estado con datos del servidor:', formattedServerData);
        setUser(formattedServerData);
        
        // Actualizar almacenamiento local
        await StorageService.setUserData(formattedServerData);
        console.log('Datos del servidor guardados localmente');
      }
    } catch (error) {
      console.error('Error en loadUserData:', error);
      setError('No se pudo cargar el perfil. Por favor, intenta de nuevo.');
      Alert.alert(
        'Error',
        'No se pudo cargar el perfil. Por favor, intenta de nuevo.'
      );
    } finally {
      setIsLoading(false);
      console.log('Proceso de carga finalizado. Estado de carga:', false);
    }
  };

  // Función de utilidad para esperar
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Función para subir fotos con reintentos
  const uploadPhotosWithRetry = async (formData: FormData, token: string, maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Intento ${attempt} de ${maxRetries}...`);
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/user/photos`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const responseText = await response.text();

        if (!response.ok) {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || 'Error al subir las fotos');
        }

        return JSON.parse(responseText);
      } catch (error) {
        console.log(`Error en intento ${attempt}:`, error);
        lastError = error;
        
        if (attempt < maxRetries) {
          // Esperar un tiempo exponencial entre reintentos
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`Esperando ${waitTime}ms antes del siguiente intento...`);
          await wait(waitTime);
        }
      }
    }
    
    throw lastError;
  };

  const handlePhotoSelect = async () => {
    if (uploadingImage) {
      return;
    }

    try {
      const token = await StorageService.getAuthToken();
      if (!token) {
        Alert.alert('Error', 'No hay sesión activa');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: MAX_PHOTOS - (user.photos?.length || 0)
      });

      if (!result.canceled && result.assets.length > 0) {
        setUploadingImage(true);
        const formData = new FormData();
        

        for (const asset of result.assets) {
          const photoUri = asset.uri;

          // Generar un nombre de archivo único
          const timestamp = new Date().getTime();
          const randomString = Math.random().toString(36).substring(7);
          let filename = `photo_${timestamp}_${randomString}.jpg`;

          // Determinar el tipo MIME basado en el URI o usar jpeg por defecto
          let mimeType = 'image/jpeg';
          if (photoUri.startsWith('data:')) {
            mimeType = photoUri.split(';')[0].split(':')[1];
          }

          // Preparar el objeto del archivo según la plataforma
          let fileToUpload: any;

          if (Platform.OS === 'web') {
            if (photoUri.startsWith('data:')) {
              const response = await fetch(photoUri);
              const blob = await response.blob();
              fileToUpload = new File([blob], filename, { type: mimeType });
            } else {
              fileToUpload = asset as any;
              filename = asset.name || filename;
              mimeType = asset.type || mimeType;
            }
          } else {
            let finalUri = photoUri;
            
            // En Android, asegurarse de que el archivo esté accesible
            if (Platform.OS === 'android') {
              try {
                const response = await fetch(photoUri);
                const blob = await response.blob();
                console.log('Blob creado correctamente:', blob.size, 'bytes');
                
                // Usar el blob directamente en Android
                fileToUpload = {
                  uri: photoUri,
                  type: blob.type || mimeType,
                  name: filename
                };
              } catch (error) {
                console.error('Error al procesar archivo en Android:', error);
                throw new Error('No se pudo procesar el archivo seleccionado');
              }
            } else {
              // iOS
              finalUri = photoUri.replace('file://', '');
              fileToUpload = {
                uri: finalUri,
                type: mimeType,
                name: filename
              };
            }
          }

          formData.append('photos', fileToUpload);
        }

        console.log('FormData creado, enviando solicitud...');

        // Usar la función de reintento para subir las fotos
        const data = await uploadPhotosWithRetry(formData, token);
        
        if (data.photoUrls && data.photoUrls.length > 0) {
          setUser(prev => ({
            ...prev,
            photos: [...(prev.photos || []), ...data.photoUrls]
          }));
          Alert.alert('Éxito', `${data.photoUrls.length} foto(s) subida(s) correctamente`);
        } else {
          throw new Error('No se recibieron URLs de fotos del servidor');
        }
      }
    } catch (error) {
      console.error('Error en handlePhotoSelect:', error);
      Alert.alert(
        'Error', 
        error instanceof Error ? error.message : 'No se pudo subir la(s) foto(s). Por favor, intenta de nuevo.'
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeletePhoto = async (index: number) => {
    try {
      setIsLoading(true);
      await ProfileService.deletePhoto(index);
      
      // Actualizar el estado local después de eliminar la foto
      setUser(prev => ({
        ...prev,
        photos: prev.photos.filter((url, i) => i !== index)
      }));

      // Actualizar el almacenamiento local
      const userData = await StorageService.getUserData();
      if (userData) {
        userData.photos = userData.photos.filter((url, i) => i !== index);
        await StorageService.setUserData(userData);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      Alert.alert('Error', 'No se pudo eliminar la foto. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
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
              onPress={() => handleDeletePhoto(index)}
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

  const toggleAvailability = (type: 'days' | 'timeRanges', value: string) => {
    setUser(prev => {
      const currentArray = prev.availability[type] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        availability: {
          ...prev.availability,
          [type]: newArray
        }
      };
    });
  };

  const handleSave = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      
      // Guardar en el servidor
      await ProfileService.updateProfile({
        bio: user.bio,
        interests: user.interests,
        photos: user.photos,
        availability: {
          days: user.availability.days,
          timeRanges: user.availability.timeRanges,
        }
      });

      // Guardar localmente
      await StorageService.setUserData(user);
      
      router.back();
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      Alert.alert(
        'Error',
        'No se pudo guardar el perfil. Por favor, intenta de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadUserData}
          >
            <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
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
              <Text style={styles.subsectionTitle}>Días</Text>
              <View style={styles.chipContainer}>
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.availabilityChip,
                      user.availability.days.includes(day) && styles.selectedAvailability
                    ]}
                    onPress={() => toggleAvailability('days', day)}
                  >
                    <Text style={[
                      styles.availabilityText,
                      user.availability.days.includes(day) && styles.selectedAvailabilityText
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={[styles.subsectionTitle, { marginTop: 15 }]}>Horarios</Text>
              <View style={styles.chipContainer}>
                {['Mañana', 'Tarde', 'Noche'].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.availabilityChip,
                      user.availability.timeRanges.includes(time) && styles.selectedAvailability
                    ]}
                    onPress={() => toggleAvailability('timeRanges', time)}
                  >
                    <Text style={[
                      styles.availabilityText,
                      user.availability.timeRanges.includes(time) && styles.selectedAvailabilityText
                    ]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
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
    color: COLORS.TEXT,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    padding: 20,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  retryButton: {
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  retryButtonText: {
    fontSize: 16,
    color: '#fff',
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
    borderColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  addPhotoText: {
    color: COLORS.PRIMARY,
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
    color: COLORS.TEXT,
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
    backgroundColor: COLORS.PRIMARY,
  },
  interestText: {
    color: COLORS.TEXT,
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
    backgroundColor: COLORS.PRIMARY,
  },
  availabilityText: {
    color: COLORS.TEXT,
  },
  selectedAvailabilityText: {
    color: '#fff',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
