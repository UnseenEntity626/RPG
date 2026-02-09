import type { GameState, QuestDefinition, QuestRuntimeState } from '../domain/types';

export class QuestSystem {
  private definitionMap: Map<string, QuestDefinition>;

  constructor(definitions: QuestDefinition[], private readonly gameState: GameState) {
    this.definitionMap = new Map(definitions.map((definition) => [definition.id, definition]));
  }

  getQuestState(questId: string): QuestRuntimeState {
    return this.gameState.quests[questId] ?? { status: 'not_started' };
  }

  startQuest(questId: string): boolean {
    const definition = this.definitionMap.get(questId);
    if (!definition || definition.steps.length === 0) {
      return false;
    }

    const state = this.getQuestState(questId);
    if (state.status !== 'not_started') {
      return false;
    }

    this.gameState.quests[questId] = {
      status: 'in_progress',
      stepId: definition.steps[0].id
    };

    return true;
  }

  advanceQuest(questId: string, trigger: string): boolean {
    const definition = this.definitionMap.get(questId);
    if (!definition) {
      return false;
    }

    const runtime = this.gameState.quests[questId];
    if (!runtime || runtime.status !== 'in_progress' || !runtime.stepId) {
      return false;
    }

    const step = definition.steps.find((candidate) => candidate.id === runtime.stepId);
    if (!step || step.condition.trigger !== trigger) {
      return false;
    }

    if (step.nextStepId) {
      runtime.stepId = step.nextStepId;
      return true;
    }

    runtime.status = 'completed';
    delete runtime.stepId;

    for (const reward of definition.rewards ?? []) {
      if (reward.type === 'flag') {
        this.gameState.flags[reward.id] = reward.value;
      }
    }

    return true;
  }

  advanceByTrigger(trigger: string): string[] {
    const progressed: string[] = [];

    for (const [questId, runtime] of Object.entries(this.gameState.quests)) {
      if (runtime.status !== 'in_progress') {
        continue;
      }
      if (this.advanceQuest(questId, trigger)) {
        progressed.push(questId);
      }
    }

    return progressed;
  }
}
