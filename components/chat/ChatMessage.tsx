import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Message } from '../../types';
import { UI_CONFIG } from '../../config';

const { COLORS, SPACING, TYPOGRAPHY } = UI_CONFIG;

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function ChatMessage({ message, isOwnMessage }: ChatMessageProps) {
  const messageTime = new Date(message.timestamp).toLocaleTimeString().slice(0, 5);

  return (
    <View style={[
      styles.container,
      isOwnMessage ? styles.ownMessage : styles.otherMessage
    ]}>
      {!isOwnMessage && (
        <Image
          source={{ uri: message.sender.image }}
          style={styles.avatar}
        />
      )}
      <View style={[
        styles.messageContent,
        isOwnMessage ? styles.ownMessageContent : styles.otherMessageContent
      ]}>
        {!isOwnMessage && (
          <Text style={styles.senderName}>{message.sender.name}</Text>
        )}
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownMessageText : styles.otherMessageText
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.timestamp,
          isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
        ]}>
          {messageTime}
        </Text>
        {message.status === 'sent' && isOwnMessage && (
          <View style={styles.statusIndicator}>
            <Text style={styles.statusDot}>•</Text>
          </View>
        )}
        {message.status === 'delivered' && isOwnMessage && (
          <View style={styles.statusIndicator}>
            <Text style={styles.statusDot}>••</Text>
          </View>
        )}
        {message.status === 'read' && isOwnMessage && (
          <View style={styles.statusIndicator}>
            <Text style={[styles.statusDot, styles.readStatus]}>••</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: SPACING.TINY,
    paddingHorizontal: SPACING.MEDIUM,
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.SMALL,
  },
  messageContent: {
    maxWidth: '70%',
    borderRadius: 16,
    padding: SPACING.SMALL,
  },
  ownMessageContent: {
    backgroundColor: COLORS.PRIMARY,
    borderBottomRightRadius: 4,
  },
  otherMessageContent: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: TYPOGRAPHY.SIZES.TINY,
    color: COLORS.GRAY,
    marginBottom: 2,
  },
  messageText: {
    fontSize: TYPOGRAPHY.SIZES.MEDIUM,
    marginRight: SPACING.MEDIUM,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: COLORS.TEXT,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.SIZES.TINY,
    position: 'absolute',
    bottom: 4,
    right: 8,
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: COLORS.GRAY,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: -12,
  },
  statusDot: {
    fontSize: TYPOGRAPHY.SIZES.TINY,
    color: COLORS.GRAY,
  },
  readStatus: {
    color: '#4FC3F7',
  },
});
