import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import StorageService from '../../services/storage';
import { User } from '../../types';
import { UI_CONFIG } from '../../config';
import TagInput from '../../components/common/TagInput';

const { COLORS, SPACING, TYPOGRAPHY } = UI_CONFIG;

export default function EditProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await StorageService.getUserData();
      if (userData) {
        setName(userData.name || '');
        setBio(userData.bio || '');
        setInterests(userData.interests || []);
        setAvailability(userData.availability || []);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      setIsLoading(false);
      Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    setIsSaving(true);
    try {
      const userData = await StorageService.getUserData();
      if (userData) {
        const updatedUser: User = {
          ...userData,
          name: name.trim(),
          bio: bio.trim(),
          interests,
          availability,
        };
        await StorageService.saveUserData(updatedUser);
        router.back();
      }
    } catch (error) {
      console.error('Error al guardar datos:', error);
      Alert.alert('Error', 'No se pudieron guardar los cambios');
    } finally {
      setIsSaving(false);
    }
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
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Tu nombre"
          placeholderTextColor={COLORS.GRAY}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Biografía</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          placeholder="Cuéntanos sobre ti"
          placeholderTextColor={COLORS.GRAY}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Intereses</Text>
        <TagInput
          tags={interests}
          onTagsChange={setInterests}
          placeholder="Añade tus intereses"
          suggestions={['Deportes', 'Música', 'Viajes', 'Arte', 'Tecnología', 'Gastronomía']}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Disponibilidad</Text>
        <TagInput
          tags={availability}
          onTagsChange={setAvailability}
          placeholder="Añade tu disponibilidad"
          suggestions={['Mañanas', 'Tardes', 'Noches', 'Fines de semana', 'Entre semana']}
        />
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
  label: {
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    color: COLORS.TEXT,
    marginBottom: SPACING.SMALL,
  },
  input: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    padding: SPACING.MEDIUM,
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    color: COLORS.TEXT,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.MEDIUM,
    margin: SPACING.LARGE,
    borderRadius: 10,
    marginBottom: 30,
  },
  saveButtonText: {
    color: COLORS.BACKGROUND,
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    marginLeft: SPACING.SMALL,
  },
});
