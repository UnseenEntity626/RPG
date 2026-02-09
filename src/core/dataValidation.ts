import type { DialogueDefinition, QuestDefinition } from '../domain/types';

function hasString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function validateQuestData(quests: QuestDefinition[]): string[] {
  const errors: string[] = [];

  for (const quest of quests) {
    if (!hasString(quest.id)) {
      errors.push('Quest id is missing');
    }
    if (!hasString(quest.title)) {
      errors.push(`Quest ${quest.id} has no title`);
    }
    if (!Array.isArray(quest.steps) || quest.steps.length === 0) {
      errors.push(`Quest ${quest.id} has no steps`);
      continue;
    }

    const stepIds = new Set<string>();
    for (const step of quest.steps) {
      if (!hasString(step.id)) {
        errors.push(`Quest ${quest.id} has a step without id`);
      }
      if (stepIds.has(step.id)) {
        errors.push(`Quest ${quest.id} has duplicated step id ${step.id}`);
      }
      stepIds.add(step.id);
      if (!hasString(step.condition?.trigger)) {
        errors.push(`Quest ${quest.id} step ${step.id} has invalid trigger`);
      }
    }
  }

  return errors;
}

export function validateDialogueData(dialogues: DialogueDefinition[]): string[] {
  const errors: string[] = [];

  for (const dialogue of dialogues) {
    if (!hasString(dialogue.id)) {
      errors.push('Dialogue id is missing');
      continue;
    }

    if (!Array.isArray(dialogue.nodes) || dialogue.nodes.length === 0) {
      errors.push(`Dialogue ${dialogue.id} has no nodes`);
      continue;
    }

    const nodeIds = new Set(dialogue.nodes.map((node) => node.id));
    for (const branch of dialogue.branches) {
      if (!nodeIds.has(branch.startNodeId)) {
        errors.push(`Dialogue ${dialogue.id} has unknown branch start ${branch.startNodeId}`);
      }
    }

    for (const node of dialogue.nodes) {
      if (node.nextId && !nodeIds.has(node.nextId)) {
        errors.push(`Dialogue ${dialogue.id} node ${node.id} has unknown nextId ${node.nextId}`);
      }
      if (node.options) {
        for (const option of node.options) {
          if (option.nextId && !nodeIds.has(option.nextId)) {
            errors.push(
              `Dialogue ${dialogue.id} node ${node.id} has option with unknown nextId ${option.nextId}`
            );
          }
        }
      }
    }
  }

  return errors;
}
