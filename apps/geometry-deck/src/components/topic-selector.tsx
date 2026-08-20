"use client";

import { TopicType, CardType } from "@/lib/types";
import { TOPIC_LABELS } from "@/lib/colors";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GraduationCap, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Topics available
const ALL_TOPICS: TopicType[] = [
  "angles",
  "triangles",
  "quadrilaterals",
  "circles",
  "polygons",
  "3d-shapes",
];

// All topics implemented
const IMPLEMENTED_TOPICS: TopicType[] = ["angles", "triangles", "quadrilaterals", "circles", "polygons", "3d-shapes"];

const CARD_TYPES: { type: CardType; label: string; available: boolean }[] = [
  { type: "term",        label: "Terms & Formulas", available: true },
  { type: "calculation", label: "Calculations",     available: true },
];

type TopicSelectorProps = {
  activeTopics: TopicType[];
  onTopicToggle: (topic: TopicType) => void;
  onTopicSelectExclusive?: (topic: TopicType) => void;
  activeCardTypes: CardType[];
  onCardTypeToggle: (type: CardType) => void;
  onStartQuiz?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TopicSelector({
  activeTopics,
  onTopicToggle,
  onTopicSelectExclusive,
  activeCardTypes,
  onCardTypeToggle,
  onStartQuiz,
  open,
  onOpenChange,
}: TopicSelectorProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          id="topic-selector-trigger"
          size="icon"
          className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs active:scale-95 transition-transform"
          aria-label="Select topics"
        >
          <GraduationCap className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="mobile-fullscreen [@media(max-width:640px)]:!z-50 [@media(max-width:640px)]:!w-screen [@media(max-width:640px)]:!h-[100dvh] [@media(max-width:640px)]:!max-w-none [@media(max-width:640px)]:!m-0 [@media(max-width:640px)]:!rounded-none [@media(max-width:640px)]:!border-none sm:w-[380px] sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:border bg-background p-0 flex flex-col"
        align="end"
        sideOffset={8}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Mobile sticky header with close button */}
        <div className="flex items-center justify-end p-4 border-b sm:hidden sticky top-0 bg-background z-10">
          <h4 className="font-medium font-headline text-lg mr-auto">
            Geometry Deck
          </h4>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Topics */}
          <div>
            <h4 className="font-medium leading-none font-headline text-lg mb-4">
              Topics
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {ALL_TOPICS.map((topic) => {
                const isActive = activeTopics.includes(topic);
                const isImplemented = IMPLEMENTED_TOPICS.includes(topic);
                const label = TOPIC_LABELS[topic];

                return (
                  <div
                    key={topic}
                    className={cn(
                      "h-12 rounded-xl flex items-center justify-between gap-2 pl-2.5 pr-2 transition-all select-none border group cursor-pointer",
                      isActive && isImplemented
                        ? "bg-primary text-primary-foreground shadow-sm border-transparent"
                        : "text-muted-foreground border-border bg-card hover:bg-accent hover:text-accent-foreground",
                      !isImplemented && "opacity-40 cursor-not-allowed"
                    )}
                    onClick={() => {
                      if (!isImplemented) return;
                      if (onTopicSelectExclusive) {
                        onTopicSelectExclusive(topic);
                      } else {
                        onTopicToggle(topic);
                      }
                    }}
                    role="button"
                    tabIndex={isImplemented ? 0 : -1}
                    aria-disabled={!isImplemented}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && isImplemented) {
                        e.preventDefault();
                        if (onTopicSelectExclusive) {
                          onTopicSelectExclusive(topic);
                        } else {
                          onTopicToggle(topic);
                        }
                      }
                    }}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 outline-none",
                        isActive && isImplemented
                          ? "bg-white text-black border-white shadow-xs"
                          : "border-muted-foreground/40 hover:border-foreground/80 bg-background/50"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isImplemented) onTopicToggle(topic);
                      }}
                      aria-label={`${isActive ? "Deselect" : "Select"} ${label}`}
                      disabled={!isImplemented}
                    >
                      {isActive && isImplemented && (
                        <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                      )}
                    </button>

                    {/* Label */}
                    <div className="flex-1 min-w-0 py-1">
                      <span className="font-headline font-bold text-xs sm:text-sm truncate block">
                        {label}
                      </span>
                    </div>

                    {/* Coming soon badge or active check */}
                    {!isImplemented && (
                      <span className="text-xs opacity-60 shrink-0">Coming soon</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card Types */}
          <div>
            <h4 className="font-medium leading-none font-headline text-lg mb-3">
              Card Types
            </h4>
            <div className="flex items-center gap-2 rounded-2xl p-1 bg-muted">
              {CARD_TYPES.map(({ type, label, available }) => {
                const isActive = activeCardTypes.includes(type);
                return (
                  <Button
                    key={type}
                    id={`card-type-${type}`}
                    type="button"
                    variant={isActive && available ? "default" : "ghost"}
                    className={cn(
                      "flex-1 rounded-xl font-headline font-bold h-10 text-xs w-full transition-all",
                      isActive && available ? "shadow-sm" : "text-muted-foreground",
                      !available && "opacity-40 cursor-not-allowed"
                    )}
                    onClick={() => available && onCardTypeToggle(type)}
                    disabled={!available}
                    aria-pressed={isActive}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Quiz Start Button */}
          {onStartQuiz && (
            <div className="pt-4 border-t">
              <Button
                variant="default"
                className="w-full h-14 rounded-2xl text-lg font-bold font-headline bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95 transition-transform"
                onClick={() => {
                  onOpenChange?.(false);
                  onStartQuiz();
                }}
              >
                Start Quiz
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
