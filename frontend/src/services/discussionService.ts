import api from './api';
import { DISCUSSION_URL, DiscussionEndpoints } from '../constants/apiUrls';

export interface DiscussionMessage {
  id: number;
  fixtureId: number;
  userId: number;
  username: string;
  message: string;
  createdAt: string;
  // Drives the crown badge next to the username in the discussion list -
  // resolved server-side per message via SubscriptionService.isPremium, so
  // this reflects the poster's premium status, not the viewer's.
  userPremium: boolean;
}

function mapDiscussion(raw: any): DiscussionMessage {
  return {
    id: raw.id,
    fixtureId: raw.fixtureId ?? raw.fixture_id,
    userId: raw.userId ?? raw.user_id,
    username: raw.username,
    message: raw.message,
    createdAt: raw.createdAt ?? raw.created_at,
    userPremium: !!raw.userPremium,
  };
}

export interface DiscussionStatus {
  fixtureId: number;
  open: boolean;
  // ISO string - only present when `open` is false because the window
  // hasn't started yet (null once open, or when closed post-match).
  opensAt: string | null;
  reason: string | null;
}

function mapDiscussionStatus(raw: any): DiscussionStatus {
  return {
    fixtureId: raw.fixtureId ?? raw.fixture_id,
    open: !!raw.open,
    opensAt: raw.opensAt ?? raw.opens_at ?? null,
    reason: raw.reason ?? null,
  };
}

// Lets the screen decide upfront whether to show the composer, the
// "opens at X" notice, or the "closed - full time" banner, instead of only
// finding out a post is rejected after the user's typed a message.
export async function getDiscussionStatus(
  fixtureId: number,
  signal?: AbortSignal,
): Promise<DiscussionStatus> {
  const { data } = await api.get<any>(
    `${DiscussionEndpoints.MESSAGES}/fixture/${fixtureId}/status`,
    { baseURL: DISCUSSION_URL, signal },
  );
  return mapDiscussionStatus(data);
}

// DiscussionController's GET/POST responses are plain array/object - they
// were never wrapped in {messages: [...]} / {message: {...}} envelopes like
// this used to assume, which meant loading a discussion always came back
// empty (data.messages was undefined) and sending one crashed the list
// (undefined pushed into the message array).
export async function getDiscussionMessages(
  fixtureId: number,
  signal?: AbortSignal,
): Promise<DiscussionMessage[]> {
  const { data } = await api.get<any[]>(
    `${DiscussionEndpoints.MESSAGES}/fixture/${fixtureId}`,
    { baseURL: DISCUSSION_URL, signal },
  );
  return (data ?? []).map(mapDiscussion);
}

export async function sendDiscussionMessage(
  fixtureId: number,
  message: string,
): Promise<DiscussionMessage> {
  const { data } = await api.post<any>(
    DiscussionEndpoints.MESSAGES,
    { fixtureId, message },
    { baseURL: DISCUSSION_URL },
  );
  return mapDiscussion(data);
}
