import { generateAIResponse } from "../ai/sarvamClient.js";
import { searchWeb } from "../websearch/tavilySearch.js";
import { buildTicketDraft, detectIntent, getQuickSuggestions } from "./intentService.js";

import { detectUnavailableMovies, extractMovieOptions } from "./movieUtils.js";

const bookingModes = {
  movie_booking: "movie",
  flight_booking: "flight",
  hotel_booking: "event",
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

  const transcript = [...history.map((item) => item.content || ""), message]
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
  const transcript = [...history.map((item) => item.content || ""), message]
    .join(" ")
    .toLowerCase();

  if (/proceed to payment|checkout|pay now/.test(current)) {
    return "payment";
  }

  if (/selected seats|i selected seats|seat\(s\)|please provide the summary/.test(current)) {
    return "summary";
  }

  if (/i select\s+(flight|train|bus|movie|event|concert)\s+tickets?/.test(current)) {
    return "options";
  }

  if (/i select|selected:|choose|option/.test(current)) {
    return "seats";
  }

  const asksBooking =
    isBookingIntent(intent.intent) ||
    /(book|ticket|reserve).*(movie|flight|bus|train|event|concert)/.test(transcript);

  return asksBooking ? "options" : "support";
};

const hasDateHint = (text = "") =>
  /\b(today|tomorrow|tonight|weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}[/-]\d{1,2}|\d{1,2}\s*(am|pm))\b/i.test(text);

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

const getMissingBookingPrompt = (mode, transcript = "", history = [], currentMessage = "") => {
  const text = transcript.toLowerCase();
  const lastBotMessage = history.filter(h => h.role === "assistant").pop()?.content?.toLowerCase() || "";
  const currentText = currentMessage.toLowerCase();

  if (mode === "movie") {
    let hasTitle = hasMovieTitleHint(text);
    if (!hasTitle && lastBotMessage.includes("movie")) {
      if (currentText.length >= 2 && !movieTitleStopWords.test(currentText)) hasTitle = true;
    }
    
    if (!hasTitle) {
      return "Sure. Which movie would you like to watch?";
    }
    if (!hasRouteHint(text) && !/\b(theatre|cinema|pvr|inox|cinepolis|mall|city)\b/i.test(text)) {
      if (lastBotMessage.includes("city") && currentText.length > 2) return null; // Accept user input as city
      return "Got it. Which city or preferred theatre should I search in?";
    }
    if (!hasDateHint(text)) {
      if (lastBotMessage.includes("date") || lastBotMessage.includes("time")) return null; // Accept user input
      return "Which date or show time should I look for?";
    }
  }

  if (["bus", "train", "flight"].includes(mode)) {
    if (!hasRouteHint(text)) {
      if (lastBotMessage.includes("source") || lastBotMessage.includes("destination") || lastBotMessage.includes("from")) {
        if (currentText.length > 2) return null;
      }
      return `Please share the source and destination for the ${mode} booking.`;
    }
    if (!hasDateHint(text)) {
      if (lastBotMessage.includes("date") || lastBotMessage.includes("time") || lastBotMessage.includes("when")) {
        if (currentText.length > 2) return null;
      }
      return "What travel date or time should I use?";
    }
  }

  if (mode === "hotel") {
    if (!hasRouteHint(text) && !/\b(in|near)\s+[a-z ]{3,}/i.test(text)) {
      if (lastBotMessage.includes("city") || lastBotMessage.includes("area")) {
        if (currentText.length > 2) return null;
      }
      return "Which city or area should I search hotels in?";
    }
    if (!hasStayHint(text) && !hasDateHint(text)) {
      if (lastBotMessage.includes("date") || lastBotMessage.includes("night")) {
        if (currentText.length > 1) return null;
      }
      return "Please share the check-in date and number of nights.";
    }
  }

  if (mode === "event") {
    if (!hasEventHint(text)) {
      if (lastBotMessage.includes("event") || lastBotMessage.includes("concert") || lastBotMessage.includes("venue")) {
        if (currentText.length > 2) return null;
      }
      return "Which event, concert, or venue should I book for?";
    }
    if (!hasDateHint(text)) {
      if (lastBotMessage.includes("date") || lastBotMessage.includes("time")) {
        if (currentText.length > 2) return null;
      }
      return "Which date or time slot should I use?";
    }
  }

  return null;
};

const buildDeterministicResponse = (message, history, detectedIntent) => {
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
    return {
      reply: "Nice choice. Pick your preferred seat or slot to lock the booking draft.",
      widget: { type: "seat_selection", mode },
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
    const missingPrompt = getMissingBookingPrompt(optionKey, transcript, history, message);

    if (missingPrompt) {
      return {
        reply: missingPrompt,
        widget: { type: "input" },
      };
    }
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

  const actionPattern = /\[ACTION:(INPUT|MCQ|SEAT_SELECTION|SUMMARY)(?:\|([\s\S]*?))?\]/i;
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
  async (message, history = [], attachments = []) => {
    const cleanMessage =
      String(message || "").trim();

    let finalPrompt = cleanMessage;

    const lower =
      cleanMessage.toLowerCase();

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

    // SMART WEB SEARCH DETECTION

    const webTriggers = [
      "latest",
      "today",
      "news",
      "current",
      "trending",
      "movie",
      "movies",
      "flight",
      "flights",
      "hotel",
      "weather",
      "score",
      "release",
      "price",
      "booking",
      "tickets",
      "showtimes",
      "restaurants",
      "events",
      "concert",
      "nearby",
      "availability",
    ];

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
        buildDeterministicResponse(
          cleanMessage,
          history,
          detectedIntent
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
      (detectedIntent.intent === "support_ticket" || detectedIntent.intent === "refund") &&
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
