import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, Animated, PanResponder } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

interface Plan {
  id: string;
  title: string;
  description: string;
  category: string;
  date: Date;
  location: string;
  creator: {
    name: string;
    image: string;
  };
  image?: string;
}

// Datos de ejemplo
const DUMMY_PLANS: Plan[] = [
  {
    id: '1',
    title: 'Cena Italiana',
    description: 'Busco compañía para ir a probar un nuevo restaurante italiano en el centro. Dicen que tienen las mejores pastas de la ciudad.',
    category: 'Gastronomía',
    date: new Date('2024-03-20T20:00:00'),
    location: 'Centro, Madrid',
    creator: {
      name: 'Ana García',
      image: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'
  },
  {
    id: '2',
    title: 'Concierto Rock',
    description: 'Tengo entradas extra para el concierto de rock este fin de semana. ¡Busco gente que le guste la buena música!',
    category: 'Música',
    date: new Date('2024-03-23T21:30:00'),
    location: 'WiZink Center, Madrid',
    creator: {
      name: 'Carlos Ruiz',
      image: 'https://randomuser.me/api/portraits/men/2.jpg'
    },
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3'
  },
  {
    id: '3',
    title: 'Ruta de Senderismo',
    description: 'Organizando una ruta de senderismo por la Sierra de Madrid. Nivel principiante-intermedio. ¡Incluye picnic!',
    category: 'Deporte',
    date: new Date('2024-03-24T09:00:00'),
    location: 'Sierra de Guadarrama',
    creator: {
      name: 'Laura Martínez',
      image: 'https://randomuser.me/api/portraits/women/3.jpg'
    },
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306'
  },
  {
    id: '4',
    title: 'Exposición de Arte Moderno',
    description: 'Visita guiada a la nueva exposición de arte moderno. Después podemos tomar algo y compartir impresiones.',
    category: 'Arte',
    date: new Date('2024-03-21T17:00:00'),
    location: 'Museo Reina Sofía',
    creator: {
      name: 'Miguel Ángel',
      image: 'https://randomuser.me/api/portraits/men/4.jpg'
    },
    image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5'
  },
  {
    id: '5',
    title: 'Tarde de Juegos de Mesa',
    description: 'Organizando una tarde de juegos de mesa en una cafetería especializada. ¡Tenemos varios juegos nuevos para probar!',
    category: 'Ocio',
    date: new Date('2024-03-22T16:00:00'),
    location: 'La Mesa Puesta, Madrid',
    creator: {
      name: 'Patricia Sanz',
      image: 'https://randomuser.me/api/portraits/women/5.jpg'
    },
    image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09'
  },
  {
    id: '6',
    title: 'Clase de Cocina Asiática',
    description: 'Buscando compañeros para una clase de cocina asiática. ¡Aprenderemos a hacer sushi y dim sum!',
    category: 'Gastronomía',
    date: new Date('2024-03-25T18:30:00'),
    location: 'Escuela de Cocina Oriental',
    creator: {
      name: 'David López',
      image: 'https://randomuser.me/api/portraits/men/6.jpg'
    },
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554'
  },
  {
    id: '7',
    title: 'Torneo de Padel Amateur',
    description: 'Organizando un pequeño torneo de padel para principiantes. ¡No importa tu nivel, lo importante es divertirse!',
    category: 'Deporte',
    date: new Date('2024-03-26T10:00:00'),
    location: 'Club Deportivo Central',
    creator: {
      name: 'Elena Gómez',
      image: 'https://randomuser.me/api/portraits/women/7.jpg'
    },
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8'
  },
  {
    id: '8',
    title: 'Noche de Stand-Up Comedy',
    description: 'Tengo entradas para un show de comedia. ¡Será una noche llena de risas!',
    category: 'Entretenimiento',
    date: new Date('2024-03-27T22:00:00'),
    location: 'Teatro Pequeño',
    creator: {
      name: 'Roberto Jiménez',
      image: 'https://randomuser.me/api/portraits/men/8.jpg'
    },
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca'
  }
];

export default function PlanSwipeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = new Animated.ValueXY();

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        forceSwipe('right');
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        forceSwipe('left');
      } else {
        resetPosition();
      }
    }
  });

  const forceSwipe = (direction: 'right' | 'left') => {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'right' | 'left') => {
    const plan = DUMMY_PLANS[currentIndex];
    direction === 'right' ? handleLike(plan) : handleDislike(plan);
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(currentIndex + 1);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false
    }).start();
  };

  const handleLike = (plan: Plan) => {
    console.log('Liked plan:', plan.id);
    // TODO: Implementar lógica cuando se hace like a un plan
  };

  const handleDislike = (plan: Plan) => {
    console.log('Disliked plan:', plan.id);
    // TODO: Implementar lógica cuando se hace dislike a un plan
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg']
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }]
    };
  };

  const renderCard = (plan: Plan) => {
    return (
      <View style={styles.card}>
        {plan.image && (
          <Image
            source={{ uri: plan.image }}
            style={styles.image}
          />
        )}
        
        <View style={styles.cardContent}>
          <Text style={styles.title}>{plan.title}</Text>
          
          <View style={styles.infoRow}>
            <FontAwesome name="map-marker" size={16} color="#666" />
            <Text style={styles.infoText}>{plan.location}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <FontAwesome name="calendar" size={16} color="#666" />
            <Text style={styles.infoText}>
              {plan.date.toLocaleDateString()} - {plan.date.toLocaleTimeString().slice(0, 5)}
            </Text>
          </View>

          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{plan.category}</Text>
          </View>

          <Text style={styles.description}>{plan.description}</Text>

          <View style={styles.creatorContainer}>
            <Image
              source={{ uri: plan.creator.image }}
              style={styles.creatorImage}
            />
            <Text style={styles.creatorName}>Por {plan.creator.name}</Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <View style={[styles.actionIndicator, styles.dislikeIndicator]}>
            <FontAwesome name="times" size={30} color="#FF6B6B" />
            <Text style={[styles.actionText, styles.dislikeText]}>No me interesa</Text>
          </View>
          <View style={[styles.actionIndicator, styles.likeIndicator]}>
            <FontAwesome name="check" size={30} color="#4CAF50" />
            <Text style={[styles.actionText, styles.likeText]}>¡Me apunto!</Text>
          </View>
        </View>
      </View>
    );
  };

  if (currentIndex >= DUMMY_PLANS.length) {
    return (
      <View style={styles.endContainer}>
        <Text style={styles.endText}>¡No hay más planes disponibles!</Text>
        <Text style={styles.endSubText}>Vuelve más tarde para descubrir nuevos planes</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[getCardStyle(), styles.cardContainer]}
        {...panResponder.panHandlers}
      >
        {renderCard(DUMMY_PLANS[currentIndex])}
      </Animated.View>
      
      {currentIndex < DUMMY_PLANS.length - 1 && (
        <View style={[styles.cardContainer, styles.nextCardContainer]}>
          {renderCard(DUMMY_PLANS[currentIndex + 1])}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
  },
  cardContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    alignItems: 'center',
  },
  nextCardContainer: {
    top: 0,
    padding: 10,
    zIndex: -1,
  },
  card: {
    width: SCREEN_WIDTH - 20,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    margin: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
  categoryTag: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginVertical: 10,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginVertical: 10,
  },
  creatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  creatorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  creatorName: {
    fontSize: 14,
    color: '#666',
  },
  actionContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  actionIndicator: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dislikeIndicator: {
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  likeIndicator: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  actionText: {
    marginLeft: 5,
    fontWeight: 'bold',
  },
  dislikeText: {
    color: '#FF6B6B',
  },
  likeText: {
    color: '#4CAF50',
  },
  endContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  endText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  endSubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
