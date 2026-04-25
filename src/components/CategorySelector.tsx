import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Category } from "@/game/wordCategories";
import { cn } from "@/lib/utils";

type Props = {
  categories: Category[];
  selectedIds: string[];
  onToggle: (c: Category) => void;
};

export function CategorySelector({ categories, selectedIds, onToggle }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {categories.map((c) => {
        const active = selectedIds.includes(c.id);
        return (
          <motion.button
            key={c.id}
            type="button"
            onClick={() => onToggle(c)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "relative rounded-2xl p-5 text-left border-2 transition-colors",
              "bg-card text-card-foreground",
              active
                ? "border-primary shadow-lg shadow-primary/20"
                : "border-border hover:border-primary/50",
            )}
          >
            {active && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
            )}
            <div className="text-4xl mb-2">{c.emoji}</div>
            <div className="font-semibold leading-tight">{c.name}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {c.words.length} words
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
