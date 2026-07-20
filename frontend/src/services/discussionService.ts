import api from './api';
import { DISCUSSION_URL, DiscussionEndpoints } from '../constants/apiUrls';

export interface DiscussionMessage {
  id: number;
  fixtureId: number;
  userId: number;
  username: string;
  message: string;
  createdAt: string;
}

function mapDiscussion(raw: any): DiscussionMessage {
  return {
    id: raw.id,
    fixtureId: raw.fixtureId ?? raw.fixture_id,
    userId: raw.userId ?? raw.user_id,
    username: raw.username,
    message: raw.message,
    createdAt: raw.createdAt ?? raw.created_at,
  };
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
