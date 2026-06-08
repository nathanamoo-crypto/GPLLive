export type AuthFlowParamList = {
  RegisterLogin: undefined;
  PickClub: undefined;
};

export type OnboardingStackParamList = AuthFlowParamList & {
  Slides: undefined;
};

export type AuthStackParamList = AuthFlowParamList;
