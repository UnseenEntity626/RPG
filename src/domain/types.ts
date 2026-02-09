export type Direction = 'up' | 'down' | 'left' | 'right';

export interface QuestCondition {
  trigger: string;
}

export interface Reward {
  type: 'flag';
  id: string;
  value: boolean;
}

export interface QuestStep {
  id: string;
  condition: QuestCondition;
  nextStepId?: string;
}

export interface QuestDefinition {
  id: string;
  title: string;
  steps: QuestStep[];
  rewards?: Reward[];
}

export interface DialogueOption {
  text: string;
  nextId?: string;
  close?: boolean;
}

export interface DialogueNode {
  id: string;
  text: string;
  options?: DialogueOption[];
  nextId?: string;
  close?: boolean;
}

export interface DialogueBranch {
  condition: DialogueCondition;
  startNodeId: string;
}

export interface DialogueCondition {
  questId?: string;
  questStatus?: QuestRuntimeStatus;
  questStepId?: string;
  flagId?: string;
  flagValue?: boolean;
}

export interface DialogueDefinition {
  id: string;
  branches: DialogueBranch[];
  nodes: DialogueNode[];
}

export type QuestRuntimeStatus = 'not_started' | 'in_progress' | 'completed';

export interface QuestRuntimeState {
  status: QuestRuntimeStatus;
  stepId?: string;
}

export interface SaveData {
  version: number;
  player: {
    mapId: string;
    x: number;
    y: number;
    direction: Direction;
  };
  quests: Record<string, QuestRuntimeState>;
  flags: Record<string, boolean>;
  timestamp: number;
}

export interface MapEvent {
  id: string;
  type: 'npc' | 'trigger';
  x: number;
  y: number;
  interaction: {
    dialogueId?: string;
    trigger?: string;
    questAction?: {
      action: 'start' | 'advance';
      questId: string;
      trigger?: string;
    };
  };
}

export interface GameState {
  player: SaveData['player'];
  quests: Record<string, QuestRuntimeState>;
  flags: Record<string, boolean>;
}
