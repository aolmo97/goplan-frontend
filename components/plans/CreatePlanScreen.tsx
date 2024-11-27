import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const CATEGORIES = [
  'Cultura', 'Gastronomía', 'Conciertos', 'Viajes', 'Deporte',
  'Cine', 'Teatro', 'Música', 'Arte', 'Fotografía'
];

const COMPANION_TYPES = [
  'Individual', 'Pareja', 'Grupo pequeño', 'Grupo grande'
];

export default function CreatePlanScreen() {
  const [planData, setPlanData] = useState({
    title: '',
    description: '',
    category: '',
    date: new Date(),
    time: new Date(),
    location: '',
    companionType: '',
    maxParticipants: '2',
    isPublic: true,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setPlanData(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setPlanData(prev => ({ ...prev, time: selectedTime }));
    }
  };

  const handleCreatePlan = () => {
    // TODO: Implementar lógica de creación de plan
    router.push('/plans');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Crear Nuevo Plan</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Título del Plan</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Cena en restaurante italiano"
            value={planData.title}
            onChangeText={(text) => setPlanData(prev => ({ ...prev, title: text }))}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe los detalles del plan..."
            value={planData.description}
            onChangeText={(text) => setPlanData(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Categoría</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryTag,
                  planData.category === category && styles.categoryTagSelected
                ]}
                onPress={() => setPlanData(prev => ({ ...prev, category }))}
              >
                <Text style={[
                  styles.categoryText,
                  planData.category === category && styles.categoryTextSelected
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Fecha y Hora</Text>
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <FontAwesome name="calendar" size={20} color="#666" />
              <Text style={styles.dateTimeText}>
                {planData.date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <FontAwesome name="clock-o" size={20} color="#666" />
              <Text style={styles.dateTimeText}>
                {planData.time.toLocaleTimeString().slice(0, 5)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ubicación</Text>
          <TextInput
            style={styles.input}
            placeholder="Añade la ubicación del plan"
            value={planData.location}
            onChangeText={(text) => setPlanData(prev => ({ ...prev, location: text }))}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tipo de Compañía</Text>
          <View style={styles.companionContainer}>
            {COMPANION_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.companionTag,
                  planData.companionType === type && styles.companionTagSelected
                ]}
                onPress={() => setPlanData(prev => ({ ...prev, companionType: type }))}
              >
                <Text style={[
                  styles.companionText,
                  planData.companionType === type && styles.companionTextSelected
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Visibilidad</Text>
          <View style={styles.visibilityContainer}>
            <TouchableOpacity
              style={[styles.visibilityButton, planData.isPublic && styles.visibilityButtonSelected]}
              onPress={() => setPlanData(prev => ({ ...prev, isPublic: true }))}
            >
              <Text style={[styles.visibilityText, planData.isPublic && styles.visibilityTextSelected]}>
                Público
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.visibilityButton, !planData.isPublic && styles.visibilityButtonSelected]}
              onPress={() => setPlanData(prev => ({ ...prev, isPublic: false }))}
            >
              <Text style={[styles.visibilityText, !planData.isPublic && styles.visibilityTextSelected]}>
                Solo Amigos
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreatePlan}>
          <Text style={styles.createButtonText}>Crear Plan</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={planData.date}
            mode="date"
            onChange={handleDateChange}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={planData.time}
            mode="time"
            onChange={handleTimeChange}
          />
        )}
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#f8f8f8',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginHorizontal: -5,
  },
  categoryTag: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    margin: 5,
  },
  categoryTagSelected: {
    backgroundColor: '#FF6B6B',
  },
  categoryText: {
    color: '#666',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    flex: 0.48,
  },
  dateTimeText: {
    marginLeft: 10,
    color: '#666',
  },
  companionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  companionTag: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    margin: 5,
  },
  companionTagSelected: {
    backgroundColor: '#FF6B6B',
  },
  companionText: {
    color: '#666',
  },
  companionTextSelected: {
    color: '#fff',
  },
  visibilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  visibilityButton: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  visibilityButtonSelected: {
    backgroundColor: '#FF6B6B',
  },
  visibilityText: {
    color: '#666',
  },
  visibilityTextSelected: {
    color: '#fff',
  },
  createButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
