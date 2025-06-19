import { HTTPException } from './chunk-NYN7KFXL.js';

// src/server/handlers/error.ts
function handleError(error, defaultMessage) {
  const apiError = error;
  throw new HTTPException(apiError.status || 500, {
    message: apiError.message || defaultMessage
  });
}

export { handleError };
