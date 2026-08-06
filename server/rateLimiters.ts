import rateLimit from "express-rate-limit";

/**
 * Scraper: 5 job starts / min per IP.
 * Each job triggers expensive external API calls — keep this tight.
 */
export const scraperLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many scraping requests — please wait before starting another job." },
});

/**
 * AI processing: 15 approve actions / min per IP.
 * Each approval triggers an OpenAI call (summarize + classify).
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many AI processing requests — please slow down." },
});
