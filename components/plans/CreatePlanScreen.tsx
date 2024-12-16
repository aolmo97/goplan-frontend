import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
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
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const [planData, setPlanData] = useState({
    description: '',
    title: '',
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

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // TODO: Submit plan data
      router.push('/plans');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <Text style={styles.title}>¿Cómo describirías tu plan?</Text>
            <Text style={styles.subtitle}>
              La gente verá esto cuando promocionemos tu plan, pero podrás actualizarlo más tarde.
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe tu plan..."
                value={planData.description}
                onChangeText={(text) => setPlanData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={6}
              />
            </View>

            <View style={styles.helpContainer}>
              <Text style={styles.helpTitle}>Preguntas guía:</Text>
              <Text style={styles.helpText}>• ¿Cuál es el objetivo del plan?</Text>
              <Text style={styles.helpText}>• ¿A quién esperas conocer?</Text>
              <Text style={styles.helpText}>• ¿Qué harán en el evento?</Text>
            </View>

            <TouchableOpacity style={styles.seeExamples}>
              <FontAwesome name="lightbulb-o" size={20} color="#00BCD4" />
              <Text style={styles.seeExamplesText}>Ver ejemplos de descripciones</Text>
            </TouchableOpacity>
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.title}>¿Cuándo será el plan?</Text>
            <Text style={styles.subtitle}>
              Selecciona la fecha y hora para tu evento
            </Text>

            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <FontAwesome name="calendar" size={20} color="#00BCD4" />
                <Text style={styles.dateTimeText}>
                  {planData.date.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <FontAwesome name="clock-o" size={20} color="#00BCD4" />
                <Text style={styles.dateTimeText}>
                  {planData.time.toLocaleTimeString().slice(0, 5)}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={planData.date}
                mode="date"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setPlanData(prev => ({ ...prev, date: selectedDate }));
                  }
                }}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={planData.time}
                mode="time"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) {
                    setPlanData(prev => ({ ...prev, time: selectedTime }));
                  }
                }}
              />
            )}
          </>
        );

      case 3:
        return (
          <>
            <Text style={styles.title}>¿Dónde será el plan?</Text>
            <Text style={styles.subtitle}>
              Indica la ubicación donde se realizará el evento
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Añade la ubicación del plan"
                value={planData.location}
                onChangeText={(text) => setPlanData(prev => ({ ...prev, location: text }))}
              />
            </View>

            <View style={styles.helpContainer}>
              <Text style={styles.helpTitle}>Sugerencias:</Text>
              <Text style={styles.helpText}>• Nombre del lugar</Text>
              <Text style={styles.helpText}>• Dirección completa</Text>
              <Text style={styles.helpText}>• Punto de referencia cercano</Text>
            </View>
          </>
        );

      case 4:
        return (
          <>
            <Text style={styles.title}>¿Qué tipo de plan es?</Text>
            <Text style={styles.subtitle}>
              Selecciona la categoría que mejor describa tu plan
            </Text>

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

            <View style={styles.companionSection}>
              <Text style={styles.sectionTitle}>Tipo de compañía</Text>
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
          </>
        );

      case 5:
        return (
          <>
            <Text style={styles.title}>Últimos detalles</Text>
            <Text style={styles.subtitle}>
              Configura los últimos detalles de tu plan
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Título del Plan</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Cena en restaurante italiano"
                value={planData.title}
                onChangeText={(text) => setPlanData(prev => ({ ...prev, title: text }))}
              />
            </View>

            <View style={styles.visibilitySection}>
              <Text style={styles.sectionTitle}>Visibilidad</Text>
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
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <FontAwesome name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/plans')}>
          <Text style={styles.exitButton}>Exit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        {Array(totalSteps).fill(0).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressBar,
              index < currentStep ? styles.progressBarActive : null
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.content}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === totalSteps ? 'Crear Plan' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  exitButton: {
    color: '#00BCD4',
    fontSize: 16,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 4,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: '#00BCD4',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  helpContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  helpText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  seeExamples: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  seeExamplesText: {
    color: '#00BCD4',
    fontSize: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 12,
    flex: 0.48,
    gap: 10,
  },
  dateTimeText: {
    color: '#fff',
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 30,
  },
  categoryTag: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#222',
    marginRight: 10,
  },
  categoryTagSelected: {
    backgroundColor: '#00BCD4',
  },
  categoryText: {
    color: '#888',
    fontSize: 16,
  },
  categoryTextSelected: {
    color: '#fff',
  },
  companionSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  companionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  companionTag: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#222',
  },
  companionTagSelected: {
    backgroundColor: '#00BCD4',
  },
  companionText: {
    color: '#888',
    fontSize: 16,
  },
  companionTextSelected: {
    color: '#fff',
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  visibilitySection: {
    marginTop: 30,
  },
  visibilityContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  visibilityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#222',
    alignItems: 'center',
  },
  visibilityButtonSelected: {
    backgroundColor: '#00BCD4',
  },
  visibilityText: {
    color: '#888',
    fontSize: 16,
  },
  visibilityTextSelected: {
    color: '#fff',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  nextButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
