const intentRules = [
  {
    intent: "movie_booking",
    label: "Movie booking",
    keywords: ["movie", "cinema", "showtime", "theatre", "theater"],
  },
  {
    intent: "flight_booking",
    label: "Flight booking",
    keywords: ["flight", "airport", "airline", "departure", "arrival"],
  },
  {
    intent: "hotel_booking",
    label: "Hotel booking",
    keywords: ["hotel", "room", "check-in", "checkin", "stay"],
  },
  {
    intent: "event_booking",
    label: "Event booking",
    keywords: ["event", "show", "venue"],
  },
  {
    intent: "concert_booking",
    label: "Concert booking",
    keywords: ["concert", "artist", "band", "music festival"],
  },
  {
    intent: "refund",
    label: "Refund assistance",
    keywords: ["refund", "money back", "chargeback", "reversal"],
  },
  {
    intent: "complaint",
    label: "Complaint handling",
    keywords: ["complaint", "angry", "bad service", "not satisfied"],
  },
  {
    intent: "payment",
    label: "Payment support",
    keywords: ["payment", "paid", "failed", "transaction", "invoice"],
  },
  {
    intent: "ticket_status",
    label: "Ticket status",
    keywords: ["status", "track", "ticket id", "case id"],
  },
  {
    intent: "support_ticket",
    label: "Support ticket",
    keywords: ["ticket", "issue", "problem", "error", "bug", "support"],
  },
];

const priorityMap = [
  {
    priority: "high",
    keywords: ["urgent", "immediately", "critical", "emergency", "failed"],
  },
  {
    priority: "medium",
    keywords: ["soon", "important", "stuck", "unable"],
  },
];

export const detectIntent = (message = "") => {
  const lower = message.toLowerCase();

  const matchedRule =
    intentRules.find((rule) =>
      rule.keywords.some((word) => lower.includes(word))
    ) || {
      intent: "general_support",
      label: "General support",
    };

  const matchedPriority =
    priorityMap.find((rule) =>
      rule.keywords.some((word) => lower.includes(word))
    )?.priority || "normal";

  const needsWebSearch = [
    "latest",
    "today",
    "current",
    "nearby",
    "availability",
    "price",
    "showtime",
    "weather",
    "news",
    "trending",
  ].some((word) => lower.includes(word));

  return {
    intent: matchedRule.intent,
    label: matchedRule.label,
    priority: matchedPriority,
    needsWebSearch,
  };
};

export const buildTicketDraft = (message = "", intent = {}) => {
  const summary =
    message.length > 140
      ? `${message.slice(0, 137)}...`
      : message;

  return {
    title: intent.label || "Support request",
    category: intent.intent || "general_support",
    priority: intent.priority || "normal",
    summary,
    status: "draft",
    nextFields: [
      "name or contact detail",
      "booking or ticket ID if available",
      "preferred resolution",
    ],
  };
};

export const getQuickSuggestions = (intent = {}) => {
  const common = [
    "Create a support ticket",
    "Check my ticket status",
    "Help me with a refund",
  ];

  const suggestionsByIntent = {
    movie_booking: [
      "Find movie options for today",
      "Compare showtimes",
      "Create a movie booking ticket",
    ],
    flight_booking: [
      "Find flights for my route",
      "Help with flight cancellation",
      "Create a flight support ticket",
    ],
    hotel_booking: [
      "Suggest hotels for my dates",
      "Help with hotel cancellation",
      "Create a hotel support ticket",
    ],
    event_booking: [
      "Find nearby events",
      "Help with concert tickets",
      "Create an event support ticket",
    ],
    concert_booking: [
      "Find concert tickets",
      "Compare available seats",
      "Create a concert booking ticket",
    ],
    refund: [
      "Draft my refund request",
      "Check refund requirements",
      "Create a refund ticket",
    ],
    complaint: [
      "Convert this into a complaint ticket",
      "Mark this as urgent",
      "Suggest next escalation step",
    ],
  };

  return suggestionsByIntent[intent.intent] || common;
};
