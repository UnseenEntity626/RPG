import type {
  DialogueDefinition,
  Direction,
  GameState,
  QuestDefinition,
  SaveData
} from '../domain/types';
import { DEFAULT_MAP_ID, SAVE_VERSION } from './constants';
import { DialogueSystem } from '../systems/dialogueSystem';
import { QuestSystem } from '../systems/questSystem';
import { SaveSystem } from '../systems/saveSystem';

export class GameContext {
  private state: GameState;
  readonly questSystem: QuestSystem;
  readonly dialogueSystem: DialogueSystem;
  readonly saveSystem: SaveSystem;
  private mapId: string;

  constructor(questDefinitions: QuestDefinition[], dialogueDefinitions: DialogueDefinition[]) {
    this.state = {
      player: {
        mapId: DEFAULT_MAP_ID,
        x: 2,
        y: 2,
        direction: 'down'
      },
      quests: {},
      flags: {}
    };

    this.mapId = DEFAULT_MAP_ID;
    this.questSystem = new QuestSystem(questDefinitions, this.state);
    this.dialogueSystem = new DialogueSystem(dialogueDefinitions, () => this.state);
    this.saveSystem = new SaveSystem();
  }

  getState(): GameState {
    return this.state;
  }

  getMapId(): string {
    return this.mapId;
  }

  startNewGame(spawn: { x: number; y: number }): void {
    this.state.player = {
      mapId: DEFAULT_MAP_ID,
      x: spawn.x,
      y: spawn.y,
      direction: 'down'
    };
    this.state.quests = {};
    this.state.flags = {};
  }

  setPlayerTile(x: number, y: number, direction: Direction): void {
    this.state.player.x = x;
    this.state.player.y = y;
    this.state.player.direction = direction;
  }

  setCurrentMap(mapId: string): void {
    this.mapId = mapId;
    this.state.player.mapId = mapId;
  }

  buildSaveData(): SaveData {
    return {
      version: SAVE_VERSION,
      player: {
        ...this.state.player
      },
      quests: JSON.parse(JSON.stringify(this.state.quests)) as SaveData['quests'],
      flags: { ...this.state.flags },
      timestamp: Date.now()
    };
  }

  applySaveData(saveData: SaveData): void {
    this.mapId = saveData.player.mapId;
    this.state.player = { ...saveData.player };
    this.state.quests = JSON.parse(JSON.stringify(saveData.quests)) as GameState['quests'];
    this.state.flags = { ...saveData.flags };
  }
}
