"use server";

import { SpeechClient, protos } from "@google-cloud/speech";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ApiResponseCode } from "./apiCode";
import { MessagesResponse } from "./api.type";

const GOOGLE_SPEECH_APPLICATION_CREDENTIALS = {
  type: process.env.GOOGLE_PRIVATE_TYPE,
  project_id: process.env.GOOGLE_PRIVATE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.split(String.raw`\n`).join("\n") ?? "",
  client_email: process.env.GOOGLE_PRIVATE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_PRIVATE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_PRIVATE_AUTH_URI,
  token_uri: process.env.GOOGLE_PRIVATE_TOKEN_URI,
  auth_provider_x509_cert_url:
    process.env.GOOGLE_PRIVATE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_PRIVATE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.GOOGLE_PRIVATE_UNIVERSE_DOMAIN,
};

async function transcript(
  _: any,
  formData: FormData
): Promise<MessagesResponse> {
  if (
    process.env.GOOGLE_CHAT_APPLICATION_CREDENTIALS_JSON === undefined ||
    GOOGLE_SPEECH_APPLICATION_CREDENTIALS.type === undefined ||
    GOOGLE_SPEECH_APPLICATION_CREDENTIALS.project_id === undefined ||
    GOOGLE_SPEECH_APPLICATION_CREDENTIALS.private_key_id === undefined ||
    GOOGLE_SPEECH_APPLICATION_CREDENTIALS.private_key === undefined ||
    GOOGLE_SPEECH_APPLICATION_CREDENTIALS.client_email === undefined ||
    GOOGLE_SPEECH_APPLICATION_CREDENTIALS.client_id === undefined ||
    GOOGLE_SPEECH_APPLICATION_CREDENTIALS.auth_uri === undefined ||
    GOOGLE_SPEECH_APPLICATION_CREDENTIALS.token_uri === undefined ||
    GOOGLE_SPEECH_APPLICATION_CREDENTIALS.auth_provider_x509_cert_url ===
      undefined ||
    GOOGLE_SPEECH_APPLICATION_CREDENTIALS.client_x509_cert_url === undefined ||
    GOOGLE_SPEECH_APPLICATION_CREDENTIALS.universe_domain === undefined
  ) {
    console.error("API_KEY 인증 정보가 없습니다.");
    return {
      response: "API_KEY 인증 정보가 없습니다.",
      code: ApiResponseCode.KEY_NOT_FOUND,
    };
  }

  const file = formData.get("audio") as File;

  if (!file || file.size === 0) {
    return {
      response: "오디오 음성 파일이 없습니다.",
      code: ApiResponseCode.AUDIO_FILE_NOT_FOUND,
    };
  }

  const audioBuffer = await file.arrayBuffer();

  // Google STT 클라이언트 초기화
  const client = new SpeechClient({
    credentials: GOOGLE_SPEECH_APPLICATION_CREDENTIALS,
  });
  // Google Chat 클라이언트 초기화
  const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_CHAT_APPLICATION_CREDENTIALS_JSON
  );
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const request = {
    audio: {
      content: Buffer.from(audioBuffer).toString("base64"),
    },
    config: {
      encoding:
        protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.WEBM_OPUS,
      sampleRateHertz: 48000,
      languageCode: "ko-KR",
    },
  };

  // Google STT 호출
  const [response] = await client.recognize(request);

  const speechToText = response.results
    ?.map((result) => result.alternatives?.[0]?.transcript)
    .join("\n");

  if (!speechToText) {
    return {
      response: "정확한 음성을 입력해주세요.",
      code: ApiResponseCode.AUDIO_API_ERROR,
    };
  }

  // Google AI CHAT 호출
  try {
    const { response: result } = await model.generateContent(speechToText);

    const uniqueChatRequestId = crypto.randomUUID();

    return {
      id: uniqueChatRequestId,
      sender: result.text(),
      myQuestion: speechToText,
      response: "status 200 OK",
      code: ApiResponseCode.SUCCESS,
    };
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return {
      response: "AI Chat Error: " + error.message,
      code: ApiResponseCode.CHAT_API_ERROR,
    };
  }
}

export default transcript;
