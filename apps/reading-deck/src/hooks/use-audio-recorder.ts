
import { useState, useRef, useCallback } from "react";
import { trimSilence } from "@/lib/audio-utils";


export function useAudioRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(mediaStream);

            let options: MediaRecorderOptions = {};
            if (typeof MediaRecorder !== "undefined") {
                if (MediaRecorder.isTypeSupported("audio/mp4")) {
                    options = { mimeType: "audio/mp4" };
                } else if (MediaRecorder.isTypeSupported("audio/webm")) {
                    options = { mimeType: "audio/webm" };
                } else if (MediaRecorder.isTypeSupported("audio/aac")) {
                    options = { mimeType: "audio/aac" };
                }
            }

            const mediaRecorder = new MediaRecorder(mediaStream, options);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e: BlobEvent) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            throw err;
        }
    }, []);

    const stopRecording = useCallback((): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            if (!mediaRecorderRef.current) {
                reject(new Error("No recorder active"));
                return;
            }

            const mimeType = mediaRecorderRef.current.mimeType || "audio/mp4";

            mediaRecorderRef.current.onstop = async () => {
                const rawBlob = new Blob(chunksRef.current, { type: mimeType });

                // Trim silence and convert to WAV
                const audioBlob = await trimSilence(rawBlob);

                setIsRecording(false);
                setStream(null);
                // Stop all tracks to release the microphone
                mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
                resolve(audioBlob);
            };

            mediaRecorderRef.current.stop();
        });
    }, []);

    return {
        isRecording,
        stream,
        startRecording,
        stopRecording,
    };
}
