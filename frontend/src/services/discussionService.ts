import api from './api';
import { DISCUSSION_URL, DiscussionEndpoints } from '../constants/apiUrls';

export interface DiscussionMessage {
  id: string;
  userId: number;
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

export async function getDiscussionMessages(
  fixtureId: number,
  signal?: AbortSignal,
): Promise<DiscussionListResponse> {
  const { data } = await api.get<DiscussionListResponse>(
    `${DiscussionEndpoints.MESSAGES}/${fixtureId}`,
    { baseURL: DISCUSSION_URL, signal },
  );
  return data;
}

export async function sendDiscussionMessage(
  fixtureId: number,
  message: string,
): Promise<DiscussionSendResponse> {
  const { data } = await api.post<DiscussionSendResponse>(
    `${DiscussionEndpoints.MESSAGES}/${fixtureId}`,
    { message },
    { baseURL: DISCUSSION_URL },
  );
  return data;
}
