import { generateAIResponse } from "../ai/sarvamClient.js";
import { searchWeb } from "../websearch/tavilySearch.js";
import { buildTicketDraft, detectIntent, getQuickSuggestions } from "./intentService.js";

import { detectUnavailableMovies, extractMovieOptions } from "./movieUtils.js";

const bookingModes = {
  movie_booking: "movie",
  flight_booking: "flight",
  hotel_booking: "hotel",
  bus_booking: "bus",
  train_booking: "train",
  event_booking: "event",
  concert_booking: "event",
};

const bookingOptionCopy = {
  movie: [
    "INOX Nexus Mall, 7:10 PM, Premium Recliner",
    "PVR City Centre, 8:30 PM, Prime Seats",
    "Cinepolis Atrium, 9:45 PM, Dolby Screen",
  ],
  flight: [
    "IndiGo 6E 214, 08:35 AM, Non-stop",
    "Air India AI 805, 12:20 PM, Flexible fare",
    "Vistara UK 981, 07:45 PM, Premium economy",
  ],
  hotel: [
    "Urban Nest Hotel, Deluxe Room, Breakfast included",
    "Skyline Suites, Premium Room, Free cancellation",
    "Metro Stay, Business Room, Near city centre",
  ],
  bus: [
    "IntrCity SmartBus, 10:30 PM, AC sleeper",
    "Zingbus Plus, 11:15 PM, Window berth",
    "NueGo Express, 06:45 AM, Electric coach",
  ],
  train: [
    "Rajdhani Express, 3A, Lower berth preferred",
    "Vande Bharat, Chair Car, Morning departure",
    "Duronto Express, 2A, Flexible boarding",
  ],
  event: [
    "Priority Entry, Section A, Best view",
    "Standard Pass, Section B, Best value",
    "VIP Lounge, Section V, Premium access",
  ],
};

const isBookingIntent = (intent = "") =>
  Object.prototype.hasOwnProperty.call(bookingModes, intent);

const inferConversationIntent = (message, history, detectedIntent) => {
  const isGenericBooking = isGenericTicketBookingRequest(message);
  
  if (isGenericBooking) {
    return {
      ...detectedIntent,
      intent: "movie_booking", // default to movie if generic
      label: "Movie booking",
    };
  }

  if (detectedIntent.intent !== "general_support" && detectedIntent.intent !== "support_ticket") {
    return detectedIntent;
  }

  const transcript = [
    ...history
      .filter((item) => item.role === "user")
      .map((item) => item.content || ""),
    message,
  ]
    .join(" ")
    .toLowerCase();

  const inferredIntent =
    Object.keys(bookingModes).find((intent) =>
      transcript.includes(intent.replace("_booking", ""))
    ) ||
    (/(inox|pvr|cinepolis|screen|movie)/.test(transcript) && "movie_booking") ||
    (/(indigo|air india|vistara|flight|airport)/.test(transcript) && "flight_booking") ||
    (/(rajdhani|vande bharat|duronto|train|berth)/.test(transcript) && "train_booking") ||
    (/(intrcity|zingbus|bus|sleeper)/.test(transcript) && "bus_booking") ||
    (/(hotel|suite|room|stay)/.test(transcript) && "hotel_booking") ||
    (/(concert|event|vip|section)/.test(transcript) && "event_booking");

  if (!inferredIntent) {
    return detectedIntent;
  }

  const labels = {
    movie_booking: "Movie booking",
    flight_booking: "Flight booking",
    hotel_booking: "Hotel booking",
    train_booking: "Train booking",
    bus_booking: "Bus booking",
    event_booking: "Event booking",
    concert_booking: "Concert booking",
  };

  return {
    ...detectedIntent,
    intent: inferredIntent,
    label: labels[inferredIntent] || detectedIntent.label,
  };
};

const inferBookingStage = (message = "", history = [], intent = {}) => {
  const current = message.toLowerCase();
  const transcript = [
    ...history
      .filter((item) => item.role === "user")
      .map((item) => item.content || ""),
    message,
  ]
    .join(" ")
    .toLowerCase();

  if (/proceed to payment|checkout|pay now/.test(current)) {
    return "payment";
  }

  if (/\b(back|go back|change option|show options again)\b/.test(current)) {
    return "options";
  }

  if (/selected seats|i selected seats|selected:|seat\(s\)|please provide the summary/.test(current)) {
    return "summary";
  }

  if (/i select\s+(flight|train|bus|movie|event|concert)\s+tickets?/.test(current)) {
    return "options";
  }

  if (/i select|choose|option/.test(current)) {
    return "seats";
  }

  const asksBooking =
    isBookingIntent(intent.intent) ||
    /(book|ticket|reserve).*(movie|flight|bus|train|event|concert)/.test(transcript);

  return asksBooking ? "options" : "support";
};

const hasDateHint = (text = "") =>
  /\b(today|tomorrow|tonight|weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{4}[/-]\d{1,2}[/-]\d{1,2}|\d{1,2}[/-]\d{1,2}|\d{1,2}\s*(am|pm))\b/i.test(text);

const isDatePrompt = (prompt = "") =>
  /\b(date|time|when|check-in|slot|show time)\b/i.test(prompt);

const buildDatePickerWidget = (mode = "event") => ({
  type: "date_picker",
  mode,
  includeNights: mode === "hotel",
});

const getMissingBookingWidget = (mode = "event", prompt = "") =>
  isDatePrompt(prompt) ? buildDatePickerWidget(mode) : { type: "input" };

const hasPastDateHint = (text = "") => {
  const lower = text.toLowerCase();
  const currentYear = new Date().getFullYear();

  if (/\b(yesterday|last week|last month|last year)\b/.test(lower)) {
    return true;
  }

  const yearMatches = [...lower.matchAll(/\b(19\d{2}|20\d{2})\b/g)]
    .map((match) => Number(match[1]));

  return yearMatches.some((year) => year < currentYear);
};

const getMovieRequestDateStatus = (text = "") => {
  const lower = String(text || "").toLowerCase();
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  if (/\b(yesterday|last week|last month|last year)\b/.test(lower)) {
    return "allowed";
  }

  const exactDateMatches = [
    ...lower.matchAll(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/g),
    ...lower.matchAll(/\b(\d{1,2})[-/](\d{1,2})[-/](20\d{2})\b/g),
  ];

  for (const match of exactDateMatches) {
    const startsWithYear = match[1].length === 4;
    const year = Number(startsWithYear ? match[1] : match[3]);
    const month = Number(match[2]);
    const day = Number(startsWithYear ? match[3] : match[1]);
    const parsed = new Date(year, month - 1, day);

    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day &&
      parsed < oneYearAgo
    ) {
      return "too_old";
    }
  }

  const yearMatches = [...lower.matchAll(/\b(19\d{2}|20\d{2})\b/g)]
    .map((match) => Number(match[1]));

  if (yearMatches.some((year) => year < now.getFullYear() - 1)) {
    return "too_old";
  }

  return "allowed";
};

