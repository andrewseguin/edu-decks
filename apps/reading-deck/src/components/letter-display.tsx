
"use client";

import { useState, useRef, useEffect } from "react";
import { Star, Volume2, Mic, Play, Trash2, StopCircle, Paintbrush } from "lucide-react"; // Import necessary icons
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { TracingCanvas } from "./tracing-canvas";
import { FlashCardShell, CardCornerButton } from "@decks/core";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Import tooltip components
import { splitIntoPhonicsSegments, getSoundKeyForSegment } from "@/lib/phonics";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { audioStorage } from "@/lib/audio-storage";
import { AudioVisualizer } from "./audio-visualizer";

import { DisplayContent } from "@/lib/types";

type LetterDisplayProps = {
  content: DisplayContent;
  enableRecordings: boolean;
  enableTracing?: boolean;
  letterCase?: "lower" | "upper" | "mixed";
  autoPlaySound?: boolean;
};

import { useAudio } from "@/components/AudioProvider";

export function LetterDisplay({ content, enableRecordings, enableTracing = true, letterCase = 'lower', autoPlaySound = false }: LetterDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTracingMode, setIsTracingMode] = useState(false);
  const audioData = useAudio();
  const audioContext = audioData?.audioContext;
  const buffers = audioData?.buffers;

  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingValueRef = useRef<string | null>(null);
  const { isRecording, stream, startRecording, stopRecording } = useAudioRecorder();

  useEffect(() => {
    setIsTracingMode(false);
  }, [content.key, enableTracing]);

  const stopPlayback = () => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.onended = null;
      currentAudioRef.current.onerror = null;
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (currentSourceRef.current) {
      currentSourceRef.current.onended = null;
      try { currentSourceRef.current.stop(); } catch (e) { }
      currentSourceRef.current.disconnect();
      currentSourceRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (currentUtteranceRef.current) {
      currentUtteranceRef.current = null;
    }
    setIsPlaying(false);
    setHighlightedIndex(null);
  };

  useEffect(() => {
    let isMounted = true;

    const update = async () => {
      // 1. Clear current state and stop playback
      setLocalAudioUrl(null);
      stopPlayback();

      // 2. If we were recording, stop and save it to the PREVIOUS card
      if (isRecording && recordingValueRef.current) {
        const targetValue = recordingValueRef.current;
        recordingValueRef.current = null; // Clear it so we don't save twice

        try {
          const blob = await stopRecording();
          if (blob && blob.size > 0) {
            await audioStorage.saveRecording(targetValue, blob);
          }
        } catch (e) {
          console.error("Error stopping recording on navigation:", e);
        }
      }

      // 3. Load the recording for the NEW card & auto-play if enabled
      if (isMounted) {
        const blob = await audioStorage.getRecording(content.value);
        let recordingUrl: string | null = null;
        if (blob) {
          recordingUrl = URL.createObjectURL(blob);
          setLocalAudioUrl(recordingUrl);
        }

        if (autoPlaySound) {
          autoPlayTimeoutRef.current = setTimeout(() => {
            if (isMounted) {
              if (content.type === "letter") {
                speakLetter(undefined, recordingUrl);
              } else {
                speakWord(undefined, recordingUrl);
              }
            }
          }, 500);
        }
      }
    };

    update();

    return () => {
      isMounted = false;
      stopPlayback();
      if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
    };
  }, [content.key, autoPlaySound]);

  const loadLocalRecording = async () => {
    const blob = await audioStorage.getRecording(content.value);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setLocalAudioUrl(url);
    } else {
      setLocalAudioUrl(null);
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      const targetValue = recordingValueRef.current;
      const blob = await stopRecording();
      recordingValueRef.current = null;

      if (blob && blob.size > 0 && targetValue) {
        await audioStorage.saveRecording(targetValue, blob);
        // Only update local URL if we're still on the same card
        if (targetValue === content.value) {
          const url = URL.createObjectURL(blob);
          if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
          setLocalAudioUrl(url);
        }
      }
    } else {
      stopPlayback();
      recordingValueRef.current = content.value;
      await startRecording();
    }
  };

  useEffect(() => {
    if (!isRecording) return;

    const handleGlobalInteraction = async (e: Event) => {
      // We catch this in the capture phase to intercept before menus or navigation triggers

      // If the click is on the recording button itself, we let it through so handleToggleRecording can handle it normally
      const target = e.target as HTMLElement;
      if (target.closest('[data-recording-button="true"]')) {
        return;
      }

      // For anything else, we stop the event immediately and stop recording
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      await handleToggleRecording();
    };

    // Use capturing phase to intercept events before they reach other handlers
    window.addEventListener("pointerdown", handleGlobalInteraction, true);
    window.addEventListener("click", handleGlobalInteraction, true);

    return () => {
      window.removeEventListener("pointerdown", handleGlobalInteraction, true);
      window.removeEventListener("click", handleGlobalInteraction, true);
    };
  }, [isRecording, handleToggleRecording]);

  const handleDeleteRecording = async () => {
    await audioStorage.deleteRecording(content.value);
    if (localAudioUrl) URL.revokeObjectURL(localAudioUrl);
    setLocalAudioUrl(null);
  };

  const playLocalRecording = async (overrideUrl?: string | null) => {
    const targetUrl = overrideUrl !== undefined ? overrideUrl : localAudioUrl;
    if (targetUrl && audioContext) {
      stopPlayback();
      setIsPlaying(true);
      try {
        const response = await fetch(targetUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        currentSourceRef.current = source;

        source.onended = () => {
          setIsPlaying(false);
          currentSourceRef.current = null;
        };
        source.start(0);
      } catch (e) {
        console.error("Error decoding local recording:", e);
        setIsPlaying(false);
      }
    }
  };

  async function speakLetter(event?: React.MouseEvent, overrideUrl?: string | null) {
    event?.stopPropagation();
    if (isRecording) {
      await handleToggleRecording();
    }
    if (isPlaying) {
      stopPlayback();
      return;
    }

    const audioUrl = overrideUrl !== undefined ? overrideUrl : localAudioUrl;

    // Try playing local recording first
    if (audioUrl && enableRecordings) {
      playLocalRecording(audioUrl);
      return;
    }

    const soundKey = getSoundKeyForSegment(content.value);

    // 1. Try AudioContext buffer first
    if (buffers && audioContext) {
      const buffer = buffers[soundKey];
      if (buffer) {
        setIsPlaying(true);
        try {
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }

          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          currentSourceRef.current = source;

          source.onended = () => {
            setIsPlaying(false);
            currentSourceRef.current = null;
          };
          source.start(0);
          return;
        } catch (e) {
          console.warn("AudioContext playback failed, trying HTML Audio fallback:", e);
        }
      }
    }

    // 2. HTML Audio fallback for letter sounds (plays .m4a / .mp3 directly)
    setIsPlaying(true);
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const soundPath = `${basePath}/sounds/optimized/alphasounds-${soundKey}.m4a`;
    const audio = new Audio(soundPath);
    currentAudioRef.current = audio;

    const playFallbackTTS = () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(content.value);
          utterance.lang = "en-US";
          utterance.rate = 0.9;
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
        } catch (_) {
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
      }
      currentAudioRef.current = null;
    };

    audio.onended = () => {
      setIsPlaying(false);
      currentAudioRef.current = null;
    };
    audio.onerror = () => {
      playFallbackTTS();
    };

    try {
      await audio.play();
    } catch (err) {
      console.warn("HTML Audio play failed:", err);
      playFallbackTTS();
    }
  }

  async function speakWord(event?: React.MouseEvent, overrideUrl?: string | null) {
    event?.stopPropagation();
    if (isRecording) {
      await handleToggleRecording();
    }
    
    // Always reset previous playback so auto-play on fast swipes never gets stuck
    stopPlayback();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const signal = abortController.signal;

    const audioUrl = overrideUrl !== undefined ? overrideUrl : localAudioUrl;

    if (audioUrl && enableRecordings) {
      playLocalRecording(audioUrl);
      return;
    }

    setIsPlaying(true);
    setHighlightedIndex(null);

    const fallbackToSpeechSynthesis = () => {
      if (signal.aborted) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(content.value);
        utterance.lang = "en-US";
        utterance.rate = 0.9;

        const voices = window.speechSynthesis.getVoices();
        const naturalVoice = voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Google") ||
              v.name.includes("Natural") ||
              v.name.includes("Samantha") ||
              v.name.includes("Siri") ||
              v.name.includes("Karen") ||
              v.name.includes("Daniel"))
        );
        if (naturalVoice) {
          utterance.voice = naturalVoice;
        }

        currentUtteranceRef.current = utterance;

        utterance.onend = () => {
          if (signal.aborted) return;
          setIsPlaying(false);
          currentUtteranceRef.current = null;
        };

        utterance.onerror = () => {
          if (signal.aborted) return;
          setIsPlaying(false);
          currentUtteranceRef.current = null;
        };

        window.speechSynthesis.speak(utterance);
      } catch (_) {
        setIsPlaying(false);
      }
    };

    // Directly play the high-clarity word MP3 voice sound
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const mp3Url = `${basePath}/sounds/words/${content.value.toLowerCase()}.mp3`;
    const audio = new Audio(mp3Url);
    currentAudioRef.current = audio;

    audio.onended = () => {
      if (signal.aborted) return;
      setIsPlaying(false);
      currentAudioRef.current = null;
    };

    audio.onerror = () => {
      currentAudioRef.current = null;
      fallbackToSpeechSynthesis();
    };

    try {
      await audio.play();
    } catch (err) {
      currentAudioRef.current = null;
      fallbackToSpeechSynthesis();
    }

    if (abortControllerRef.current === abortController) {
      abortControllerRef.current = null;
    }
  }

  if (content.type === "message") {
    return (
      <div
        key={content.key}
        className="max-w-xl font-body text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground/70 px-8 text-center select-none animate-in fade-in duration-500"
      >
        {content.value}
      </div>
    );
  }

  const isWord = content.type === "word";

  return (
    <FlashCardShell
      key={content.key}
      backgroundColor={content.color}
      className="animate-fade-in-zoom w-[90vw] max-w-[700px] h-[55vw] max-h-[min(420px,68svh)] [@media(orientation:landscape)_and_(max-height:500px)]:h-[72vh] [@media(orientation:landscape)_and_(max-height:500px)]:max-h-[72vh] border-none" // Responsive card size
      contentClassName="p-0 h-full flex items-center justify-center"
      showSpeaker={false}
      frontContent={
        <>
          {enableTracing && content.type === "letter" && (
            <>
              <CardCornerButton
                position="top-left"
                isActive={isTracingMode}
                onClick={() => setIsTracingMode(!isTracingMode)}
                title={isTracingMode ? "Exit Tracing Mode" : "Trace Letters"}
                ariaLabel={isTracingMode ? "Exit Tracing Mode" : "Trace Letters"}
                icon={<Paintbrush className="h-5 w-5 sm:h-6 sm:w-6" />}
              />
              {isTracingMode && <TracingCanvas contentKey={content.key} />}
            </>
          )}

          {content.type === "word" && content.isHardWord && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-40 text-white opacity-70">
                    <Star className="h-6 w-6" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hard Word</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {isWord ? (
            <div className={cn(
              "font-headline font-normal leading-none",
              "select-none [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)]",
              "text-6xl sm:text-8xl md:text-[10rem] [@media(max-height:500px)]:text-5xl [@media(max-height:500px)]:sm:text-7xl"
            )} style={{
              color: content.textColor || 'white',
              transform: `translateY(${letterCase === 'lower' ? (content.verticalOffset || 0) : 0}em)`,
              transition: 'transform 0.2s ease-out'
            }}>
              {splitIntoPhonicsSegments(content.value).map((segment, index) => {
                const displaySegment = segment.toLowerCase();

                return (
                  <span key={index} className={cn(
                    "inline-block transition-all duration-300 ease-in-out",
                    highlightedIndex !== null && highlightedIndex !== index && "opacity-60",
                    highlightedIndex === index && "scale-110 brightness-110 [text-shadow:0_0_10px_rgba(255,255,255,0.4)]",
                    highlightedIndex === null && "opacity-100 scale-100 transition-opacity duration-300"
                  )}>
                    {displaySegment}
                  </span>
                );
              })}
            </div>
          ) : (() => {
            let displayText = content.value;
            const isDigraph = content.value.length > 1;
            const upperText = isDigraph 
              ? content.value.charAt(0).toUpperCase() + content.value.slice(1).toLowerCase() 
              : content.value.toUpperCase();

            if (letterCase === 'upper') {
              displayText = upperText;
            } else if (letterCase === 'mixed') {
              displayText = isDigraph 
                ? `${upperText} ${content.value.toLowerCase()}` 
                : upperText + content.value.toLowerCase();
            } else {
              displayText = content.value.toLowerCase();
            }

            return (
              <span
                className={cn(
                  "font-headline font-normal leading-none flex items-baseline justify-center gap-0",
                  "select-none [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] transition-opacity duration-300",
                  letterCase === 'mixed'
                    ? "text-8xl sm:text-[11rem] md:text-[14rem] [@media(max-height:500px)]:text-7xl [@media(max-height:500px)]:sm:text-8xl"
                    : "text-9xl sm:text-[14rem] md:text-[17.5rem] [@media(max-height:500px)]:text-[8.5rem] [@media(max-height:500px)]:sm:text-[10rem]",
                  isTracingMode && "opacity-40"
                )}
                style={{
                  color: content.textColor || 'white',
                  transform: `translateY(${letterCase === 'lower' ? (content.verticalOffset || 0) : 0}em)`,
                  transition: 'transform 0.2s ease-out'
                }}
              >
                {displayText}
              </span>
            );
          })()}
          <div className={cn(
            "transition-opacity duration-300",
            isTracingMode && "opacity-0 pointer-events-none"
          )}>
            {enableRecordings && (localAudioUrl ? (
              <CardCornerButton
                position="bottom-left"
                onClick={handleDeleteRecording}
                title="Delete recording"
                ariaLabel="Delete recording"
                icon={<Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />}
              />
            ) : (
              <CardCornerButton
                position="bottom-left"
                className={cn(
                  isRecording && "bg-red-600 text-white opacity-100 scale-110 animate-pulse hover:bg-red-700 shadow-lg"
                )}
                onClick={handleToggleRecording}
                title={isRecording ? "Stop Recording" : "Record your own voice"}
                ariaLabel={isRecording ? "Stop Recording" : "Record your own voice"}
                data-recording-button="true"
                icon={isRecording ? <StopCircle className="h-5 w-5 sm:h-6 sm:w-6 fill-current" /> : <Mic className="h-5 w-5 sm:h-6 sm:w-6" />}
              />
            ))}
          </div>

          {content.type === "letter" && (content.value.length === 1 || !!buffers?.[getSoundKeyForSegment(content.value)] || (localAudioUrl && enableRecordings)) && (
            <CardCornerButton
              position="bottom-right"
              className={cn(
                isPlaying ? "scale-110 opacity-100 text-white" : "text-white opacity-75 hover:opacity-100",
                isTracingMode && "opacity-0 pointer-events-none"
              )}
              onClick={(e) => speakLetter(e)}
              title="Listen to sound"
              ariaLabel="Listen to sound"
              icon={
                <Volume2
                  className="h-5 w-5 sm:h-7 sm:w-7"
                  style={{
                    filter: isPlaying ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8)) drop-shadow(0 0 12px rgba(255,255,255,0.4))' : 'none'
                  }}
                />
              }
            />
          )}
          {content.type === "word" && (content.isHardWord ? (localAudioUrl && enableRecordings) : true) && (
            <CardCornerButton
              position="bottom-right"
              className={cn(
                isPlaying ? "scale-110 opacity-100 text-white" : "text-white opacity-75 hover:opacity-100",
                isTracingMode && "opacity-0 pointer-events-none"
              )}
              onClick={(e) => speakWord(e)}
              title="Listen to word"
              ariaLabel="Listen to word"
              icon={
                <Volume2
                  className="h-5 w-5 sm:h-7 sm:w-7"
                  style={{
                    filter: isPlaying ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8)) drop-shadow(0 0 12px rgba(255,255,255,0.4))' : 'none'
                  }}
                />
              }
            />
          )}
          {isRecording && <AudioVisualizer stream={stream} />}
        </>
      }
    />
  );
}

