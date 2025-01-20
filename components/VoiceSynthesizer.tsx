import { useEffect, useState } from "react";

type State = {
  sender?: string;
  response: string;
};

interface VoiceSynthesizerProps {
  state: State;
  displaySettings: boolean;
}

export const VoiceSynthesizer = ({
  state,
  displaySettings,
}: VoiceSynthesizerProps) => {
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (!state.sender || !synth) return;

    const wordsToSay = new SpeechSynthesisUtterance(state.sender);
    wordsToSay.voice = voice;
    wordsToSay.pitch = pitch;
    wordsToSay.rate = rate;
    wordsToSay.volume = volume;

    synth.speak(wordsToSay);

    return () => {
      synth.cancel();
    };
  }, [pitch, rate, state, synth, voice, volume]);

  useEffect(() => {
    setSynth(window.speechSynthesis);
  }, []);

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find((v) => v.name === e.target.value);
    if (!selectedVoice) return;

    setVoice(selectedVoice);
  };

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPitch(parseFloat(e.target.value));
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRate(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="flex flex-col items-center justify-center text-white">
      {displaySettings && (
        <>
          <div className="w-fit ">
            <p className="text-[12px] text-gray-500 p-[8px]">Voice:</p>
            <select
              value={voice?.name}
              onChange={handleVoiceChange}
              className="flex-1 bg-purple-500 text-white border border-gray-300 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400  dark:focus:ring-purple-500 dark:focus:border-purple-500"
            >
              {window.speechSynthesis.getVoices().map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex">
            <div className="flex pb-[20px]">
              <div className="p-[8px]">
                <p className="text-[12px] text-gray-500">Pitch:</p>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={pitch}
                  onChange={handlePitchChange}
                  className="accent-purple-500"
                />
              </div>
            </div>

            <div className="flex pb-[20px]">
              <div className="p-[8px]">
                <p className="text-[12px] text-gray-500">Speed:</p>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={rate}
                  onChange={handleRateChange}
                  className="accent-purple-500"
                />
              </div>
            </div>

            <div className="flex pb-[20px]">
              <div className="p-[8px]">
                <p className="text-[12px] text-gray-500">Volume:</p>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="accent-purple-500"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
