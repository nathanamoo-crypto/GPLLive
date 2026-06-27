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

export type LeagueTableParams = {
  highlightClubId?: string;
};