const hasPeopleHint = (text = "") =>
  /\b(\d+)\s*(people|persons|person|ppl|tickets?|seats?|passengers?|guests?|rooms?|adults?|kids?|children)\b|\b(solo|alone|couple|family)\b/i.test(text);

const hasRouteHint = (text = "") =>
  /\bfrom\b.+\bto\b|\bto\b.+\bfrom\b|delhi|mumbai|bengaluru|bangalore|chennai|hyderabad|pune|kolkata|mysore|goa/i.test(text);

const hasExplicitRouteHint = (text = "") =>
  /\bfrom\b\s+[a-z ]{2,}\s+\bto\b\s+[a-z ]{2,}|\bto\b\s+[a-z ]{2,}\s+\bfrom\b\s+[a-z ]{2,}/i.test(text);

const hasTravelModeHint = (text = "") =>
  /\b(flight|plane|airline|airport|train|railway|bus|coach|cab|taxi|car)\b/i.test(text);

const isTravelRequestWithoutMode = (text = "") =>
  /\b(travel|go|going|trip|journey|commute|reach)\b/i.test(text) &&
  hasExplicitRouteHint(text) &&
  !hasTravelModeHint(text);

const movieTitleStopWords =
  /^(today|tomorrow|tonight|weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday|show|showtime|tickets?|seat|seats?|city|theatre|theater|cinema|pvr|inox|cinepolis)$/i;

