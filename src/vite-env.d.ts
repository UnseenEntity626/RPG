/// <reference types="vite/client" />

declare global {
  interface Window {
    __RPG_DEBUG__?: {
      ready: boolean;
      scene: string;
      pos?: { x: number; y: number };
      quest?: unknown;
    };
  }
}

export {};
