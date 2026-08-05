import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { fonts, radius, getScrollBottomPadding } from '../../constants/layout';
import SubScreenHeader from '../../components/shared/SubScreenHeader';
import PremiumBadge from '../../components/shared/PremiumBadge';
import {
  getDiscussionMessages,
  getDiscussionStatus,
  sendDiscussionMessage,
} from '../../services/discussionService';
import type { DiscussionMessage, DiscussionStatus } from '../../services/discussionService';
import { getApiErrorMessage } from '../../services/api';
import { getMatchDetails } from '../../services/matchService';
import { useTheme } from '../../context/ThemeContext';
import type { HomeStackParamList } from '../../navigation/HomeStack';

type DiscussionRouteProp = RouteProp<HomeStackParamList, 'Discussion'>;

// "today at 18:00" / "Sat 9 Aug, 18:00" depending on how far off the
// deadline is - matches how the app already phrases other deadline-relative
// times (e.g. the season kickoff message on Home).
function formatOpensAt(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  if (sameDay) return `today at ${timeStr}`;
  const dateStr = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  return `${dateStr}, ${timeStr}`;
}

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DiscussionScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const route = useRoute<DiscussionRouteProp>();
  const { matchId } = route.params;

  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Discussion opens once the gameweek deadline passes (squads are locked
  // in) and closes once the match itself is over - mirrors how Transfers
  // locks at the same deadline. Past messages stay visible either way.
  // Defaults to open so the composer doesn't flash closed while the status
  // call is in flight.
  const [status, setStatus] = useState<DiscussionStatus | null>(null);

  const loadMessages = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const [data, , discussionStatus] = await Promise.all([
        getDiscussionMessages(matchId, signal),
        getMatchDetails(matchId, signal),
        getDiscussionStatus(matchId, signal).catch(() => null),
      ]);
      if (signal?.aborted) return;
      setMessages(data);
      setStatus(discussionStatus);
    } catch (err) {
      if (signal?.aborted) return;
      setError(getApiErrorMessage(err, 'Failed to load discussion. Check your connection and try again.'));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    const controller = new AbortController();
    loadMessages(controller.signal);
    return () => controller.abort();
  }, [loadMessages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    setSubmitting(true);
    try {
      const sent = await sendDiscussionMessage(matchId, text);
      setMessages((prev) => [...prev, sent]);
      setInputText('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to send message. Please try again.'));
      // The backend enforces the same open/close window this screen shows -
      // if a post got rejected, our cached status is stale (e.g. the window
      // just closed), so re-check it to swap the composer for the banner.
      getDiscussionStatus(matchId).then(setStatus).catch(() => {});
    } finally {
      setSubmitting(false);
    }
  };

  const renderMessage = ({ item }: { item: DiscussionMessage }) => (
    <View style={styles.messageRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.username.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.username}>{item.username}</Text>
          {item.userPremium && <PremiumBadge variant="compact" />}
          <Text style={styles.timestamp}>{relativeTime(item.createdAt)}</Text>
        </View>
        <Text style={styles.messageText}>{item.message}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        <SubScreenHeader title="Discussion" />

        {loading && (
          <View style={styles.centeredMessage}>
            <ActivityIndicator size="large" color={colors.yellow} />
            <Text style={styles.loadingText}>Loading discussion...</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.centeredMessage}>
            <Ionicons name="cloud-offline-outline" size={48} color={colors.grey2} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadMessages()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && (
          <>
            <FlatList
              data={messages}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderMessage}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: getScrollBottomPadding(insets.bottom) },
              ]}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="chatbubbles-outline" size={48} color={colors.grey2} />
                  <Text style={styles.emptyText}>
                    No messages yet. Start the conversation!
                  </Text>
                </View>
              }
            />

            {status && !status.open ? (
              <View style={[styles.closedBanner, { paddingBottom: insets.bottom + 12 }]}>
                <Ionicons name={status.opensAt ? 'time-outline' : 'lock-closed-outline'} size={16} color={colors.grey2} />
                <Text style={styles.closedText}>
                  {status.opensAt
                    ? `Discussion opens ${formatOpensAt(status.opensAt)}`
                    : status.reason ?? 'This discussion is closed.'}
                </Text>
              </View>
            ) : (
              <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type a message..."
                  placeholderTextColor={colors.grey2}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[styles.sendButton, (!inputText.trim() || submitting) && styles.sendButtonDisabled]}
                  onPress={handleSend}
                  disabled={!inputText.trim() || submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={colors.black} />
                  ) : (
                    <Ionicons name="send" size={18} color={colors.black} />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.black },

    centeredMessage: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    loadingText: { fontSize: 14, color: colors.grey1, marginTop: 12 },
    errorText: { fontSize: 14, color: colors.grey1, marginTop: 12, textAlign: 'center' },
    retryButton: { marginTop: 16, backgroundColor: colors.yellow, paddingVertical: 12, paddingHorizontal: 28, borderRadius: radius.button },
    retryButtonText: { fontSize: 14, fontWeight: '800', color: colors.black, fontFamily: fonts.display, textTransform: 'uppercase' },

    listContent: { padding: 16 },

    emptyContainer: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 14, color: colors.grey2, marginTop: 12, textAlign: 'center' },

    messageRow: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surface2,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    avatarText: {
      fontSize: 14,
      fontWeight: '800',
      fontFamily: fonts.display,
      color: colors.yellow,
    },
    messageContent: { flex: 1 },
    messageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    username: {
      fontSize: 13,
      fontWeight: '700',
      fontFamily: fonts.bodySemiBold,
      color: colors.white,
    },
    timestamp: {
      fontSize: 11,
      color: colors.grey2,
      marginLeft: 8,
    },
    messageText: {
      fontSize: 14,
      color: colors.grey1,
      lineHeight: 20,
    },

    closedBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    closedText: { fontSize: 13, color: colors.grey2, fontWeight: '600' },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    textInput: {
      flex: 1,
      backgroundColor: colors.surface2,
      borderRadius: radius.card,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.white,
      maxHeight: 100,
      marginRight: 10,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.yellow,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.4,
    },
  });
}