const hasMovieTitleHint = (text = "") => {
  if (/\bkgf|kantara|rrr|pushpa|jawan|pathaan|avatar|dune|oppenheimer|interstellar|salaar|leo\b/i.test(text)) {
    return true;
  }

  const explicitTitle =
    text.match(/\b(?:movie|film)\s+(?:called|named|titled)\s+["']?([a-z0-9][a-z0-9 '&.-]{2,})/i) ||
    text.match(/\b(?:book|get|buy|reserve)\s+(?:movie|film)\s+["']?([a-z0-9][a-z0-9 '&.-]{2,})/i) ||
    text.match(/\b(?:watch|see)\s+["']?([a-z0-9][a-z0-9 '&.-]{2,})/i) ||
    text.match(/\bfor\s+["']?([a-z0-9][a-z0-9 '&.-]{2,})/i);

  if (!explicitTitle?.[1]) return false;

  const candidate = explicitTitle[1]
    .replace(/\b(today|tomorrow|tonight|at|in|near|on|for)\b.*$/i, "")
    .trim();

  return (
    candidate.length >= 3 &&
    !movieTitleStopWords.test(candidate)
  );
};

const isGenericTicketBookingRequest = (text = "") =>
  /\b(book|reserve|get|buy)\b.*\b(ticket|tickets)\b/i.test(text) &&
  !/\b(movie|film|cinema|flight|hotel|room|train|bus|event|concert|show)\b/i.test(text);

const hasStayHint = (text = "") =>
  /\b(check[ -]?in|check[ -]?out|room|night|stay|hotel in|near)\b/i.test(text);

const hasEventHint = (text = "") =>
  /\b(concert|show|event|match|festival|artist|venue|stage|vip)\b/i.test(text) &&
  !/\bbook\s+(a\s+)?(event|concert)\b/i.test(text);

const getLastAssistantMessage = (history = []) =>
  history.filter((item) => item.role === "assistant").pop()?.content || "";

const didAnswerQuestion = (history = [], currentMessage = "", keywords = []) => {
  const lastBotMessage = getLastAssistantMessage(history).toLowerCase();
  const currentText = currentMessage.trim();

  return (
    (currentText.length > 1 || /^\d+$/.test(currentText)) &&
    keywords.some((keyword) => lastBotMessage.includes(keyword))
  );
};

const didAnswerEarlierQuestion = (history = [], keywords = [], validator = null) => {
  for (let index = 0; index < history.length - 1; index += 1) {
    const question = String(history[index]?.content || "").toLowerCase();
    const answer = String(history[index + 1]?.content || "").trim();
    const isAssistantQuestion = history[index]?.role === "assistant";
    const isUserAnswer = history[index + 1]?.role === "user";
    const matchesQuestion = keywords.some((keyword) => question.includes(keyword));
    const matchesAnswer = validator ? validator(answer) : answer.length > 1;

    if (isAssistantQuestion && isUserAnswer && matchesQuestion && matchesAnswer) {
      return true;
    }
  }

  return false;
};

const getAnswerForEarlierQuestion = (history = [], keywords = []) => {
  for (let index = history.length - 2; index >= 0; index -= 1) {
    const question = String(history[index]?.content || "").toLowerCase();
    const answer = String(history[index + 1]?.content || "").trim();
    const isAssistantQuestion = history[index]?.role === "assistant";
    const isUserAnswer = history[index + 1]?.role === "user";

    if (
      isAssistantQuestion &&
      isUserAnswer &&
      answer &&
      keywords.some((keyword) => question.includes(keyword))
    ) {
      return answer;
    }
  }

  return "";
};

const ticketFlowIntents = new Set([
  "support_ticket",
  "refund",
  "complaint",
  "payment",
]);

const isTicketCreationRequest = (text = "", detectedIntent = {}) => {
  const explicitTicketRequest =
    /\b(create|raise|open|log|submit|file|draft)\b.*\b(ticket|case|complaint|request)\b/i.test(text) ||
    /\b(ticket|case|complaint|request)\b.*\b(create|raise|open|log|submit|file|draft)\b/i.test(text);

  if (explicitTicketRequest) return true;

  return (
    ticketFlowIntents.has(detectedIntent.intent) &&
    ["support_ticket", "complaint"].includes(detectedIntent.intent)
  );
};

const isOngoingTicketFlow = (history = []) => {
  const lastBotMessage = getLastAssistantMessage(history).toLowerCase();

  return [
    "what problem should i raise",
    "which company, product, or service",
    "how urgent is this ticket",
  ].some((phrase) => lastBotMessage.includes(phrase));
};

const stripTicketRequestPhrases = (text = "") =>
  String(text || "")
    .replace(/\[ACTION:[^\]]+\]/gi, "")
    .replace(/\b(please\s*)?(create|raise|open|log|submit|file|draft)\s+(a\s+)?(support\s+)?(ticket|case|complaint|request)\s*(please)?\b/ig, "")
    .replace(/\b(convert this into|make this|draft this as)\s+(a\s+)?(support\s+)?(ticket|case|complaint|request)\b/ig, "")
    .replace(/\b(i want to|i need to|can you|could you|please|pls)\b/ig, "")
    .replace(/\s+/g, " ")
    .trim();

const getTicketIssueDetail = (message = "", history = []) => {
  const direct = stripTicketRequestPhrases(message);
  const lastBotMessage = getLastAssistantMessage(history).toLowerCase();
  const isAnsweringIssuePrompt =
    ["what problem", "what happened", "describe the issue", "issue should"].some((keyword) =>
      lastBotMessage.includes(keyword)
    );
  const isAnsweringLaterTicketPrompt =
    ["which company", "product, or service", "company or service", "brand or service", "how urgent", "priority"].some((keyword) =>
      lastBotMessage.includes(keyword)
    );

  const earlierIssue = getAnswerForEarlierQuestion(history, [
    "what problem",
    "what happened",
    "describe the issue",
    "issue should",
  ]);

  if (isAnsweringLaterTicketPrompt) return earlierIssue;

  if (isAnsweringIssuePrompt && direct.length >= 3) return direct;
  if (
    direct.length >= 16 &&
    !/^(ticket|support|help|issue|problem)$/i.test(direct) &&
    !/^(against|with|for|at|from)\b/i.test(direct)
  ) {
    return direct;
  }

  return earlierIssue;
};

const getTicketTarget = (message = "", history = [], issue = "") => {
  const lastBotMessage = getLastAssistantMessage(history).toLowerCase();
  const isAnsweringTargetPrompt =
    ["which company", "product, or service", "company or service", "brand or service"].some((keyword) =>
      lastBotMessage.includes(keyword)
    );
  const direct = stripTicketRequestPhrases(message);

  if (isAnsweringTargetPrompt && direct.length >= 2) return direct;

  const earlier = getAnswerForEarlierQuestion(history, [
    "which company",
    "product, or service",
    "company or service",
    "brand or service",
  ]);
  if (earlier) return earlier;

  const source = [
    ...history
      .filter((item) => item.role === "user")
      .map((item) => item.content || ""),
    message,
    issue,
  ].join(" ");
  const explicitTarget =
    source.match(/\b(?:with|against|for|at|from)\s+([a-z0-9][a-z0-9 &'.-]{1,40})(?:\s+(?:for|about|because|regarding|as|on)\b|$)/i)?.[1] ||
    source.match(/\b(lenovo|hp|dell|asus|acer|apple|samsung|sony|oneplus|xiaomi|amazon|flipkart|myntra|swiggy|zomato|uber|ola|airtel|jio|vodafone|vi|bsnl|hdfc|icici|sbi|axis|paytm|phonepe|google pay|gpay)\b/i)?.[1];

  if (explicitTarget) {
    return explicitTarget
      .replace(/\b(my|the|a|an)\b/ig, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  return "";
};

const getTicketPriorityFromFlow = (message = "", history = [], detectedIntent = {}) => {
  const transcript = [
    ...history
      .filter((item) => item.role === "user")
      .map((item) => item.content || ""),
    message,
  ]
    .join(" ")
    .toLowerCase();

  if (/\b(high|urgent|critical|emergency|immediately|asap|blocked)\b/.test(transcript)) {
    return "high";
  }

  if (/\b(medium|soon|important|stuck|unable)\b/.test(transcript)) {
    return "medium";
  }

  if (/\b(low|minor|whenever|not urgent)\b/.test(transcript)) {
    return "low";
  }

  if (
    didAnswerEarlierQuestion(history, ["how urgent", "priority"]) ||
    didAnswerQuestion(history, message, ["how urgent", "priority"])
  ) {
    return detectedIntent.priority || "normal";
  }

  return "";
};

const buildGuidedTicketResponse = (message = "", history = [], detectedIntent = {}) => {
  const issue = getTicketIssueDetail(message, history);

  if (!issue) {
    return {
      reply: "Sure. What problem should I raise the ticket for?",
      widget: { type: "input" },
      ticketDraft: null,
      done: false,
    };
  }

  const ticketTarget = getTicketTarget(message, history, issue);

  if (!ticketTarget) {
    return {
      reply: "Which company, product, or service should this ticket be raised with?",
      widget: { type: "input" },
      ticketDraft: null,
      done: false,
    };
  }

  const priority = getTicketPriorityFromFlow(message, history, detectedIntent);

  if (!priority) {
    return {
      reply: "How urgent is this ticket?",
      widget: {
        type: "mcq",
        options: ["High priority", "Medium priority", "Low priority"],
      },
      ticketDraft: null,
      done: false,
    };
  }

  const ticketMessage = [
    issue,
    `Ticket target: ${ticketTarget}`,
    `Priority: ${priority}`,
  ].join("\n");
  const ticketDraft = buildTicketDraft(ticketMessage, {
    ...detectedIntent,
    priority,
  });

  return {
    reply: "I have drafted a support ticket based on your details. You can review and submit it below.",
    widget: {
      type: "ticket_draft",
      draft: ticketDraft,
    },
    ticketDraft,
    done: true,
  };
};

const getCountFromText = (text = "") => {
  const lower = String(text).toLowerCase();

  if (/\b(solo|alone)\b/.test(lower)) return 1;
  if (/\b(couple)\b/.test(lower)) return 2;

  const match =
    lower.match(/\b(\d{1,2})\s*(people|persons|person|ppl|tickets?|seats?|passengers?|guests?|rooms?|adults?|kids?|children)\b/) ||
    lower.match(/^\s*(\d{1,2})\s*$/);

  if (!match) return null;

  const count = Number(match[1]);
  return Number.isInteger(count) && count > 0 ? Math.min(count, 10) : null;
};

const getRequestedTicketCount = (history = [], currentMessage = "") => {
  const currentCount = getCountFromText(currentMessage);
  if (currentCount) return currentCount;

  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index]?.role !== "user") continue;
    const count = getCountFromText(history[index]?.content || "");
    if (count) return count;
  }

  return 1;
};

const normalizeTitleTokens = (title = "") =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !movieTitleStopWords.test(token));

const getMovieTitleFromConversation = (message = "", history = []) => {
  const fromQuestion = getAnswerForEarlierQuestion(history, ["which movie"]);
  if (fromQuestion) return fromQuestion;

  const explicit =
    message.match(/\b(?:movie|film)\s+(?:called|named|titled)\s+["']?([a-z0-9][a-z0-9 '&.-]{2,})/i) ||
    message.match(/\b(?:book|get|buy|reserve)\s+(?:movie|film)\s+["']?([a-z0-9][a-z0-9 '&.-]{2,})/i) ||
    message.match(/\b(?:watch|see)\s+["']?([a-z0-9][a-z0-9 '&.-]{2,})/i) ||
    message.match(/\bfor\s+["']?([a-z0-9][a-z0-9 '&.-]{2,})/i);

  return explicit?.[1]
    ?.replace(/\b(today|tomorrow|tonight|at|in|near|on|for)\b.*$/i, "")
    .trim() || "";
};

const resultMatchesMovieTitle = (item = {}, movieTitle = "") => {
  const tokens = normalizeTitleTokens(movieTitle);
  if (!tokens.length) return true;

  const haystack = `${item.title || ""} ${item.content || ""}`.toLowerCase();
  return tokens.every((token) => haystack.includes(token));
};

const hasLocationHint = (text = "") =>
  /\b(in|near|around|at)\s+[a-z][a-z\s.-]{2,}\b|delhi|mumbai|bengaluru|bangalore|chennai|hyderabad|pune|kolkata|mysore|goa|noida|gurgaon|gurugram|jaipur|ahmedabad/i.test(text);

const getClientLocationText = (clientContext = {}) => {
  const location = clientContext?.location;
  const latitude = Number(location?.latitude);
  const longitude = Number(location?.longitude);
  const label = String(location?.label || "").trim();

  if (label) {
    return `near ${label}`;
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return "";
  }

  return `near latitude ${latitude.toFixed(5)}, longitude ${longitude.toFixed(5)}`;
};

const shouldUseClientLocationForMode = (mode) =>
  ["movie", "hotel", "event"].includes(mode);

const hasClientLocation = (clientContext = {}) =>
  Boolean(getClientLocationText(clientContext));

const getMissingBookingPrompt = (
  mode,
  transcript = "",
  history = [],
  currentMessage = "",
  clientContext = {}
) => {
  const text = transcript.toLowerCase();

  if (mode === "movie") {
    const hasTitle =
      hasMovieTitleHint(text) ||
      didAnswerQuestion(history, currentMessage, ["which movie"]) ||
      didAnswerEarlierQuestion(history, ["which movie"]);
    const hasTiming =
      hasDateHint(text) ||
      didAnswerQuestion(history, currentMessage, ["date", "time", "show"]) ||
      didAnswerEarlierQuestion(history, ["date", "time", "show"]);
    const hasPeople =
      hasPeopleHint(text) ||
      didAnswerQuestion(history, currentMessage, ["how many", "people", "tickets"]) ||
      didAnswerEarlierQuestion(history, ["how many", "people", "tickets"], (answer) =>
        /^\d+$/.test(answer) || hasPeopleHint(answer)
      );
    const hasLocation =
      hasLocationHint(text) ||
      hasClientLocation(clientContext) ||
      didAnswerQuestion(history, currentMessage, ["location", "city", "area"]) ||
      didAnswerEarlierQuestion(history, ["location", "city", "area"]);

    if (!hasTitle) return "Sure. Which movie would you like to watch?";
    if (!hasTiming) return "What date or show time do you prefer?";
    if (!hasPeople) return "How many people should I book tickets for?";
    if (!hasLocation) return "Which location or area should I search theatres near?";
  }

  if (mode === "flight") {
    const hasRoute =
      hasExplicitRouteHint(text) ||
      didAnswerQuestion(history, currentMessage, ["source", "destination", "from"]) ||
      didAnswerEarlierQuestion(history, ["source", "destination", "from"]);
    const hasTiming =
      hasDateHint(text) ||
      didAnswerQuestion(history, currentMessage, ["date", "time", "when"]) ||
      didAnswerEarlierQuestion(history, ["date", "time", "when"]);
    const hasPeople =
      hasPeopleHint(text) ||
      didAnswerQuestion(history, currentMessage, ["passengers", "people", "tickets"]) ||
      didAnswerEarlierQuestion(history, ["passengers", "people", "tickets"], (answer) =>
        /^\d+$/.test(answer) || hasPeopleHint(answer)
      );

    if (!hasRoute) return "Please share the source and destination for the flight.";
    if (!hasTiming) return "What travel date or time do you prefer?";
    if (!hasPeople) return "How many passengers should I include?";
  }

  if (["bus", "train"].includes(mode)) {
    const hasRoute =
      hasExplicitRouteHint(text) ||
      didAnswerQuestion(history, currentMessage, ["source", "destination", "from"]) ||
      didAnswerEarlierQuestion(history, ["source", "destination", "from"]);
    const hasTiming =
      hasDateHint(text) ||
      didAnswerQuestion(history, currentMessage, ["date", "time", "when"]) ||
      didAnswerEarlierQuestion(history, ["date", "time", "when"]);
    const hasPeople =
      hasPeopleHint(text) ||
      didAnswerQuestion(history, currentMessage, ["passengers", "people", "tickets"]) ||
      didAnswerEarlierQuestion(history, ["passengers", "people", "tickets"], (answer) =>
        /^\d+$/.test(answer) || hasPeopleHint(answer)
      );

    if (!hasRoute) return `Please share the source and destination for the ${mode}.`;
    if (!hasTiming) return "What travel date or time should I use?";
    if (!hasPeople) return "How many passengers should I include?";
  }

  if (mode === "hotel") {
    const hasArea =
      hasLocationHint(text) ||
      hasClientLocation(clientContext) ||
      didAnswerQuestion(history, currentMessage, ["city", "area", "location"]) ||
      didAnswerEarlierQuestion(history, ["city", "area", "location"]);
    const hasDates =
      hasStayHint(text) ||
      hasDateHint(text) ||
      didAnswerQuestion(history, currentMessage, ["check-in", "date", "night"]) ||
      didAnswerEarlierQuestion(history, ["check-in", "date", "night"]);
    const hasGuests =
      hasPeopleHint(text) ||
      didAnswerQuestion(history, currentMessage, ["guests", "people", "rooms"]) ||
      didAnswerEarlierQuestion(history, ["guests", "people", "rooms"], (answer) =>
        /^\d+$/.test(answer) || hasPeopleHint(answer)
      );

    if (!hasArea) return "Which city or area should I search hotels in?";
    if (!hasDates) return "What check-in date and number of nights do you prefer?";
    if (!hasGuests) return "How many guests and rooms should I include?";
  }

  if (mode === "event") {
    const hasEvent =
      hasEventHint(text) ||
      didAnswerQuestion(history, currentMessage, ["event", "concert", "show"]) ||
      didAnswerEarlierQuestion(history, ["event", "concert", "show"]);
    const hasTiming =
      hasDateHint(text) ||
      didAnswerQuestion(history, currentMessage, ["date", "time", "when"]) ||
      didAnswerEarlierQuestion(history, ["date", "time", "when"]);
    const hasPeople =
      hasPeopleHint(text) ||
      didAnswerQuestion(history, currentMessage, ["people", "tickets"]) ||
      didAnswerEarlierQuestion(history, ["people", "tickets"], (answer) =>
        /^\d+$/.test(answer) || hasPeopleHint(answer)
      );
    const hasLocation =
      hasLocationHint(text) ||
      hasClientLocation(clientContext) ||
      didAnswerQuestion(history, currentMessage, ["location", "city", "area"]) ||
      didAnswerEarlierQuestion(history, ["location", "city", "area"]);

    if (!hasEvent) return "Which event, concert, or show should I look for?";
    if (!hasTiming) return "What date or time slot do you prefer?";
    if (!hasPeople) return "How many tickets should I look for?";
    if (!hasLocation) return "Which location or area should I search near?";
  }

  return null;
};

const buildBookingSearchQuery = (mode, transcript = "", clientContext = {}) => {
  const compact = transcript.replace(/\s+/g, " ").trim();
  const year = new Date().getFullYear();
  const locationText = shouldUseClientLocationForMode(mode)
    ? getClientLocationText(clientContext)
    : "";
  const searchText = [compact, locationText].filter(Boolean).join(" ");

  const queries = {
    movie: `${searchText} ${year} now showing movie tickets showtimes BookMyShow PVR INOX Cinepolis nearest theatres`,
    flight: `${searchText} ${year} flight tickets airline schedule availability`,
    train: `${searchText} ${year} train tickets schedule availability IRCTC`,
    bus: `${searchText} ${year} bus tickets schedule availability redBus AbhiBus`,
    hotel: `${searchText} ${year} hotels rooms availability near user location`,
    event: `${searchText} ${year} event concert tickets venue availability near user location`,
  };

  return queries[mode] || `real booking options for ${searchText}`;
};

const buildNearbyTheatreSearchQuery = (transcript = "", clientContext = {}) => {
  const compact = transcript.replace(/\s+/g, " ").trim();
  const locationText = getClientLocationText(clientContext);
  return `${[compact, locationText].filter(Boolean).join(" ")} nearby movie theatres PVR INOX Cinepolis cinema multiplex`;
};

const cleanOptionText = (value = "") =>
  String(value)
    .replace(/\s+/g, " ")
    .replace(/\s+\|\s+/g, " - ")
    .replace(/#+/g, "")
    .trim();

const isUsefulSearchResult = (item = {}) => {
  const haystack = `${item.title || ""} ${item.content || ""}`.toLowerCase();

  if (!haystack.trim()) return false;

  return ![
    "set location",
    "location pin icon",
    "skip to content",
    "reserves the right",
    "offer at any time",
    "privacy policy",
    "terms of use",
  ].some((phrase) => haystack.includes(phrase));
};

const localTicketModes = new Set(["movie", "hotel", "event"]);

const liveAvailabilityKeywordsByMode = {
  movie: [
    "showtimes",
    "now showing",
    "movie tickets",
    "book tickets",
    "cinema",
    "pvr",
    "inox",
    "cinepolis",
    "theatre",
    "theater",
    "multiplex",
  ],
  hotel: [
    "rooms",
    "hotel",
    "check-in",
    "availability",
    "book",
    "stay",
  ],
  event: [
    "tickets",
    "venue",
    "book",
    "concert",
    "event",
    "show",
  ],
};

const trustedDomainsByMode = {
  movie: [
    "bookmyshow",
    "pvr",
    "inox",
    "cinepolis",
    "ticketnew",
    "paytm",
    "landmarkcinemas",
    "fandango",
  ],
  hotel: [
    "booking.com",
    "agoda",
    "makemytrip",
    "goibibo",
    "cleartrip",
    "expedia",
    "hotels.com",
  ],
  event: [
    "bookmyshow",
    "insider",
    "skillboxes",
    "ticketmaster",
    "district",
    "paytm",
  ],
};

const includesAny = (text = "", keywords = []) =>
  keywords.some((keyword) => text.includes(keyword));

const hasLiveAvailabilityProof = (mode, webResults = [], context = {}) => {
  if (!localTicketModes.has(mode)) return true;

  const keywords = liveAvailabilityKeywordsByMode[mode] || [];
  const domains = trustedDomainsByMode[mode] || [];
  const currentYear = String(new Date().getFullYear());

  return webResults.some((item) => {
    if (!isUsefulSearchResult(item)) return false;
    if (mode === "movie" && !resultMatchesMovieTitle(item, context.movieTitle)) return false;

    const haystack = `${item.title || ""} ${item.content || ""} ${item.url || ""}`.toLowerCase();
    const fromTrustedDomain = includesAny(haystack, domains);
    const hasAvailabilityText = includesAny(haystack, keywords);
    const looksCurrent =
      mode !== "movie" ||
      haystack.includes(currentYear) ||
      /\b(today|tomorrow|now showing|currently showing|showtimes|show timings)\b/i.test(haystack);

    return fromTrustedDomain && hasAvailabilityText && looksCurrent;
  });
};

const getUnavailableReply = (mode) => {
  if (mode === "movie") {
    return "I could not verify that this movie is currently running in theatres near you. It may no longer be in theatres, so I cannot create a booking for it. Try another movie that is currently showing.";
  }

  if (mode === "hotel") {
    return "I could not verify live hotel availability near your location for those details, so I cannot create a booking from unreliable results. Try different dates or a clearer nearby area.";
  }

  if (mode === "event") {
    return "I could not verify active ticket availability for that event near your location. It may be over, unavailable, or not ticketed right now, so I cannot create a booking for it.";
  }

  return "I could not verify live availability for those details, so I cannot create a booking from unreliable results.";
};

const travelOptionTemplates = {
  flight: [
    { time: "08:35 AM", detail: "Non-stop" },
    { time: "12:20 PM", detail: "Flexible fare" },
    { time: "07:45 PM", detail: "Premium economy" },
  ],
  train: [
    { time: "06:10 AM", detail: "3A, Lower berth preferred" },
    { time: "02:35 PM", detail: "Chair Car, Window seat" },
    { time: "09:20 PM", detail: "2A, Flexible boarding" },
  ],
  bus: [
    { time: "10:30 PM", detail: "AC sleeper" },
    { time: "11:15 PM", detail: "Window berth" },
    { time: "06:45 AM", detail: "AC seater" },
  ],
};

const stripSearchNoise = (value = "") =>
  cleanOptionText(value)
    .replace(/\b(book|booking|tickets?|schedule|availability|price|status|online|official site)\b/ig, "")
    .replace(/\b(make ?my ?trip|cleartrip|goibibo|redbus|abhibus|irctc|ixigo|yatra)\b/ig, "")
    .replace(/\s*[-|:].*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();

const extractTravelOperator = (mode, item = {}, index = 0) => {
  const text = cleanOptionText(`${item.title || ""} ${item.content || ""}`);
  const lower = text.toLowerCase();

  if (mode === "flight") {
    const airlines = [
      ["indigo", "IndiGo"],
      ["air india express", "Air India Express"],
      ["air india", "Air India"],
      ["vistara", "Vistara"],
      ["akasa", "Akasa Air"],
      ["spicejet", "SpiceJet"],
    ];
    const airline = airlines.find(([keyword]) => lower.includes(keyword))?.[1];
    const flightNo = text.match(/\b(?:6E|AI|IX|UK|QP|SG)\s?-?\s?\d{2,4}\b/i)?.[0]
      ?.replace(/\s*-\s*/g, " ")
      .toUpperCase();

    if (airline && flightNo) return `${airline} ${flightNo}`;
    if (airline) return airline;
  }

  if (mode === "train") {
    const trainName =
      text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\s+(?:Express|Mail|Shatabdi|Rajdhani|Duronto|Vande Bharat))\b/)?.[1] ||
      text.match(/\b(Vande Bharat|Rajdhani Express|Shatabdi Express|Duronto Express|Garib Rath|Humsafar Express)\b/i)?.[0];
    const trainNo = text.match(/\b\d{5}\b/)?.[0];

    if (trainName && trainNo) return `${cleanOptionText(trainName)} ${trainNo}`;
    if (trainName) return cleanOptionText(trainName);
  }

  if (mode === "bus") {
    const operators = [
      ["intrcity", "IntrCity SmartBus"],
      ["zingbus", "Zingbus Plus"],
      ["nuego", "NueGo Express"],
      ["orange travels", "Orange Travels"],
      ["srs travels", "SRS Travels"],
      ["vr l", "VRL Travels"],
      ["vrl", "VRL Travels"],
    ];
    const operator = operators.find(([keyword]) => lower.includes(keyword))?.[1];
    if (operator) return operator;
  }

  return stripSearchNoise(item.title || "") ||
    bookingOptionCopy[mode][index % bookingOptionCopy[mode].length].split(",")[0];
};

const buildSanitizedTravelOptions = (mode, results = []) => {
  const templates = travelOptionTemplates[mode] || [];
  const operators = [];

  results.forEach((item) => {
    const operator = extractTravelOperator(mode, item, operators.length);
    if (operator && !operators.some((existing) => existing.toLowerCase() === operator.toLowerCase())) {
      operators.push(operator);
    }
  });

  const fallbackOperators = bookingOptionCopy[mode].map((option) => option.split(",")[0]);
  const finalOperators = [...operators, ...fallbackOperators]
    .filter((operator, index, list) =>
      operator && list.findIndex((item) => item.toLowerCase() === operator.toLowerCase()) === index
    )
    .slice(0, 3);

  return finalOperators.map((operator, index) => {
    const template = templates[index % templates.length];
    return `${operator}, ${template.time}, ${template.detail}`;
  });
};

const buildRealBookingOptions = (mode, webResults = [], context = {}) => {
  const results = webResults
    .filter((item) => item?.title || item?.content)
    .filter(isUsefulSearchResult)
    .filter((item) => mode !== "movie" || resultMatchesMovieTitle(item, context.movieTitle))
    .filter((item) => {
      if (!localTicketModes.has(mode)) return true;

      const haystack = `${item.title || ""} ${item.content || ""} ${item.url || ""}`.toLowerCase();
      return includesAny(haystack, trustedDomainsByMode[mode] || []) &&
        includesAny(haystack, liveAvailabilityKeywordsByMode[mode] || []);
    })
    .slice(0, 3);

  if (["flight", "train", "bus"].includes(mode)) {
    return buildSanitizedTravelOptions(mode, results);
  }

  if (!results.length) return [];

  return results.map((item, index) => {
    const title = cleanOptionText(item.title || `Option ${index + 1}`);
    const detail = cleanOptionText(item.content || "").slice(0, 92);

    if (mode === "movie") {
      return detail ? `${title} - ${detail}` : title;
    }

    if (mode === "hotel") {
      return detail ? `${title} - ${detail}` : title;
    }

    return detail ? `${title} - ${detail}` : title;
  });
};

const extractTheatreName = (item = {}, index = 0) => {
  const text = cleanOptionText(`${item.title || ""} ${item.content || ""}`);
  const theatreMatch = text.match(
    /\b((?:PVR|INOX|Cinepolis|Cinépolis|Miraj|Carnival|Mukta|Wave|Asian|AGS|SPI|Prasads|MovieMax|Cineplex|AMC|Regal|Vue|Odeon)[\w\s&'.,()-]{0,55})/i
  );

  if (theatreMatch?.[1]) {
    return cleanOptionText(theatreMatch[1]).replace(/\s+-\s+.*$/, "");
  }

  const title = cleanOptionText(item.title || "");
  if (title) {
    return title
      .replace(/\s*[-|:].*$/, "")
      .replace(/\b(showtimes|movie tickets|cinema tickets|book tickets)\b/ig, "")
      .trim();
  }

  return bookingOptionCopy.movie[index % bookingOptionCopy.movie.length].split(",")[0];
};

const buildDemoMovieOptions = (webResults = [], context = {}) => {
  const usefulTheatres = webResults
    .filter(isUsefulSearchResult)
    .filter((item) => {
      const haystack = `${item.title || ""} ${item.content || ""}`.toLowerCase();
      return includesAny(haystack, liveAvailabilityKeywordsByMode.movie);
    });

  const sourceResults = usefulTheatres.length ? usefulTheatres : webResults;
  const theatres = [];

  sourceResults.forEach((item) => {
    const theatre = extractTheatreName(item, theatres.length);
    if (theatre && !theatres.some((existing) => existing.toLowerCase() === theatre.toLowerCase())) {
      theatres.push(theatre);
    }
  });

  const fallbackTheatres = bookingOptionCopy.movie.map((option) => option.split(",")[0]);
  const finalTheatres = [...theatres, ...fallbackTheatres]
    .filter((theatre, index, list) =>
      theatre && list.findIndex((item) => item.toLowerCase() === theatre.toLowerCase()) === index
    )
    .slice(0, 3);

  const times = ["6:45 PM", "8:30 PM", "10:15 PM"];
  const screens = ["Premium Recliner", "Prime Seats", "Dolby Screen"];

  return finalTheatres.map((theatre, index) =>
    `${theatre}, ${times[index]}, ${screens[index]}`
  );
};

const buildDeterministicResponse = async (
  message,
  history,
  detectedIntent,
  clientContext = {}
) => {
  if (!isBookingIntent(detectedIntent.intent)) {
    if (detectedIntent.intent === "refund") {
      return {
        reply:
          "I can help raise a refund request. Please share your booking ID or payment reference so I can attach it to the ticket.",
        widget: { type: "input" },
      };
    }

    if (["payment", "ticket_status"].includes(detectedIntent.intent)) {
      return {
        reply:
          "I can check this for you. Please share the ticket ID, booking confirmation code, or transaction reference.",
        widget: { type: "input" },
      };
    }

    return {
      reply:
        "I can convert this into a support ticket. Please share the affected service and urgency, and I will prepare the ticket draft.",
      widget: { type: "input" },
    };
  }

  const mode = bookingModes[detectedIntent.intent] || "event";
  const optionKey =
    detectedIntent.intent === "hotel_booking" ? "hotel" : mode;
  const stage = inferBookingStage(message, history, detectedIntent);
  const transcript = [...history.map((item) => item.content || ""), message]
    .join(" ");
  const bookingContext = {
    movieTitle:
      optionKey === "movie"
        ? getMovieTitleFromConversation(message, history)
        : "",
  };

  if (["flight", "train", "bus", "hotel", "event"].includes(optionKey) && hasPastDateHint(transcript)) {
    return {
      reply:
        "I cannot book tickets or stays for a past date. Please share a current or upcoming date so I can check live availability.",
      widget: buildDatePickerWidget(optionKey),
      usedWebSearch: false,
    };
  }

  if (stage === "summary") {
    return {
      reply: "Great, here is the booking summary before checkout.",
      widget: {
        type: "summary",
        details: [
          `${detectedIntent.label}: ${message.replace(/^i selected seats:\s*/i, "")}`,
          "Status: Ready for payment",
          "Assurance: Free cancellation window shown in dashboard",
        ],
      },
    };
  }

  if (stage === "seats") {
    const maxSeats = getRequestedTicketCount(history, message);

    return {
      reply: `Nice choice. Pick exactly ${maxSeats} ${maxSeats === 1 ? "seat" : "seats"} to lock the booking draft.`,
      widget: {
        type: "seat_selection",
        mode,
        maxSeats,
      },
    };
  }

  if (stage === "payment") {
    return {
      reply:
        "You are ready for checkout. Open the dashboard booking section to pay with Razorpay, cancel, or request a refund from the same workflow.",
      widget: null,
    };
  }

  if (stage === "options") {
    const missingPrompt = getMissingBookingPrompt(
      optionKey,
      transcript,
      history,
      message,
      clientContext
    );

    if (missingPrompt) {
      return {
        reply: missingPrompt,
        widget: getMissingBookingWidget(optionKey, missingPrompt),
        usedWebSearch: false,
      };
    }

    const searchQuery = buildBookingSearchQuery(
      optionKey,
      transcript,
      clientContext
    );

    if (optionKey === "movie") {
      if (getMovieRequestDateStatus(transcript) === "too_old") {
        return {
          reply:
            "That movie request is more than 1 year old, so I cannot create a theatre booking for it. Please pick a movie/date within the last year or an upcoming show.",
          widget: buildDatePickerWidget(optionKey),
          usedWebSearch: false,
        };
      }

      const webResults = await searchWeb(searchQuery);
      const theatreResults = await searchWeb(
        buildNearbyTheatreSearchQuery(transcript, clientContext)
      );
      const demoMovieOptions = buildDemoMovieOptions(
        theatreResults.length ? theatreResults : webResults,
        bookingContext
      );

      return {
        reply:
          "This movie is within the CollabX demo booking window, so I found nearby theatre options and generated available show slots. Choose one to continue.",
        widget: {
          type: "mcq",
          options: demoMovieOptions,
        },
        usedWebSearch: webResults.length > 0 || theatreResults.length > 0,
      };
    }

    const webResults = await searchWeb(searchQuery);

    if (!hasLiveAvailabilityProof(optionKey, webResults, bookingContext)) {
      return {
        reply: getUnavailableReply(optionKey),
        widget: {
          type: "input",
        },
        usedWebSearch: webResults.length > 0,
      };
    }

    const realOptions = buildRealBookingOptions(optionKey, webResults, bookingContext);

    if (!realOptions.length) {
      return {
        reply:
          localTicketModes.has(optionKey)
            ? getUnavailableReply(optionKey)
            : "I collected the details, but I could not fetch reliable live options right now. Please try again in a moment.",
        widget: { type: "input" },
        usedWebSearch: webResults.length > 0,
      };
    }

    const optionNoun =
      optionKey === "movie"
        ? "nearby theatre options"
        : optionKey === "hotel"
          ? "real hotel options"
          : optionKey === "event"
            ? "real venue options"
            : `real ${optionKey} options`;

    return {
      reply: `I checked live results and found these ${optionNoun}. Choose one to continue. The booking after this is a CollabX demo booking.`,
      widget: {
        type: "mcq",
        options: realOptions,
      },
      usedWebSearch: true,
    };
  }

  return {
    reply: `I found the best ${detectedIntent.label.toLowerCase()} options for this demo flow. Choose one to continue.`,
    widget: {
      type: "mcq",
      options: bookingOptionCopy[optionKey] || bookingOptionCopy.event,
    },
  };
};

const parseActionWidget = (aiReply = "") => {
  let cleanReply = aiReply;
  let widget = null;

  const actionPattern = /\[ACTION:(INPUT|DATE_PICKER|MCQ|SEAT_SELECTION|SUMMARY)(?:\|([\s\S]*?))?\]/i;
  const actionMatch = aiReply.match(actionPattern);

  if (!actionMatch) {
    return {
      cleanReply,
      widget,
    };
  }

  const action = actionMatch[1].toUpperCase();
  const payload = actionMatch[2] || "";

  if (action === "INPUT") {
    widget = { type: "input" };
  }

  if (action === "DATE_PICKER") {
    const mode = payload.trim().toLowerCase() || "event";
    widget = buildDatePickerWidget(mode);
  }

  if (action === "MCQ") {
    widget = {
      type: "mcq",
      options: payload
        .split("|")
        .map((option) => option.trim())
        .filter(Boolean),
    };
  }

  if (action === "SEAT_SELECTION") {
    widget = {
      type: "seat_selection",
      mode: payload.trim().toLowerCase() || "event",
    };
  }

  if (action === "SUMMARY") {
    widget = {
      type: "summary",
      details: payload
        .split("|")
        .map((detail) => detail.trim())
        .filter(Boolean),
    };
  }

  cleanReply = cleanReply.replace(actionMatch[0], "").trim();

  return {
    cleanReply,
    widget,
  };
};

export const processAIChat =
  async (message, history = [], attachments = [], clientContext = {}) => {
    const cleanMessage =
      String(message || "").trim();

    let finalPrompt = cleanMessage;

    const detectedIntent =
      inferConversationIntent(
        cleanMessage,
        history,
        detectIntent(cleanMessage)
      );

    if (isTravelRequestWithoutMode(cleanMessage)) {
      return {
        reply:
          "Got it. Which mode of travel should I book for this route?",
        widget: {
          type: "mcq",
          options: [
            "Flight tickets",
            "Train tickets",
            "Bus tickets",
          ],
        },
        intent: {
          ...detectedIntent,
          intent: "travel_booking",
          label: "Travel booking",
        },
        ticketDraft: buildTicketDraft(cleanMessage, detectedIntent),
        suggestions: [
          "Show flight options",
          "Show train options",
          "Show bus options",
        ],
        usedWebSearch: false,
      };
    }

    if (isGenericTicketBookingRequest(cleanMessage)) {
      return {
        reply:
          "Sure. What kind of ticket should I book?",
        widget: {
          type: "mcq",
          options: [
            "Movie tickets",
            "Flight tickets",
            "Bus or train tickets",
            "Event or concert tickets",
          ],
        },
        intent: {
          ...detectedIntent,
          intent: "booking",
          label: "Booking",
        },
        ticketDraft: buildTicketDraft(cleanMessage, detectedIntent),
        suggestions: getQuickSuggestions(detectedIntent),
        usedWebSearch: false,
      };
    }

    if (
      isTicketCreationRequest(cleanMessage, detectedIntent) ||
      isOngoingTicketFlow(history)
    ) {
      const ticketFlow = buildGuidedTicketResponse(
        cleanMessage,
        history,
        detectedIntent
      );

      return {
        reply: ticketFlow.reply,
        widget: ticketFlow.widget,
        intent: detectedIntent,
        ticketDraft: ticketFlow.ticketDraft,
        suggestions: getQuickSuggestions(detectedIntent),
        usedWebSearch: false,
      };
    }

    if (isBookingIntent(detectedIntent.intent)) {
      const deterministic = await buildDeterministicResponse(
        cleanMessage,
        history,
        detectedIntent,
        clientContext
      );

      return {
        reply: deterministic.reply,
        widget: deterministic.widget,
        intent: detectedIntent,
        ticketDraft: buildTicketDraft(cleanMessage, detectedIntent),
        suggestions: getQuickSuggestions(detectedIntent),
        usedWebSearch: Boolean(deterministic.usedWebSearch),
      };
    }

    // SMART WEB SEARCH DETECTION

    const shouldSearchWeb = detectedIntent.needsWebSearch;

    // WEB SEARCH

    let webResults = [];

    if (shouldSearchWeb) {
      webResults =
        await searchWeb(cleanMessage);

      finalPrompt += `

LIVE WEB SEARCH RESULTS:
${JSON.stringify(webResults)}

Use these results carefully and accurately.
Do not hallucinate.
`;
    } else if (detectedIntent.needsWebSearch) {
      finalPrompt += `

LIVE WEB SEARCH RESULTS:
[]

Live results are unavailable. Give a safe fallback and ask for confirmation before claiming availability.
`;
    }

    const safeAttachments = Array.isArray(attachments)
      ? attachments
          .filter((item) => item?.name)
          .slice(0, 5)
          .map((item) => ({
            name: item.name,
            type: item.type,
            size: item.size,
          }))
      : [];

    finalPrompt = `
USER MESSAGE:
${finalPrompt}

COLLABX TASK CONTEXT:
Answer as the CollabX ticketing/support assistant.
Keep the reply focused on resolving the user's ticketing, booking, payment, refund, cancellation, or support need.
Detected intent: ${detectedIntent.label}
Priority: ${detectedIntent.priority}
Attached files or images: ${JSON.stringify(safeAttachments)}
If the message is outside this scope, politely redirect to CollabX support work.
When details are missing, ask the next 1 to 3 useful questions instead of guessing.
`;

    let aiReply =
      await generateAIResponse(
        finalPrompt,
        history
      );

    const parsed = parseActionWidget(aiReply);
    let widget = parsed.widget;
    let cleanReply = parsed.cleanReply;
    const bookingStage =
      inferBookingStage(cleanMessage, history, detectedIntent);
    const bookingMode =
      bookingModes[detectedIntent.intent] || "event";
    const bookingOptionKey =
      detectedIntent.intent === "hotel_booking"
        ? "hotel"
        : bookingMode;

    // Detect unavailable movies and provide denial response
    if (detectedIntent.intent === "movie_booking" && shouldSearchWeb) {
      const unavailable = detectUnavailableMovies(webResults);
      if (unavailable) {
        cleanReply = "I couldn't find any movies playing today at the nearest location. Would you like to check movies releasing this week, look for streaming options, or try a different booking?";
        widget = {
          type: "mcq",
          options: [
            "Check this week's releases",
            "Look for streaming options",
            "Different booking",
          ],
        };
        // Skip fallback logic for this case
        return {
          reply: cleanReply,
          widget: widget,
          intent: detectedIntent,
          ticketDraft: buildTicketDraft(cleanMessage, detectedIntent),
          suggestions: getQuickSuggestions(detectedIntent),
          usedWebSearch: shouldSearchWeb && webResults.length > 0,
        };
      }
    }

    const shouldUseFallback =
      /AI service unavailable|No response generated/i.test(aiReply) ||
      (isBookingIntent(detectedIntent.intent) && !widget);

    if (shouldUseFallback) {
      const fallback =
        await buildDeterministicResponse(
          cleanMessage,
          history,
          detectedIntent,
          clientContext
        );

      if (/AI service unavailable|No response generated/i.test(aiReply)) {
        cleanReply = fallback.reply;
      } else {
        cleanReply = cleanReply || fallback.reply;
      }
      widget = fallback.widget;
      aiReply = cleanReply;
    }

    // Inject dynamic movie options if returning an MCQ widget for movies
    if (
      widget?.type === "mcq" &&
      detectedIntent.intent === "movie_booking" &&
      shouldSearchWeb
    ) {
      const dynamicOptions = extractMovieOptions(webResults);
      if (dynamicOptions) {
        widget.options = dynamicOptions;
      }
    }

    const ticketDraft = buildTicketDraft(cleanMessage, detectedIntent);

    // If it's a support ticket or refund and we have enough details to generate a draft
    if (
      (detectedIntent.intent === "support_ticket" ||
        detectedIntent.intent === "refund" ||
        detectedIntent.intent === "complaint" ||
        detectedIntent.intent === "payment") &&
      ticketDraft && 
      ticketDraft.summary?.length > 20
    ) {
      widget = {
        type: "ticket_draft",
        draft: ticketDraft
      };
      cleanReply = "I have drafted a support ticket based on your details. You can review and submit it below.";
    }

    if (!cleanReply && !widget) {
      cleanReply = "I am processing your request. Could you provide a bit more context or confirm the details?";
    }

    return {
      reply: cleanReply,
      widget: widget,
      intent: detectedIntent,
      ticketDraft: ticketDraft,
      suggestions: getQuickSuggestions(detectedIntent),
      usedWebSearch: shouldSearchWeb && webResults.length > 0,
    };
  };
