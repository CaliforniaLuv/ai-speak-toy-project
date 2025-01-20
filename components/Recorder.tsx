"use client";

import Image from "next/image";
import activeAssistantIcon from "@/public/active.gif";
import notActiveAssistantIcon from "@/public/notactive.png";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { MIME_TYPE } from "@/constants/recording.constant";

interface RecorderProps {
  uploadAudio: (blob: Blob) => void;
}

export const Recorder = ({ uploadAudio }: RecorderProps) => {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const { pending } = useFormStatus();
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  useEffect(() => {
    getMicrophonePermission();
  }, []);

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(streamData);
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      alert("해당 브라우저는 MediaRecorder API를 지원하지 않습니다.");
    }
  };

  const startRecording = async () => {
    if (stream === null || pending || mediaRecorder === null) return;

    setRecordingStatus("recording");

    const media = new MediaRecorder(stream, { mimeType: MIME_TYPE });
    mediaRecorder.current = media;
    mediaRecorder.current.start();

    const localAudioChunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };

    setAudioChunks(localAudioChunks);
  };

  const stopRecording = async () => {
    if (mediaRecorder.current === null || pending) return;

    setRecordingStatus("inactive");
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: MIME_TYPE });
      uploadAudio(audioBlob);
      setAudioChunks([]);
    };
  };

  return (
    <div className="flex items-center justify-center text-white">
      {!permission && (
        <button onClick={getMicrophonePermission}>Get Microphone</button>
      )}
      {pending && (
        <Image
          className="assistant grayscale"
          src={activeAssistantIcon}
          width={350}
          height={350}
          priority
          alt="Recording"
        />
      )}

      {permission && recordingStatus === "inactive" && !pending && (
        <Image
          className="assistant cursor-pointer hover:scale-110 duration-150 transition-all ease-in-out"
          src={notActiveAssistantIcon}
          width={350}
          height={350}
          priority={true}
          alt="Not Recording"
          onClick={startRecording}
        />
      )}

      {recordingStatus === "recording" && (
        <Image
          className="assistant cursor-pointer hover:scale-110 duration-150 transition-all ease-in-out"
          src={activeAssistantIcon}
          width={350}
          height={350}
          priority={true}
          alt="Recording"
          onClick={stopRecording}
        />
      )}
    </div>
  );
};
