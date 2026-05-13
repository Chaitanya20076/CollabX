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
    intent: "train_booking",
    label: "Train booking",
    keywords: ["train", "railway", "pnr", "coach", "berth"],
  },
  {
    intent: "bus_booking",
    label: "Bus booking",
    keywords: ["bus", "coach", "sleeper", "seater"],
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
    "movie",
    "book",
    "flight",
    "event"
  ].some((word) => lower.includes(word)) || ["movie_booking", "flight_booking", "event_booking", "concert_booking"].includes(matchedRule.intent);

  return {
    intent: matchedRule.intent,
    label: matchedRule.label,
    priority: matchedPriority,
    needsWebSearch,
  };
};

const sanitizeTicketText = (value = "") =>
  String(value || "")
    .replace(/\[ACTION:[^\]]+\]/gi, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/[`*_#>]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

const toSentenceCase = (value = "") => {
  const cleaned = sanitizeTicketText(value)
    .replace(/\b(please\s*)?(create|raise|log|submit|open)\s+(a\s+)?(support\s+)?ticket\s*(please)?\b/ig, "")
    .replace(/\b(convert this into|make this|draft this as)\s+(a\s+)?(support\s+)?ticket\b/ig, "")
    .replace(/\b(ticket\s*)?(please|pls)\b$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";

  return `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}`;
};

const inferTicketCategory = (message = "", intent = {}) => {
  const lower = message.toLowerCase();

  if (/\b(laptop|desktop|computer|phone|mobile|tablet|charger|screen|keyboard|battery|hardware|device|warranty|repair|service center|lenovo|hp|dell|asus|acer|apple|samsung|sony|oneplus|xiaomi)\b/.test(lower)) {
    return "product_support";
  }

  if (intent.intent === "refund" || /\b(refund|money back|chargeback|reversal)\b/.test(lower)) {
    return "refund";
  }

  if (intent.intent === "payment" || /\b(payment|paid|failed|transaction|invoice|razorpay|money debited)\b/.test(lower)) {
    return "payment";
  }

  if (/\b(book|booking|movie|flight|hotel|train|bus|event|concert)\b/.test(lower)) {
    return "booking";
  }

  if (/\b(login|password|otp|email|account|verify|verification|access)\b/.test(lower)) {
    return "account";
  }

  if (/\b(error|bug|crash|failed|not working|unable|issue|problem|technical)\b/.test(lower)) {
    return "technical";
  }

  if (intent.intent === "complaint" || /\b(complaint|angry|bad service|not satisfied)\b/.test(lower)) {
    return "complaint";
  }

  return "general_support";
};

const buildTicketTitle = (message = "", intent = {}) => {
  const category = inferTicketCategory(message, intent);
  const titles = {
    refund: "Refund assistance request",
    payment: "Payment support request",
    booking: "Booking support request",
    account: "Account access support request",
    technical: "Technical issue support request",
    product_support: "Product support ticket request",
    complaint: "Customer complaint review",
    general_support: "General support request",
  };

  return titles[category] || "Support request";
};

const buildTicketSummary = (message = "", intent = {}) => {
  const affectedService = message.match(/^Affected service:\s*(.+)$/im)?.[1]?.trim();
  const ticketTarget = message.match(/^Ticket target:\s*(.+)$/im)?.[1]?.trim();
  const issueText = String(message || "")
    .replace(/^Affected service:\s*.+$/gim, "")
    .replace(/^Ticket target:\s*.+$/gim, "")
    .replace(/^Priority:\s*.+$/gim, "")
    .trim();
  const issue = toSentenceCase(issueText) || "Customer requested help raising a support ticket.";
  const priority = intent.priority || "normal";
  const lines = [`Issue: ${issue}`];

  if (ticketTarget) {
    lines.push(`Ticket target: ${sanitizeTicketText(ticketTarget)}`);
  }

  if (affectedService) {
    lines.push(`Affected service: ${sanitizeTicketText(affectedService)}`);
  }

  lines.push(`Priority: ${priority}`);
  lines.push("Requested action: Prepare this as a support ticket for the target provider.");

  return lines.join("\n");
};

export const buildTicketDraft = (message = "", intent = {}) => {
  const category = inferTicketCategory(message, intent);

  return {
    title: buildTicketTitle(message, intent),
    category,
    priority: intent.priority || "normal",
    summary: buildTicketSummary(message, intent),
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
    train_booking: [
      "Find train options",
      "Compare berth availability",
      "Create a train support ticket",
    ],
    bus_booking: [
      "Find bus options",
      "Compare sleeper seats",
      "Create a bus support ticket",
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
