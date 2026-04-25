import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ShieldAlert, ShieldCheck } from "lucide-react";
import type { PlayerAssignment } from "@/game/GameLogic";
import { Button } from "@/components/ui/button";

type Props = {
  player: PlayerAssignment;
  onDone: () => void;
  isLast: boolean;
};

export function PlayerCard({ player, onDone, isLast }: Props) {
  const [revealed, setRevealed] = useState(false);
  const isImposter = player.role === "imposter";

  return (
    <div className="w-full max-w-md mx-auto [perspective:1200px]">
      <motion.div
        className="relative w-full aspect-[3/4] [transform-style:preserve-3d]"
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* FRONT */}
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="absolute inset-0 [backface-visibility:hidden] rounded-3xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex flex-col items-center justify-center gap-4 p-6 shadow-xl"
        >
          <EyeOff className="w-14 h-14 opacity-90" />
          <div className="text-center">
            <div className="text-sm uppercase tracking-widest opacity-80">
              Pass to
            </div>
            <div className="text-3xl font-bold mt-1">{player.name}</div>
          </div>
          <div className="mt-4 text-xs uppercase tracking-widest opacity-90 border border-primary-foreground/40 rounded-full px-4 py-2">
            Tap to reveal
          </div>
        </button>

        {/* BACK */}
        <div
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-3xl bg-card border-2 border-border flex flex-col items-center justify-center gap-5 p-6 shadow-xl"
        >
          <AnimatePresence>
            {revealed && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center gap-4 text-center"
              >
                {isImposter ? (
                  <>
                    <ShieldAlert className="w-12 h-12 text-destructive" />
                    <div className="text-sm uppercase tracking-widest text-destructive font-semibold">
                      You are the Imposter
                    </div>
                    <div className="text-2xl font-bold text-foreground px-4">
                      {player.reveal}
                    </div>
                    <div className="text-xs text-muted-foreground max-w-xs">
                      Bluff your way through. Don't get caught!
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-12 h-12 text-primary" />
                    <div className="text-sm uppercase tracking-widest text-primary font-semibold">
                      Secret Word
                    </div>
                    <div className="text-3xl font-bold text-foreground px-4 break-words">
                      {player.reveal}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Describe it without saying it.
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {revealed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 flex justify-center"
        >
          <Button
            size="lg"
            onClick={() => {
              setRevealed(false);
              setTimeout(onDone, 400);
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            {isLast ? "Start Game" : "Hide & Pass Device"}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
