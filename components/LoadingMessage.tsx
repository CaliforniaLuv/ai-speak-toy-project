"use client";

import { BeatLoader } from "react-spinners";
import { useFormStatus } from "react-dom";

export const LoadingMessage = () => {
  const { pending } = useFormStatus();

  return (
    pending && (
      <p className="message ml-auto mb-auto animate-pulse">
        <BeatLoader color="#fff" />
      </p>
    )
  );
};
