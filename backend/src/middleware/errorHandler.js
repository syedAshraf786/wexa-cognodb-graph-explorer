export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
}

export function errorHandler(err, req, res, _next) {
  console.error('[API Error]', err.message);

  if (err.code === 'SERVICE_UNAVAILABLE' || err.message?.includes('CognoDB')) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Graph database is currently unavailable.',
    });
  }

  if (err.statusCode === 404 || err.code === 'NOT_FOUND') {
    return res.status(404).json({
      error: 'Not Found',
      message: err.message || 'Resource not found',
    });
  }

  if (err.statusCode === 400 || err.code === 'BAD_REQUEST') {
    return res.status(400).json({
      error: 'Bad Request',
      message: err.message || 'Invalid request',
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred.',
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
