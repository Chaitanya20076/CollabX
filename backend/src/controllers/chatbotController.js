import {
  processAIChat,
} from "../services/chatService.js";

import {
  deleteChatSession,
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
        clientContext = {},
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
          attachments,
          clientContext
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

export const streamChatWithAI =
  async (req, res) => {
    try {
      const {
        message,
        history = [],
        attachments = [],
        clientContext = {},
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

      res.setHeader("Content-Type", "application/x-ndjson");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const response =
        await processAIChat(
          message,
          history,
          attachments,
          clientContext
        );

      const reply =
        typeof response.reply === "string"
          ? response.reply
          : "";
      const chunkSize = 10;

      for (let index = 0; index < reply.length; index += chunkSize) {
        res.write(
          `${JSON.stringify({
            type: "chunk",
            value: reply.slice(index, index + chunkSize),
          })}\n`
        );
        await new Promise((resolve) => setTimeout(resolve, 18));
      }

      res.write(
        `${JSON.stringify({
          type: "done",
          response,
        })}\n`
      );
      res.end();
    } catch (error) {
      console.log(error);

      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message:
            "AI processing failed",
        });
      }

      res.write(
        `${JSON.stringify({
          type: "error",
          message: "AI processing failed",
        })}\n`
      );
      res.end();
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

export const deleteChat =
  async (req, res) => {
    try {
      const session =
        await deleteChatSession(req.params.id);

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
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Chat deletion failed",
      });
    }
  };
