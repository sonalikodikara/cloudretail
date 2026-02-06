export function errorHandler(err, req, res, next) {
  const status = err?.statusCode || 502;

  res.status(status).json({
    message: "Gateway error",
    error: err?.message || "Bad Gateway",
    requestId: req.requestId,
  });
}
