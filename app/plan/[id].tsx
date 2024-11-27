import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import ChatScreen from '../../components/chat/ChatScreen';

// Datos de ejemplo (en una app real, esto vendría de una API)
const PLAN_DETAILS = {
  id: '1',
  title: 'Cena Italiana',
  description: 'Busco compañía para ir a probar un nuevo restaurante italiano en el centro. Dicen que tienen las mejores pastas de la ciudad.',
  category: 'Gastronomía',
  date: new Date('2024-03-20T20:00:00'),
  location: 'Centro, Madrid',
  image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
  creator: {
    id: '1',
    name: 'Ana García',
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  participants: [
    { id: '1', name: 'Ana García', image: 'https://randomuser.me/api/portraits/women/1.jpg' },
    { id: '2', name: 'Carlos Ruiz', image: 'https://randomuser.me/api/portraits/men/2.jpg' },
  ],
  maxParticipants: 4,
  status: 'pending', // 'pending' | 'confirmed' | 'cancelled'
  userStatus: 'confirmed', // 'none' | 'pending' | 'confirmed' | 'creator'
};

export default function PlanDetails() {
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const [showChatModal, setShowChatModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [plan, setPlan] = useState(PLAN_DETAILS);

  // Manejadores de acciones
  const handleJoinPlan = () => {
    // En una app real, esto sería una llamada a la API
    setPlan(prev => ({
      ...prev,
      userStatus: 'pending',
    }));
    setShowConfirmModal(true);
  };

  const handleLeavePlan = () => {
    // En una app real, esto sería una llamada a la API
    setPlan(prev => ({
      ...prev,
      userStatus: 'none',
    }));
  };

  const handleConfirmParticipation = () => {
    // En una app real, esto sería una llamada a la API
    setPlan(prev => ({
      ...prev,
      userStatus: 'confirmed',
      status: 'confirmed',
    }));
    setShowConfirmModal(false);
  };

  const renderActionButtons = () => {
    switch (plan.userStatus) {
      case 'none':
        return (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.joinButton]}
              onPress={handleJoinPlan}
            >
              <View style={styles.actionButtonContent}>
                <FontAwesome name="plus" size={20} color="#fff" />
                {!isSmallScreen && (
                  <Text style={styles.actionButtonText}>Unirme al Plan</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        );
      case 'pending':
        return (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.pendingButton]}
              onPress={handleLeavePlan}
            >
              <View style={styles.actionButtonContent}>
                <FontAwesome name="clock-o" size={20} color="#fff" />
                {!isSmallScreen && (
                  <Text style={styles.actionButtonText}>Solicitud Pendiente</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        );
      case 'confirmed':
      case 'creator':
        return (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.chatButton]}
              onPress={() => setShowChatModal(true)}
            >
              <View style={styles.actionButtonContent}>
                <FontAwesome name="comments" size={20} color="#fff" />
                {!isSmallScreen && (
                  <Text style={styles.actionButtonText}>Chat del Plan</Text>
                )}
              </View>
            </TouchableOpacity>
            {plan.userStatus !== 'creator' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.leaveButton]}
                onPress={handleLeavePlan}
              >
                <View style={styles.actionButtonContent}>
                  <FontAwesome name="sign-out" size={20} color="#fff" />
                  {!isSmallScreen && (
                    <Text style={styles.actionButtonText}>Abandonar Plan</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Imagen del plan */}
      <Image source={{ uri: plan.image }} style={styles.planImage} />

      {/* Botón de volver */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <FontAwesome name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Contenido */}
      <View style={styles.content}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.title}>{plan.title}</Text>
          <View style={[styles.statusBadge, styles[plan.status]]}>
            <Text style={styles.statusText}>
              {plan.status === 'confirmed' ? 'Confirmado' : 
               plan.status === 'pending' ? 'Pendiente' : 'Cancelado'}
            </Text>
          </View>
        </View>

        {/* Detalles básicos */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <FontAwesome name="calendar" size={16} color="#666" />
            <Text style={styles.detailText}>
              {plan.date.toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <FontAwesome name="clock-o" size={16} color="#666" />
            <Text style={styles.detailText}>
              {plan.date.toLocaleTimeString().slice(0, 5)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <FontAwesome name="map-marker" size={16} color="#666" />
            <Text style={styles.detailText}>{plan.location}</Text>
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{plan.description}</Text>
        </View>

        {/* Creador */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organizador</Text>
          <View style={styles.creator}>
            <Image source={{ uri: plan.creator.image }} style={styles.creatorImage} />
            <Text style={styles.creatorName}>{plan.creator.name}</Text>
          </View>
        </View>

        {/* Participantes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Participantes</Text>
            <Text style={styles.participantsCount}>
              {plan.participants.length}/{plan.maxParticipants}
            </Text>
          </View>
          <View style={styles.participantsList}>
            {plan.participants.map((participant) => (
              <View key={participant.id} style={styles.participant}>
                <Image
                  source={{ uri: participant.image }}
                  style={styles.participantImage}
                />
                <Text style={styles.participantName}>{participant.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Botones de acción */}
        {renderActionButtons()}
      </View>

      {/* Modal del Chat */}
      <Modal
        visible={showChatModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowChatModal(false)}
      >
        <ChatScreen planId={id as string} onClose={() => setShowChatModal(false)} />
      </Modal>

      {/* Modal de Confirmación */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Solicitud Enviada</Text>
            <Text style={styles.modalText}>
              Tu solicitud para unirte al plan ha sido enviada. El organizador la revisará pronto.
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalConfirmButton]}
              onPress={() => setShowConfirmModal(false)}
            >
              <Text style={styles.modalButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  planImage: {
    width: '100%',
    height: 250,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pending: {
    backgroundColor: '#FFF3CD',
  },
  confirmed: {
    backgroundColor: '#D4EDDA',
  },
  cancelled: {
    backgroundColor: '#F8D7DA',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  creator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  participantsCount: {
    fontSize: 16,
    color: '#666',
  },
  participantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  participant: {
    alignItems: 'center',
  },
  participantImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  participantName: {
    fontSize: 14,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    minHeight: 45,
    maxHeight: 45,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: '#fff',
  },
  actionButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'center',
  },
  joinButton: {
    backgroundColor: '#FF6B6B',
  },
  pendingButton: {
    backgroundColor: '#FFC107',
  },
  chatButton: {
    backgroundColor: '#4CAF50',
  },
  leaveButton: {
    backgroundColor: '#F44336',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalConfirmButton: {
    backgroundColor: '#4CAF50',
  },
  modalCancelButton: {
    backgroundColor: '#F44336',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
