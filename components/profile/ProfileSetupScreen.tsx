import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

const INTERESTS = [
  'Cultura', 'Gastronomía', 'Conciertos', 'Viajes', 'Deporte',
  'Cine', 'Teatro', 'Música', 'Arte', 'Fotografía',
  'Naturaleza', 'Tecnología', 'Gaming', 'Lectura', 'Baile'
];

export default function ProfileSetupScreen() {
  const [profileData, setProfileData] = useState({
    bio: '',
    interests: [] as string[],
    availability: {
      weekdays: false,
      weekends: false,
      mornings: false,
      afternoons: false,
      evenings: false,
    },
  });

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

  const handlePhotoUpload = () => {
    // TODO: Implementar lógica de subida de foto
    console.log('Upload photo');
  };

  const handleSaveProfile = () => {
    // TODO: Implementar lógica de guardado de perfil
    router.push('/home');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Configura tu Perfil</Text>

        <TouchableOpacity style={styles.photoContainer} onPress={handlePhotoUpload}>
          <View style={styles.photoPlaceholder}>
            <FontAwesome name="camera" size={40} color="#999" />
          </View>
          <Text style={styles.photoText}>Añadir foto de perfil</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre ti</Text>
          <TextInput
            style={styles.bioInput}
            placeholder="Escribe una breve descripción sobre ti..."
            value={profileData.bio}
            onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intereses</Text>
          <View style={styles.interestsContainer}>
            {INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestTag,
                  profileData.interests.includes(interest) && styles.interestTagSelected
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[
                  styles.interestText,
                  profileData.interests.includes(interest) && styles.interestTextSelected
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
                style={[styles.availabilityTag, value && styles.availabilityTagSelected]}
                onPress={() => toggleAvailability(key)}
              >
                <Text style={[styles.availabilityText, value && styles.availabilityTextSelected]}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
          <Text style={styles.saveButtonText}>Guardar Perfil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  photoText: {
    color: '#FF6B6B',
    fontSize: 16,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    height: 120,
    textAlignVertical: 'top',
    backgroundColor: '#f8f8f8',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  interestTag: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    margin: 5,
  },
  interestTagSelected: {
    backgroundColor: '#FF6B6B',
  },
  interestText: {
    color: '#666',
  },
  interestTextSelected: {
    color: '#fff',
  },
  availabilityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  availabilityTag: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    margin: 5,
  },
  availabilityTagSelected: {
    backgroundColor: '#FF6B6B',
  },
  availabilityText: {
    color: '#666',
  },
  availabilityTextSelected: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
