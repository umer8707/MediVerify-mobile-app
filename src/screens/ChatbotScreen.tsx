import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ChatMessage from '../components/ChatMessage';
import { ChatMessage as ChatMessageType } from '../types';

const predefinedResponses: { [key: string]: string } = {
  'how does qr verification work': 
    'QR verification uses blockchain technology to check if a medicine\'s QR code matches records stored securely. When you scan, the app verifies the batch ID against the blockchain database to confirm authenticity.',
  'what does counterfeit alert mean': 
    'A counterfeit alert means the QR code you scanned doesn\'t match any legitimate product in our blockchain records. This could indicate a fake medicine. Please do not use it and contact the pharmacy or manufacturer immediately.',
  'is my medicine safe to use': 
    'If you received a "Genuine Product" status, your medicine is verified and safe. If you see a "Counterfeit Alert" or "Duplicate QR Detected", please do not use the medicine and seek professional advice.',
  'default': 
    'I\'m here to help you understand medicine verification. You can ask me about:\n\n• How QR verification works\n• What counterfeit alerts mean\n• Medicine safety\n• Product traceability\n\nFeel free to ask any questions!',
};

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      text: 'Hello! I\'m your verification assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const getResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [key, response] of Object.entries(predefinedResponses)) {
      if (key !== 'default' && lowerMessage.includes(key)) {
        return response;
      }
    }
    
    return predefinedResponses['default'];
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');

    // Simulate AI response delay
    setTimeout(() => {
      const botResponse: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        text: getResponse(currentInput),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 500);
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
    handleSend();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </ScrollView>

      <View style={styles.quickQuestions}>
        <Text style={styles.quickQuestionsTitle}>Quick Questions:</Text>
        <View style={styles.quickQuestionsRow}>
          <TouchableOpacity
            style={[styles.quickQuestionButton, styles.quickQuestionButtonFirst]}
            onPress={() => handleQuickQuestion('How does QR verification work?')}
          >
            <Text style={styles.quickQuestionText}>How it works</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickQuestionButton}
            onPress={() => handleQuickQuestion('What does counterfeit alert mean?')}
          >
            <Text style={styles.quickQuestionText}>Counterfeit alert</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your question..."
          placeholderTextColor="#8E8E93"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  quickQuestions: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  quickQuestionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
  },
  quickQuestionsRow: {
    flexDirection: 'row',
  },
  quickQuestionButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  quickQuestionButtonFirst: {
    marginLeft: 0,
  },
  quickQuestionText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    color: '#000',
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
});

