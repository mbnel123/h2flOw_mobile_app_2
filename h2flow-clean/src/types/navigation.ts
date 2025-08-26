// src/types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  Info: { scrollToTimeline?: boolean; highlightPhase?: string };
};

export type TabParamList = {
  Timer: undefined;
  Water: undefined;
  Info: undefined;
  History: undefined;
  Settings: undefined;
};
