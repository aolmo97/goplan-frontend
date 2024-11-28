import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { UI_CONFIG } from '../../config';
import ProfileService from '../../services/profile';

const { COLORS } = UI_CONFIG;

const INTERESTS = [
  'Cultura', 'Gastronomía', 'Conciertos', 'Viajes', 'Deporte',
  'Cine', 'Teatro', 'Música', 'Arte', 'Fotografía',
  'Naturaleza', 'Tecnología', 'Gaming', 'Lectura', 'Baile'
];

export default function ProfileSetupScreen() {
  const [profileData, setProfileData] = useState({
    bio: '',
    interests: [] as string[],
    avatar: '',
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

  const toggleInterest = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const toggleAvailability = (key: string) => {
    setProfileData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [key]: !prev.availability[key as keyof typeof prev.availability]
      }
    }));
  };

  const handlePhotoUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permiso Denegado',
          'Necesitamos acceso a tu galería para subir una foto de perfil.'
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
        setUploadingImage(true);
        try {
          const imageUrl = await ProfileService.uploadProfileImage(result.assets[0].uri);
          setProfileData(prev => ({
            ...prev,
            avatar: imageUrl
          }));
        } catch (error) {
          console.error('Error al subir la imagen al servidor:', error);
          Alert.alert('Error', 'No se pudo subir la imagen al servidor. Por favor, intenta de nuevo.');
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      console.error('Error al acceder a la galería:', error);
      Alert.alert('Error', 'No se pudo acceder a la galería. Por favor, intenta de nuevo.');
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await ProfileService.updateProfile(profileData);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      Alert.alert('Error', 'No se pudo guardar el perfil. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Configura tu perfil</Text>

      <View style={styles.photoSection}>
        <TouchableOpacity 
          onPress={handlePhotoUpload} 
          style={styles.photoContainer}
          disabled={uploadingImage}
        >
          {uploadingImage ? (
            <View style={styles.photoPlaceholder}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : profileData.avatar ? (
            <Image 
              source={{ uri: profileData.avatar }} 
              style={styles.photo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <FontAwesome name="camera" size={40} color={COLORS.primary} />
              <Text style={styles.photoText}>Añadir foto</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre ti</Text>
        <TextInput
          style={styles.bioInput}
          placeholder="Cuéntanos sobre ti..."
          multiline
          numberOfLines={4}
          value={profileData.bio}
          onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Intereses</Text>
        <View style={styles.interestsContainer}>
          {INTERESTS.map((interest) => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestChip,
                profileData.interests.includes(interest) && styles.selectedInterest
              ]}
              onPress={() => toggleInterest(interest)}
            >
              <Text style={[
                styles.interestText,
                profileData.interests.includes(interest) && styles.selectedInterestText
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
          {Object.entries(profileData.availability).map(([key, value]) => (
            <TouchableOpacity
              key={key}
              style={[styles.availabilityChip, value && styles.selectedAvailability]}
              onPress={() => toggleAvailability(key)}
            >
              <Text style={[styles.availabilityText, value && styles.selectedAvailabilityText]}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, isLoading && styles.disabledButton]} 
        onPress={handleSaveProfile}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Guardar perfil</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: COLORS.primary,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: COLORS.text,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    marginTop: 5,
    color: COLORS.primary,
    fontSize: 14,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
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
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
