import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Message, User } from '../../types';
import { UI_CONFIG } from '../../config';
import ChatMessage from './ChatMessage';
import SocketService from '../../services/socket';
import StorageService from '../../services/storage';

const { COLORS, SPACING, TYPOGRAPHY } = UI_CONFIG;

// Usuario actual (mock)
const currentUser: User = {
  id: '2',
  name: 'Carlos Ruiz',
  email: 'carlos@example.com',
  image: 'https://randomuser.me/api/portraits/men/2.jpg',
};

interface ChatScreenProps {
  planId: string;
  onClose?: () => void;
}

export default function ChatScreen({ planId, onClose }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    setupSocketConnection();
    return () => {
      SocketService.leavePlanRoom(planId);
    };
  }, [planId]);

  const loadMessages = async () => {
    try {
      // Cargar mensajes del almacenamiento local
      const cachedMessages = await StorageService.getItem(`chat_${planId}`);
      if (cachedMessages) {
        setMessages(JSON.parse(cachedMessages));
      }
      
      // Aquí iría la llamada a la API para obtener mensajes más recientes
      // Por ahora usamos datos de ejemplo
      const mockMessages: Message[] = [
        {
          id: '1',
          text: '¡Hola a todos! ¿Están listos para el plan?',
          sender: {
            id: '1',
            name: 'Ana García',
            email: 'ana@example.com',
            image: 'https://randomuser.me/api/portraits/women/1.jpg',
          },
          timestamp: new Date(Date.now() - 3600000),
          planId,
          status: 'read',
        },
        {
          id: '2',
          text: '¡Sí! ¿A qué hora quedamos exactamente?',
          sender: currentUser,
          timestamp: new Date(Date.now() - 1800000),
          planId,
          status: 'read',
        },
      ];

      setMessages(prev => [...prev, ...mockMessages]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      setIsLoading(false);
    }
  };

  const setupSocketConnection = () => {
    SocketService.connect(currentUser.id);
    SocketService.joinPlanRoom(planId);
    
    SocketService.onNewMessage((message: Message) => {
      if (message.planId === planId) {
        setMessages(prev => [...prev, message]);
        StorageService.setItem(`chat_${planId}`, JSON.stringify(messages));
      }
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      sender: currentUser,
      timestamp: new Date(),
      planId,
      status: 'sent',
    };

    // Actualización optimista
    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Enviar mensaje a través del socket
    const sent = SocketService.sendMessage(planId, message.text);
    
    if (!sent) {
      // Si falla el envío, guardar en local para reintento posterior
      StorageService.setItem(`pending_messages_${planId}`, JSON.stringify([
        ...messages,
        { ...message, pending: true }
      ]));
    }

    // Scroll al último mensaje
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatMessage
      message={item}
      isOwnMessage={item.sender.id === currentUser.id}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Chat del Plan</Text>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <FontAwesome name="times" size={24} color={COLORS.TEXT} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {renderHeader()}
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No hay mensajes aún. ¡Sé el primero en escribir!
            </Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={COLORS.GRAY}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !newMessage.trim() && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <FontAwesome
            name="send"
            size={20}
            color={newMessage.trim() ? COLORS.PRIMARY : COLORS.GRAY}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.SIZES.LARGE,
    fontWeight: TYPOGRAPHY.WEIGHTS.BOLD,
    color: COLORS.TEXT,
  },
  closeButton: {
    position: 'absolute',
    right: SPACING.MEDIUM,
    padding: SPACING.SMALL,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: SPACING.MEDIUM,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.LARGE,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.SMALL,
    borderTopWidth: 1,
    borderTopColor: COLORS.LIGHT_GRAY,
    backgroundColor: COLORS.BACKGROUND,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 20,
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    marginRight: SPACING.SMALL,
    color: COLORS.TEXT,
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
