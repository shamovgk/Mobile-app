export interface UserProfile {
  totalXp: number;
  level: number;
  streak: number;
  lastPlayedAt: string | null;
  wordsLearned?: number;
  levelsCompleted?: number;
}

export interface User {
  id: string;
  displayName: string;
  avatar: string | null;
  isGuest: boolean;
  email: string | null;
  profile?: UserProfile;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface AuthActions {
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;
