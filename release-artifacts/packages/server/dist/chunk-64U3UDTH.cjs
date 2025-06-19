'use strict';

var chunkOCWPVYNI_cjs = require('./chunk-OCWPVYNI.cjs');

// src/server/handlers/error.ts
function handleError(error, defaultMessage) {
  const apiError = error;
  throw new chunkOCWPVYNI_cjs.HTTPException(apiError.status || 500, {
    message: apiError.message || defaultMessage
  });
}

exports.handleError = handleError;
