import { MessagesResponse } from "@/actions/api.type";
import { ChevronDownCircleIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { LoadingMessage } from "./LoadingMessage";

export const Messages = ({ messages }: { messages: MessagesResponse[] }) => {
  return (
    <div
      className={`flex flex-col justify-end  min-h-screen p-[20px] pt-[80px] ${
        messages.length > 0 ? "pb-[264px]" : "pb-[208px]"
      }`}
    >
      <LoadingMessage />
      {!messages.length && (
        <div className="flex items-center flex-col space-y-[24px] max-w-[768px] justify-end mx-auto">
          <p className="text-white animate-pulse">AI에게 질문을 해보세요!</p>
          <ChevronDownCircleIcon
            size={64}
            className="animate-bounce text-gray-500"
          />
        </div>
      )}

      {!!messages.length && (
        <div className="p-[20px] space-y-[20px] flex-1">
          {messages.map((message) => (
            <div key={message.id} className="space-y-[20px]">
              {/* 나의 질문 */}
              <div className="pr-[192px]">
                <p className="message bg-gray-800 rounded-bl-none whitespace-pre-line">
                  {message.myQuestion}
                </p>
              </div>
              {/* AI 답변 */}
              <div className="pl-[192px]">
                <ReactMarkdown className="message text-left ml-auto rounded-br-none">
                  {message.sender}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
