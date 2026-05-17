import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatMessage from '../components/ChatMessage';
import { ChatMessage as ChatMessageType } from '../types';
import { authFetch } from '../api/apiHelper';

type HistoryEntry = { role: 'user' | 'assistant'; content: string };

const CHAT_MESSAGES_KEY = 'chat_messages';
const CHAT_HISTORY_KEY = 'chat_history';

const INITIAL_MESSAGE: ChatMessageType = {
  id: '1',
  text: "Hello! I'm your MediVerify assistant. Ask me about medicines, QR verification, dosage, drug interactions, or anything related to pharmaceutical safety.",
  isUser: false,
  timestamp: new Date(),
};

const QUICK_QUESTIONS_MAP: Record<string, { label: string; question: string }[]> = {
  PHARMACY: [
    { label: 'Recalled stock', question: 'Do I have any recalled batches in my stock?' },
    { label: 'Scan a QR', question: 'What happens when I scan a medicine QR code?' },
    { label: 'Drug interactions', question: 'Can you explain common drug interactions?' },
    { label: 'Expiring soon', question: 'How should I handle medicines expiring soon?' },
  ],
  DISTRIBUTOR: [
    { label: 'Dispatch flow', question: 'How does the dispatch process work?' },
    { label: 'Recall process', question: 'What do I do if one of my batches is recalled?' },
    { label: 'Storage tips', question: 'What are the best storage conditions for medicines?' },
    { label: 'Supply chain', question: 'Explain the MediVerify supply chain.' },
  ],
  MANUFACTURER: [
    { label: 'QR generation', question: 'How are QR codes generated for batches?' },
    { label: 'Recall a batch', question: 'How do I initiate a batch recall?' },
    { label: 'Batch tracking', question: 'How can I track where my batches have gone?' },
    { label: 'Supply chain', question: 'Explain the MediVerify supply chain.' },
  ],
  default: [
    { label: 'How it works', question: 'How does QR verification work?' },
    { label: 'Counterfeit alert', question: 'What does a counterfeit alert mean?' },
    { label: 'Recalled batch', question: 'What should I do if a batch is recalled?' },
    { label: 'Drug interactions', question: 'Can you explain common drug interactions?' },
  ],
};

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<ChatMessageType[]>([INITIAL_MESSAGE]);
  const [conversationHistory, setConversationHistory] = useState<HistoryEntry[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userRole, setUserRole] = useState<string>('default');
  const scrollViewRef = useRef<ScrollView>(null);
  const loaded = useRef(false);

  // Load chat + role on every focus. Cleanup sets loaded=false on blur so that
  // background re-renders of this screen can't write stale in-memory messages
  // back into AsyncStorage after logout cleared it.
  useFocusEffect(
    useCallback(() => {
      loaded.current = false;
      AsyncStorage.multiGet(['user_role', CHAT_MESSAGES_KEY, CHAT_HISTORY_KEY]).then(pairs => {
        setUserRole(pairs[0][1] ?? 'default');
        const savedMessages = pairs[1][1];
        const savedHistory = pairs[2][1];
        setMessages(
          savedMessages
            ? JSON.parse(savedMessages).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
            : [INITIAL_MESSAGE]
        );
        setConversationHistory(savedHistory ? JSON.parse(savedHistory) : []);
        loaded.current = true;
      });
      return () => {
        loaded.current = false;
      };
    }, [])
  );

  // Persist messages — guard with loaded ref so we don't overwrite before the load completes
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);

  // Persist conversation history
  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(conversationHistory));
  }, [conversationHistory]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const userText = (text ?? inputText).trim();
    if (!userText || isTyping) return;

    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      text: userText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await authFetch('/chatbot', {
        method: 'POST',
        body: JSON.stringify({ message: userText, history: conversationHistory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || `Server error ${res.status}: ${JSON.stringify(data)}`);

      const reply: string = data.reply;
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userText },
        { role: 'assistant', content: reply },
      ]);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: reply,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: error?.message || 'Sorry, could not connect. Please try again.',
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickQuestions = QUICK_QUESTIONS_MAP[userRole] ?? QUICK_QUESTIONS_MAP.default;

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
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isTyping && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>Assistant is typing...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.quickQuestions}>
        <Text style={styles.quickQuestionsTitle}>Quick Questions:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickQuestionsRow}>
          {quickQuestions.map((q, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.quickQuestionButton, i === 0 && styles.quickQuestionButtonFirst]}
              onPress={() => handleSend(q.question)}
            >
              <Text style={styles.quickQuestionText}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
          style={[styles.sendButton, (!inputText.trim() || isTyping) && styles.sendButtonDisabled]}
          onPress={() => handleSend()}
          disabled={!inputText.trim() || isTyping}
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
  typingIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  typingText: {
    fontSize: 13,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  quickQuestions: {
    padding: 16,
    paddingBottom: 8,
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
    gap: 8,
  },
  quickQuestionButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
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
