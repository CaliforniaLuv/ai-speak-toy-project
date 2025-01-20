"use client";

import Image from "next/image";
import Profile from "../public/profile.png";
import { SettingsIcon } from "lucide-react";
import { Messages } from "@/components/Messages";
import { Recorder } from "@/components/Recorder";
import { useActionState, useEffect, useRef, useState } from "react";
import { MIME_TYPE } from "@/constants/recording.constant";
import transcript from "@/actions/transcript";
import { ApiResponseCode } from "@/actions/apiCode";
import { MessagesResponse } from "@/actions/api.type";
import { VoiceSynthesizer } from "@/components/VoiceSynthesizer";

const INITIAL_STATE = {
  response: "",
  code: null,
};

export default function Home() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const [state, formAction] = useActionState(transcript, INITIAL_STATE);
  const [message, setMessage] = useState<MessagesResponse[]>([]);
  const [displaySettings, setDisplaySettings] = useState(false);

  useEffect(() => {
    if (state.code !== ApiResponseCode.SUCCESS) {
      alert(state.response);
      return;
    }
    setMessage((messages) => [
      {
        id: state.id,
        sender: state.sender,
        myQuestion: state.myQuestion,
        response: state.response,
        code: state.code,
      },
      ...messages,
    ]);
  }, [state]);

  const uploadAudio = (blob: Blob) => {
    const file = new File([blob], "audio.webm", { type: MIME_TYPE });

    if (fileRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileRef.current.files = dataTransfer.files;

      if (submitButtonRef.current) {
        submitButtonRef.current.click();
      }
    }
  };

  return (
    <main className="bg-black h-screen overflow-y-scroll">
      {/* Header */}
      <header className="flex justify-between items-center fixed top-0 text-white w-full p-[20px] z-10">
        <Image
          src={Profile}
          width={50}
          height={50}
          alt="profile"
          className="w-[50px] h-[50px] rounded-full object-contain bg-white"
        />
        <SettingsIcon
          size={40}
          className="p-[8px] m-[8px] rounded-full cursor-pointer bg-purple-600 text-black transition-all ease-in-out duration-150 hover:bg-purple-700 hover:text-white"
          onClick={() => {
            setDisplaySettings((value) => !value);
          }}
        />
      </header>

      {/* Form */}
      <form action={formAction} className="flex flex-col bg-black z-0">
        {/* Message */}
        <div className="flex-1 bg-gradient-to-b from-purple-500 to-black">
          <Messages messages={message} />
        </div>
        <input type="file" name="audio" hidden ref={fileRef} />
        <button type="submit" hidden ref={submitButtonRef}>
          Submit Audio
        </button>

        <div className="fixed bottom-0 w-full overflow-hidden bg-black rounded-t-[24px]">
          {/* Recorder */}
          <Recorder uploadAudio={uploadAudio} />

          <div>
            <VoiceSynthesizer state={state} displaySettings={displaySettings} />
          </div>
        </div>
      </form>
    </main>
  );
}
