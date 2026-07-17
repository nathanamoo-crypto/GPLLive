export type AuthFlowParamList = {
  RegisterLogin: undefined;
  PickClub: undefined;
};

export type OnboardingStackParamList = AuthFlowParamList & {
  Slides: undefined;
};

export type AuthStackParamList = AuthFlowParamList;

export type MatchDetailsParams = {
  matchId: string;
};

export type NewsDetailParams = {
  articleId: string;
};

export type MotmVoteParams = {
  matchId: string;
};

export type DiscussionParams = {
  matchId: string;
};

export type LeagueTableParams = undefined;
