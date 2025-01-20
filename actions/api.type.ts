import { ApiResponseCode } from "./apiCode";

export interface MessagesResponse {
  id?: string;
  sender?: string;
  myQuestion?: string;
  response: string;
  code: ApiResponseCode | null;
}
