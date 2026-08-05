import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepConfig = {
  step: number;
  label: string;
  activeColor: string;
};

type StepControlsProps = {
  steps: StepConfig[];
  activeStep: number;
  onStepClick: (step: number) => void;
  onReplay: () => void;
};

export function StepControls({
  steps,
  activeStep,
  onStepClick,
  onReplay,
}: StepControlsProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-2 bg-black/30 backdrop-blur-md px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/20 shadow-sm pointer-events-auto z-30 select-none animate-fade-in [@media(max-height:640px)]:scale-90 [@media(max-height:640px)]:mt-0.5">
      {steps.map((s) => (
        <button
          key={`step-btn-${s.step}`}
          type="button"
          onClick={() => onStepClick(s.step)}
          className={cn(
            "px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-colors duration-300 cursor-pointer border",
            activeStep === s.step
              ? s.activeColor
              : "bg-transparent text-white/70 border-transparent hover:text-white hover:bg-white/15"
          )}
        >
          {s.label}
        </button>
      ))}
      <div className="w-px h-3 bg-white/25 mx-0.5" />
      <button
        type="button"
        onClick={onReplay}
        title="Replay animation"
        className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-transform active:scale-95 cursor-pointer"
      >
        <RotateCcw className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
      </button>
    </div>
  );
}
