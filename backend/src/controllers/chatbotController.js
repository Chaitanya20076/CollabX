import {
  processAIChat,
} from "../services/chatService.js";

import {
  getChatSession,
  getChatSessions,
  saveChatSession,
} from "../services/chatSessionService.js";

export const chatWithAI =
  async (req, res) => {
    try {
      const {
        message,
        history = [],
        attachments = [],
      } = req.body;

      if (
        !message ||
        typeof message !== "string" ||
        !message.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Message is required",
        });
      }

      const response =
        await processAIChat(
          message,
          history,
          attachments
        );

      res.status(200).json({
        success: true,
        ...response,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message:
          "AI processing failed",
      });
    }
  };

export const saveChat =
  async (req, res) => {
    try {
      const session =
        await saveChatSession(req.body);

      res.status(200).json({
        success: true,
        session,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Chat saving failed",
      });
    }
  };

export const listChats =
  async (req, res) => {
    const sessions =
      await getChatSessions(req.query.userId);

    res.status(200).json({
      success: true,
      sessions,
    });
  };

export const getChat =
  async (req, res) => {
    const session =
      await getChatSession(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    res.status(200).json({
      success: true,
      session,
    });
  };
