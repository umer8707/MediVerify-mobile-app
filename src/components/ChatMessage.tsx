import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <View
      style={[
        styles.container,
        message.isUser ? styles.userContainer : styles.botContainer,
      ]}
    >
      {message.isUser ? (
        <Text style={styles.userText}>{message.text}</Text>
      ) : (
        <Markdown style={markdownStyles}>{message.text}</Markdown>
      )}
    </View>
  );
}

const markdownStyles = {
  body: { fontSize: 15, lineHeight: 20, color: '#000' },
  paragraph: { marginTop: 0, marginBottom: 4 },
  bullet_list: { marginTop: 0, marginBottom: 4 },
  ordered_list: { marginTop: 0, marginBottom: 4 },
  list_item: { marginBottom: 2 },
  strong: { fontWeight: '700' as const },
  code_inline: { backgroundColor: '#F2F2F7', borderRadius: 4, paddingHorizontal: 4 },
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
  },
  userContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  botContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  userText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#FFFFFF',
  },
});
