import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Play, RotateCcw, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CategorySelector } from "@/components/CategorySelector";
import { PlayerCard } from "@/components/PlayerCard";
import { wordCategories, type Category } from "@/game/wordCategories";
import { createGame, type GameSetup, type ImposterClue } from "@/game/GameLogic";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Imposter — Malayalam Party Game" },
      {
        name: "description",
        content:
          "Local multiplayer Imposter party game with Malayalam movies, places and food.",
      },
    ],
  }),
});

type Phase = "setup" | "reveal" | "play" | "result";

function Index() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [players, setPlayers] = useState<string[]>(["Player 1", "Player 2", "Player 3"]);
  const [selectedCats, setSelectedCats] = useState<Category[]>([wordCategories[0]]);
  const [game, setGame] = useState<GameSetup | null>(null);
  const [revealIdx, setRevealIdx] = useState(0);
  const [imposterClue, setImposterClue] = useState<ImposterClue>("hint");

  function addPlayer() {
    setPlayers((p) => [...p, `Player ${p.length + 1}`]);
  }
  function removePlayer(i: number) {
    setPlayers((p) => (p.length > 3 ? p.filter((_, idx) => idx !== i) : p));
  }
  function updatePlayer(i: number, name: string) {
    setPlayers((p) => p.map((n, idx) => (idx === i ? name : n)));
  }
  function toggleCategory(c: Category) {
    setSelectedCats((cur) =>
      cur.find((x) => x.id === c.id)
        ? cur.filter((x) => x.id !== c.id)
        : [...cur, c],
    );
  }

  function startGame() {
    if (selectedCats.length === 0) return;
    const cleaned = players.map((n, i) => n.trim() || `Player ${i + 1}`);
    const g = createGame(cleaned, selectedCats, imposterClue);
    setGame(g);
    setRevealIdx(0);
    setPhase("reveal");
  }

  function reset() {
    setGame(null);
    setRevealIdx(0);
    setPhase("setup");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <Header />

        <AnimatePresence mode="wait">
          {phase === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-8 mt-8"
            >
              <Section
                title="1. Pick categories"
                icon="🎯"
              >
                <CategorySelector
                  categories={wordCategories}
                  selectedIds={selectedCats.map((c) => c.id)}
                  onToggle={toggleCategory}
                />
                <p className="text-xs text-muted-foreground mt-3">
                  {selectedCats.length === 0
                    ? "Select at least one category"
                    : `${selectedCats.length} selected · ${selectedCats.reduce((n, c) => n + c.words.length, 0)} possible words`}
                </p>
              </Section>

              <Section title="2. Add players" icon="👥">
                <div className="space-y-2">
                  {players.map((name, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted text-muted-foreground font-semibold text-sm shrink-0">
                        {i + 1}
                      </div>
                      <Input
                        value={name}
                        onChange={(e) => updatePlayer(i, e.target.value)}
                        placeholder={`Player ${i + 1}`}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePlayer(i)}
                        disabled={players.length <= 3}
                        aria-label="Remove player"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addPlayer} className="w-full mt-2">
                    <Plus className="w-4 h-4 mr-2" /> Add Player
                  </Button>
                </div>
              </Section>

              <Section title="3. Imposter clue" icon="🤫">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { id: "hint", label: "Word Hint", desc: "Vague related word" },
                      { id: "category", label: "Category", desc: "Just the topic" },
                      { id: "none", label: "Nothing", desc: "Hard mode" },
                    ] as { id: ImposterClue; label: string; desc: string }[]
                  ).map((opt) => {
                    const active = imposterClue === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setImposterClue(opt.id)}
                        className={`rounded-xl border-2 p-3 text-left transition-colors ${
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="font-semibold text-sm">{opt.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {opt.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Section>

              <Button
                size="lg"
                className="w-full h-14 text-base font-semibold"
                onClick={startGame}
                disabled={selectedCats.length === 0 || players.length < 3}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </Button>
            </motion.div>
          )}

          {phase === "reveal" && game && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8"
            >
              <div className="text-center mb-6">
                <div className="text-sm uppercase tracking-widest text-muted-foreground">
                  Player {revealIdx + 1} of {game.players.length}
                </div>
              </div>
              <PlayerCard
                key={revealIdx}
                player={game.players[revealIdx]}
                isLast={revealIdx === game.players.length - 1}
                onDone={() => {
                  if (revealIdx === game.players.length - 1) {
                    setPhase("play");
                  } else {
                    setRevealIdx((i) => i + 1);
                  }
                }}
              />
            </motion.div>
          )}

          {phase === "play" && game && (
            <PlayPhase game={game} onFinish={() => setPhase("result")} />
          )}

          {phase === "result" && game && (
            <ResultPhase game={game} onReset={reset} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="text-center">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl sm:text-6xl font-extrabold tracking-tight"
      >
        🕵️ <span className="bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent">Imposter</span>
      </motion.h1>
      <p className="mt-3 text-muted-foreground text-sm sm:text-base">
        One device. One imposter. Find them before they fool you all.
      </p>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <h2 className="font-semibold text-lg">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

function PlayPhase({ game, onFinish }: { game: GameSetup; onFinish: () => void }) {
  const [seconds, setSeconds] = useState(90);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds, running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <motion.div
      key="play"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mt-8 space-y-6"
    >
      <Card className="p-6 text-center">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          Discussion Time
        </div>
        <div className="text-7xl font-bold tabular-nums mt-2">
          {mm}:{ss}
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          Each player describes the word in one phrase. No saying it directly!
        </div>
        <div className="flex justify-center gap-2 mt-5">
          <Button variant="outline" onClick={() => setRunning((r) => !r)}>
            {running ? "Pause" : "Resume"}
          </Button>
          <Button variant="outline" onClick={() => setSeconds(90)}>
            <RotateCcw className="w-4 h-4 mr-2" /> Reset
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold">Speaking order</h3>
        </div>
        <ol className="space-y-2">
          {game.players.map((p, i) => (
            <li
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
            >
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                {i + 1}
              </span>
              <span className="font-medium">{p.name}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Button size="lg" className="w-full h-14" onClick={onFinish}>
        <Trophy className="w-5 h-5 mr-2" />
        Vote & Reveal Imposter
      </Button>
    </motion.div>
  );
}

function ResultPhase({ game, onReset }: { game: GameSetup; onReset: () => void }) {
  const imposter = useMemo(
    () => game.players.find((p) => p.role === "imposter")!,
    [game],
  );
  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="mt-8"
    >
      <Card className="p-8 text-center bg-gradient-to-br from-card to-muted/30">
        <div className="text-sm uppercase tracking-widest text-muted-foreground">
          The Imposter was
        </div>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="my-6"
        >
          <div className="text-6xl mb-3">🕵️</div>
          <div className="text-4xl font-extrabold text-destructive">
            {imposter.name}
          </div>
        </motion.div>
        <div className="inline-block px-5 py-3 rounded-xl bg-muted">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Secret word was
          </div>
          <div className="text-2xl font-bold mt-1">{game.secretWord}</div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-2 justify-center">
          <Button size="lg" onClick={onReset} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" /> New Game
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
