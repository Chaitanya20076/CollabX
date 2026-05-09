import {
  createTicket,
  getUserTickets,
} from "../services/ticketService.js";

export const createSupportTicket =
  async (req, res) => {
    try {
      const ticket = await createTicket(req.body);

      res.status(201).json({
        success: true,
        ticket,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Ticket creation failed",
      });
    }
  };

export const listUserTickets =
  async (req, res) => {
    try {
      const userId = req.query.userId;
      const tickets = await getUserTickets(userId);

      res.status(200).json({
        success: true,
        tickets,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Ticket loading failed",
      });
    }
  };
