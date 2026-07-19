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

export type NewsDetailParams = {
  articleId: string;
};

export type MotmVoteParams = {
  matchId: number;
};

export type DiscussionParams = {
  matchId: number;
};

export type LeagueTableParams = undefined;
