import type {
  DialogueCondition,
  DialogueDefinition,
  DialogueNode,
  GameState,
  QuestRuntimeState
} from '../domain/types';

export interface ActiveDialogue {
  definition: DialogueDefinition;
  node: DialogueNode;
}

function getQuestState(state: GameState, questId: string): QuestRuntimeState {
  return state.quests[questId] ?? { status: 'not_started' };
}

export function evaluateDialogueCondition(condition: DialogueCondition, state: GameState): boolean {
  if (condition.questId) {
    const questState = getQuestState(state, condition.questId);
    if (condition.questStatus && questState.status !== condition.questStatus) {
      return false;
    }
    if (condition.questStepId && questState.stepId !== condition.questStepId) {
      return false;
    }
  }

  if (condition.flagId) {
    const actual = state.flags[condition.flagId] ?? false;
    if (actual !== (condition.flagValue ?? true)) {
      return false;
    }
  }

  return true;
}

export class DialogueSystem {
  private definitions: Map<string, DialogueDefinition>;

  constructor(definitions: DialogueDefinition[], private readonly getState: () => GameState) {
    this.definitions = new Map(definitions.map((definition) => [definition.id, definition]));
  }

  start(dialogueId: string): ActiveDialogue | null {
    const definition = this.definitions.get(dialogueId);
    if (!definition) {
      return null;
    }

    const state = this.getState();
    const branch = definition.branches.find((candidate) =>
      evaluateDialogueCondition(candidate.condition, state)
    );

    if (!branch) {
      return null;
    }

    const node = definition.nodes.find((candidate) => candidate.id === branch.startNodeId);
    if (!node) {
      return null;
    }

    return { definition, node };
  }

  next(definitionId: string, currentNodeId: string, optionIndex?: number): DialogueNode | null {
    const definition = this.definitions.get(definitionId);
    if (!definition) {
      return null;
    }

    const currentNode = definition.nodes.find((candidate) => candidate.id === currentNodeId);
    if (!currentNode) {
      return null;
    }

    if (typeof optionIndex === 'number' && currentNode.options && currentNode.options[optionIndex]) {
      const option = currentNode.options[optionIndex];
      if (option.nextId) {
        return definition.nodes.find((candidate) => candidate.id === option.nextId) ?? null;
      }
      return null;
    }

    if (currentNode.nextId) {
      return definition.nodes.find((candidate) => candidate.id === currentNode.nextId) ?? null;
    }

    return null;
  }
}
