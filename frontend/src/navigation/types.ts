export type AuthFlowParamList = {
  RegisterLogin: undefined;
  PickClub: undefined;
};

export type OnboardingStackParamList = AuthFlowParamList & {
  Slides: undefined;
};

export type AuthStackParamList = AuthFlowParamList;

export type MatchDetailsParams = {
  matchId: number;
};

import type { Article } from '../types';

// RSS articles have no backend "get by id" endpoint (the feed is refetched
// live each time, so an id from one fetch isn't reliably resolvable later)
// - the full article is already in memory wherever a card is tapped, so
// it's passed straight through instead of being re-fetched by id.
export type NewsDetailParams = {
  article: Article;
};

export type MotmVoteParams = {
  matchId: number;
};

export type DiscussionParams = {
  matchId: number;
};

export type LeagueTableParams = undefined;
