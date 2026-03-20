const rateLimitConfig = {
  windowMs: 1 * 60 * 1000, // 1 minutes
  limit: 10, // 100 requests per window per client
  standardHeaders: "draft-6", // Use RateLimit-* headers
  keyGenerator: (c) => c.req.header("x-forwarded-for") || "unknown", // Identify clients by IP
};

export { rateLimitConfig };
