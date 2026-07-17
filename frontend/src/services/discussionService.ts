import api from './api';
import { DISCUSSION_URL } from '../constants/apiUrls';

export const DiscussionEndpoints = {
  LIST_MESSAGES: '/discussions/:fixtureId',
  SEND_MESSAGE: '/discussions/:fixtureId',
};

// ─────────────────────────────────────────────────────────────────────────────
// ASSUMED RESPONSE SHAPES — flag if backend contract differs.
// The backend discussion-service has not been confirmed end-to-end; these
// types are inferred from the apiUrls.ts comments and typical REST conventions.
// ─────────────────────────────────────────────────────────────────────────────

export interface DiscussionMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  createdAt: string;
}

export interface DiscussionListResponse {
  messages: DiscussionMessage[];
}

export interface DiscussionSendResponse {
  message: DiscussionMessage;
}

function resolvePath(template: string, fixtureId: string): string {
  return template.replace(':fixtureId', fixtureId);
}

export async function getDiscussionMessages(
  fixtureId: string,
  signal?: AbortSignal,
): Promise<DiscussionListResponse> {
  const { data } = await api.get<DiscussionListResponse>(
    resolvePath(DiscussionEndpoints.LIST_MESSAGES, fixtureId),
    { baseURL: DISCUSSION_URL, signal },
  );
  return data;
}

export async function sendDiscussionMessage(
  fixtureId: string,
  message: string,
): Promise<DiscussionSendResponse> {
  const { data } = await api.post<DiscussionSendResponse>(
    resolvePath(DiscussionEndpoints.SEND_MESSAGE, fixtureId),
    { message },
    { baseURL: DISCUSSION_URL },
  );
  return data;
}
