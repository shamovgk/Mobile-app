import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  PackDetails: { packId: string };
  LevelStart: { levelId: string };
  Game: { levelId: string };
  Result: {
    levelId: string;
    score: number;
    stars: number;
    correctAnswers: number;
    wrongAnswers: number;
    duration: number;
    isWin: boolean;
  };
  Statistics: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Leaderboard: undefined;
  Dictionary: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
