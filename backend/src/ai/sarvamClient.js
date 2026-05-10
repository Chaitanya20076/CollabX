import axios from "axios";

import {
  SARVAM_API_KEY,
} from "../config/sarvam.js";

import systemPrompt from "../prompts/systemPrompt.js";

const cleanAIResponse = (text) =>
  text
    .replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, "")
    .replace(/\*\*/g, "")
    .replace(/##/g, "")
    .replace(/```/g, "")
    .replace(/\*/g, "")
    .replace(/__/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const normalizeHistory = (history) => {
  if (!Array.isArray(history)) return [];

  const cleaned = history
    .filter(
      (item) =>
        item &&
        ["user", "assistant"].includes(item.role) &&
        typeof item.content === "string" &&
        item.content.trim()
    )
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, 1200),
    }));

  while (
    cleaned.length &&
    cleaned[0].role !== "user"
  ) {
    cleaned.shift();
  }

  return cleaned
    .reduce((messages, item) => {
      const previous =
        messages[messages.length - 1];

      if (previous?.role === item.role) {
        previous.content = `${previous.content}\n${item.content}`;
      } else {
        messages.push(item);
      }

      return messages;
    }, [])
    .slice(-8);
};

export const generateAIResponse =
  async (userMessage, history = []) => {
    try {
      if (!SARVAM_API_KEY) {
        return "AI service unavailable currently.";
      }

      const safeHistory =
        normalizeHistory(history);

      const response =
        await axios.post(
          "https://api.sarvam.ai/v1/chat/completions",
          {
            model: "sarvam-m",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              ...safeHistory,
              {
                role: "user",
                content: userMessage,
              },
            ],
            temperature: 0.35,
            max_tokens: 2000,
          },
          {
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${SARVAM_API_KEY}`,
            },
          }
        );

      const aiResponse =
        response.data?.choices?.[0]
          ?.message?.content ||
        "No response generated.";

      return cleanAIResponse(aiResponse);
    } catch (error) {
      console.log(
        "SARVAM ERROR:",
        error.response?.data ||
          error.message
      );

      return "AI service unavailable currently.";
    }
  };
