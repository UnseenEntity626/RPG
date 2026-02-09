declare const process: {
  env: Record<string, string | undefined>;
};

declare module 'node:fs' {
  export function existsSync(path: string): boolean;
}
