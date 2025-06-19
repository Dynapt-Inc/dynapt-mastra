'use strict';

var chunk57CJTIPW_cjs = require('./chunk-57CJTIPW.cjs');
var chunk64U3UDTH_cjs = require('./chunk-64U3UDTH.cjs');
var chunkOCWPVYNI_cjs = require('./chunk-OCWPVYNI.cjs');
var chunk75ZPJI57_cjs = require('./chunk-75ZPJI57.cjs');
var stream = require('stream');

// src/server/handlers/voice.ts
var voice_exports = {};
chunk75ZPJI57_cjs.__export(voice_exports, {
  generateSpeechHandler: () => generateSpeechHandler,
  getListenerHandler: () => getListenerHandler,
  getSpeakersHandler: () => getSpeakersHandler,
  transcribeSpeechHandler: () => transcribeSpeechHandler
});
async function getSpeakersHandler({ mastra, agentId }) {
  try {
    if (!agentId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Agent ID is required" });
    }
    const agent = mastra.getAgent(agentId);
    if (!agent) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Agent not found" });
    }
    const voice = await agent.getVoice();
    if (!voice) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Agent does not have voice capabilities" });
    }
    const speakers = await voice.getSpeakers();
    return speakers;
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error getting speakers");
  }
}
async function generateSpeechHandler({
  mastra,
  agentId,
  body
}) {
  try {
    if (!agentId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Agent ID is required" });
    }
    chunk57CJTIPW_cjs.validateBody({
      text: body?.text
    });
    const agent = mastra.getAgent(agentId);
    if (!agent) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Agent not found" });
    }
    const voice = await agent.getVoice();
    if (!voice) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Agent does not have voice capabilities" });
    }
    const audioStream = await voice.speak(body.text, { speaker: body.speakerId });
    if (!audioStream) {
      throw new chunkOCWPVYNI_cjs.HTTPException(500, { message: "Failed to generate speech" });
    }
    return audioStream;
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error generating speech");
  }
}
async function transcribeSpeechHandler({
  mastra,
  agentId,
  body
}) {
  try {
    if (!agentId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Agent ID is required" });
    }
    if (!body?.audioData) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Audio data is required" });
    }
    const agent = mastra.getAgent(agentId);
    if (!agent) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Agent not found" });
    }
    const voice = await agent.getVoice();
    if (!voice) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Agent does not have voice capabilities" });
    }
    const audioStream = new stream.Readable();
    audioStream.push(body.audioData);
    audioStream.push(null);
    const text = await voice.listen(audioStream, body.options);
    return { text };
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error transcribing speech");
  }
}
async function getListenerHandler({ mastra, agentId }) {
  try {
    if (!agentId) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Agent ID is required" });
    }
    const agent = mastra.getAgent(agentId);
    if (!agent) {
      throw new chunkOCWPVYNI_cjs.HTTPException(404, { message: "Agent not found" });
    }
    const voice = await agent.getVoice();
    if (!voice) {
      throw new chunkOCWPVYNI_cjs.HTTPException(400, { message: "Agent does not have voice capabilities" });
    }
    const listeners = await voice.getListener();
    return listeners;
  } catch (error) {
    return chunk64U3UDTH_cjs.handleError(error, "Error getting listeners");
  }
}

exports.generateSpeechHandler = generateSpeechHandler;
exports.getListenerHandler = getListenerHandler;
exports.getSpeakersHandler = getSpeakersHandler;
exports.transcribeSpeechHandler = transcribeSpeechHandler;
exports.voice_exports = voice_exports;
