import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

// Datos de ejemplo
const DUMMY_MATCHES = [
  {
    id: '1',
    title: 'Cena Italiana',
    date: new Date('2024-03-20T20:00:00'),
    location: 'Centro, Madrid',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    participants: [
      { id: '1', name: 'Ana García', image: 'https://randomuser.me/api/portraits/women/1.jpg' },
      { id: '2', name: 'Carlos Ruiz', image: 'https://randomuser.me/api/portraits/men/2.jpg' },
    ],
    status: 'confirmed', // confirmed, pending, cancelled
  },
  {
    id: '2',
    title: 'Concierto Rock',
    date: new Date('2024-03-23T21:30:00'),
    location: 'WiZink Center',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3',
    participants: [
      { id: '1', name: 'Ana García', image: 'https://randomuser.me/api/portraits/women/1.jpg' },
      { id: '3', name: 'Laura Martínez', image: 'https://randomuser.me/api/portraits/women/3.jpg' },
      { id: '4', name: 'Miguel Ángel', image: 'https://randomuser.me/api/portraits/men/4.jpg' },
    ],
    status: 'pending',
  },
];

const DUMMY_SAVED = [
  {
    id: '3',
    title: 'Ruta de Senderismo',
    date: new Date('2024-03-24T09:00:00'),
    location: 'Sierra de Guadarrama',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306',
    creator: {
      id: '5',
      name: 'David López',
      image: 'https://randomuser.me/api/portraits/men/5.jpg',
    },
  },
  {
    id: '4',
    title: 'Exposición de Arte',
    date: new Date('2024-03-21T17:00:00'),
    location: 'Museo Reina Sofía',
    image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5',
    creator: {
      id: '6',
      name: 'Patricia Sanz',
      image: 'https://randomuser.me/api/portraits/women/6.jpg',
    },
  },
];

export default function Matches() {
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' or 'saved'

  const renderMatchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.planCard}
      onPress={() => router.push(`/plan/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.planImage} />
      <View style={styles.planInfo}>
        <Text style={styles.planTitle}>{item.title}</Text>
        <View style={styles.planDetails}>
          <View style={styles.detailItem}>
            <FontAwesome name="calendar" size={14} color="#666" />
            <Text style={styles.detailText}>
              {item.date.toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <FontAwesome name="map-marker" size={14} color="#666" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        </View>
        
        {/* Participantes */}
        <View style={styles.participants}>
          <Text style={styles.participantsTitle}>Participantes:</Text>
          <View style={styles.participantsList}>
            {item.participants.map((participant) => (
              <Image
                key={participant.id}
                source={{ uri: participant.image }}
                style={styles.participantImage}
              />
            ))}
          </View>
        </View>

        {/* Estado del plan */}
        <View style={[styles.statusBadge, styles[item.status]]}>
          <Text style={styles.statusText}>
            {item.status === 'confirmed' ? 'Confirmado' : 
             item.status === 'pending' ? 'Pendiente' : 'Cancelado'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSavedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.planCard}
      onPress={() => router.push(`/plan/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.planImage} />
      <View style={styles.planInfo}>
        <Text style={styles.planTitle}>{item.title}</Text>
        <View style={styles.planDetails}>
          <View style={styles.detailItem}>
            <FontAwesome name="calendar" size={14} color="#666" />
            <Text style={styles.detailText}>
              {item.date.toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <FontAwesome name="map-marker" size={14} color="#666" />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        </View>
        
        {/* Creador del plan */}
        <View style={styles.creator}>
          <Image
            source={{ uri: item.creator.image }}
            style={styles.creatorImage}
          />
          <Text style={styles.creatorName}>{item.creator.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
          onPress={() => setActiveTab('matches')}
        >
          <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>
            Mis Matches
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
          onPress={() => setActiveTab('saved')}
        >
          <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
            Guardados
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista de planes */}
      <FlatList
        data={activeTab === 'matches' ? DUMMY_MATCHES : DUMMY_SAVED}
        renderItem={activeTab === 'matches' ? renderMatchItem : renderSavedItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  planImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  planInfo: {
    padding: 15,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  planDetails: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  detailText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  participants: {
    marginTop: 10,
  },
  participantsTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  participantsList: {
    flexDirection: 'row',
  },
  participantImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: -10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  confirmed: {
    backgroundColor: '#4CAF50',
  },
  pending: {
    backgroundColor: '#FFC107',
  },
  cancelled: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  creator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  creatorImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  creatorName: {
    fontSize: 14,
    color: '#666',
  },
});
