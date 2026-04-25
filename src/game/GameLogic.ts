import type { Category } from "./wordCategories";

export type Role = "citizen" | "imposter";

export type PlayerAssignment = {
  index: number;
  name: string;
  role: Role;
  reveal: string; // word for citizens, hint for imposter
};

export type GameSetup = {
  players: PlayerAssignment[];
  secretWord: string;
  category: Category;
  imposterIndex: number;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type ImposterClue = "hint" | "category" | "none";

export function createGame(
  playerNames: string[],
  categories: Category[],
  imposterClue: ImposterClue = "hint",
): GameSetup {
  if (playerNames.length < 3) {
    throw new Error("At least 3 players required");
  }
  if (categories.length === 0) {
    throw new Error("Pick at least one category");
  }
  const pool = categories.flatMap((c) =>
    c.words.map((w) => ({ word: w.word, hint: w.hint, cat: c })),
  );
  const picked = pool[Math.floor(Math.random() * pool.length)];
  const order = shuffle(playerNames.map((_, i) => i));
  const imposterIndex = order[0];

  const imposterReveal =
    imposterClue === "hint"
      ? `Hint: ${picked.hint}`
      : imposterClue === "category"
        ? `Category: ${picked.cat.emoji} ${picked.cat.name}`
        : "🤐 No clue — you're on your own!";

  const players: PlayerAssignment[] = playerNames.map((name, i) => ({
    index: i,
    name,
    role: i === imposterIndex ? "imposter" : "citizen",
    reveal: i === imposterIndex ? imposterReveal : picked.word,
  }));

  return {
    players,
    secretWord: picked.word,
    category: picked.cat,
    imposterIndex,
  };
}
