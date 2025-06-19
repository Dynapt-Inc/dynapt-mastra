#!/usr/bin/env node
import { fromPackageRoot, prepare, getMatchingPaths } from './chunk-P5AHYMUI.js';
import * as fs from 'fs';
import { existsSync, mkdirSync } from 'fs';
import * as os2 from 'os';
import os2__default from 'os';
import * as path3 from 'path';
import path3__default from 'path';
import fs3 from 'fs/promises';
import { MCPServer } from '@mastra/mcp';
import { JSDOM } from 'jsdom';
import { z } from 'zod';

var writeErrorLog = (message, data) => {
  const now = /* @__PURE__ */ new Date();
  const timestamp = now.toISOString();
  const hourTimestamp = timestamp.slice(0, 13);
  const logMessage = {
    timestamp,
    message,
    ...data ? typeof data === "object" ? data : { data } : {}
  };
  try {
    const cacheDir = path3.join(os2.homedir(), ".cache", "mastra", "mcp-docs-server-logs");
    fs.mkdirSync(cacheDir, { recursive: true });
    const logFile = path3.join(cacheDir, `${hourTimestamp}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logMessage) + "\n", "utf8");
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
};
function createLogger(server2) {
  const sendLog = async (level, message, data) => {
    if (!server2) return;
    try {
      const sdkServer = server2.getServer();
      if (!sdkServer) return;
      await sdkServer.sendLoggingMessage({
        level,
        data: {
          message,
          ...data ? typeof data === "object" ? data : { data } : {}
        }
      });
    } catch (error) {
      if (error instanceof Error && (error.message === "Not connected" || error.message.includes("does not support logging") || error.message.includes("Connection closed"))) {
        return;
      }
      console.error(`Failed to send ${level} log:`, error instanceof Error ? error.message : error);
    }
  };
  return {
    info: async (message, data) => {
      await sendLog("info", message, data);
    },
    warning: async (message, data) => {
      await sendLog("warning", message, data);
    },
    error: async (message, error) => {
      const errorData = error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error;
      writeErrorLog(message, errorData);
      await sendLog("error", message, errorData);
    },
    debug: async (message, data) => {
      if (process.env.DEBUG || process.env.NODE_ENV === "development") {
        await sendLog("debug", message, data);
      }
    }
  };
}
var logger = createLogger();
var BLOG_BASE_URL = process.env.BLOG_URL || "https://mastra.ai";
async function fetchBlogPosts() {
  void logger.debug("Fetching list of blog posts");
  const response = await fetch(`${BLOG_BASE_URL}/blog`);
  if (!response.ok) {
    throw new Error("Failed to fetch blog posts");
  }
  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const blogLinks = Array.from(document.querySelectorAll('a[href^="/blog/"]')).filter((link) => {
    const href = link.getAttribute("href");
    return href !== "/blog" && !href?.includes("authors");
  }).map((link) => {
    const h2 = link.querySelector("h2");
    const title = h2?.textContent?.trim();
    const href = link.getAttribute("href");
    if (title && href) {
      return `[${title}](${href})`;
    }
    return null;
  }).filter(Boolean);
  return "Mastra.ai Blog Posts:\n\n" + blogLinks.join("\n");
}
async function fetchBlogPost(url) {
  void logger.debug(`Fetching blog post: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit exceeded");
    }
    let blogList;
    try {
      const blogPosts = await fetchBlogPosts();
      blogList = `Here are available blog posts:

${blogPosts}`;
    } catch (e) {
      void logger.error(
        `Blog post not found or failed to fetch: ${url}, and failed to fetch blog post listing as fallback.`,
        e
      );
      blogList = "Additionally, the list of available blog posts could not be fetched at this time.";
    }
    return `The requested blog post could not be found or fetched: ${url}

${blogList}`;
  }
  const html = await response.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const scripts = document.querySelectorAll("script");
  scripts.forEach((script) => script.remove());
  const content = document.body.textContent?.trim() || "";
  if (!content) {
    throw new Error("No content found in blog post");
  }
  return content;
}
var blogInputSchema = z.object({
  url: z.string().describe(
    "URL of a specific blog post to fetch. If the string /blog is passed as the url it returns a list of all blog posts."
  )
});
var blogTool = {
  name: "mastraBlog",
  description: "Get Mastra.ai blog content. Without a URL, returns a list of all blog posts. With a URL, returns the specific blog post content in markdown format. The blog contains changelog posts as well as announcements and posts about Mastra features and AI news",
  parameters: blogInputSchema,
  execute: async (args) => {
    void logger.debug("Executing mastraBlog tool", { url: args.url });
    try {
      let content;
      if (args.url !== `/blog`) {
        content = await fetchBlogPost(`${BLOG_BASE_URL}${args.url}`);
      } else {
        content = await fetchBlogPosts();
      }
      return content;
    } catch (error) {
      void logger.error("Failed to execute mastraBlog tool", error);
      throw error;
    }
  }
};
function encodePackageName(name) {
  return encodeURIComponent(name);
}
function decodePackageName(name) {
  return decodeURIComponent(name);
}
var changelogsDir = fromPackageRoot(".docs/organized/changelogs");
async function listPackageChangelogs() {
  void logger.debug("Listing package changelogs");
  try {
    const files = await fs3.readdir(changelogsDir);
    return files.filter((f) => f.endsWith(".md")).map((f) => ({
      name: decodePackageName(f.replace(".md", "")),
      path: f
    })).sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}
async function readPackageChangelog(filename) {
  const encodedName = encodePackageName(filename.replace(".md", ""));
  const filePath = path3__default.join(changelogsDir, `${encodedName}.md`);
  void logger.debug(`Reading changelog: ${filename}`);
  try {
    return await fs3.readFile(filePath, "utf-8");
  } catch {
    const packages = await listPackageChangelogs();
    const availablePackages = packages.map((pkg) => `- ${pkg.name}`).join("\n");
    return `Changelog for "${filename.replace(".md", "")}" not found.

Available packages:
${availablePackages}`;
  }
}
var initialPackages = await listPackageChangelogs();
var packagesListing = initialPackages.length > 0 ? "\n\nAvailable packages: " + initialPackages.map((pkg) => pkg.name).join(", ") : "\n\nNo package changelogs available yet. Run the documentation preparation script first.";
var changesInputSchema = z.object({
  package: z.string().optional().describe("Name of the specific package to fetch changelog for. If not provided, lists all available packages.")
});
var changesTool = {
  name: "mastraChanges",
  description: `Get changelog information for Mastra.ai packages. ${packagesListing}`,
  parameters: changesInputSchema,
  execute: async (args) => {
    void logger.debug("Executing mastraChanges tool", { package: args.package });
    try {
      if (!args.package) {
        const packages = await listPackageChangelogs();
        const content2 = ["Available package changelogs:", "", ...packages.map((pkg) => `- ${pkg.name}`)].join("\n");
        return content2;
      }
      const content = await readPackageChangelog(args.package);
      return content;
    } catch (error) {
      void logger.error("Failed to execute mastraChanges tool", error);
      throw error;
    }
  }
};
var _courseLessonSchema = z.object({
  lessonName: z.string().describe("Name of the specific lesson to start. It must match the exact lesson name.")
});
var _confirmationSchema = z.object({
  confirm: z.boolean().optional().describe("Set to true to confirm this action")
});
var courseDir = fromPackageRoot(".docs/raw/course");
var introductionPrompt = `
This is a course to help a new user learn about Mastra, the open-source AI Agent framework built in Typescript.
The following is the introduction content, please provide this text to the user EXACTLY as written below. Do not provide any other text or instructions:

# Welcome to the Mastra Course!

Thank you for registering for the Mastra course! This interactive guide will help you learn how to build powerful AI agents with Mastra, the open-source AI Agent framework built in TypeScript.

## Before We Begin

If you enjoy Mastra, please consider starring the GitHub repository:
https://github.com/mastra-ai/mastra

This helps the project grow and reach more developers like you!

## How This Course Works

- Each lesson is broken into multiple steps
- I'll guide you through the code examples and explanations
- You can ask questions at any time
- If you ever leave and come back, use the \`startMastraCourse\` tool to pick up where you left off. Just ask to "start the Mastra course".
- Use the \`nextMastraCourseStep\` tool to move to the next step when you're ready. Just ask to "move to the next step" when you are ready.
- Use the \`getMastraCourseStatus\` tool to check your progress. You can just ask "get my course progress".
- Use the \`clearMastraCourseHistory\` tool to reset your progress and start over. You can just ask "clear my course progress".

Type "start mastra course" and let's get started with your first lesson!
`;
var lessonPrompt = `
  This is a course to help a new user learn about Mastra, the open-source AI Agent framework built in Typescript.
  Please help the user through the steps of the course by walking them through the content and following the course
  to write the initial version of the code for them. The goal is to show them how the code works and explain it as they go
  as the course goes on. Each lesson is broken up into steps. You should return the content of the step and ask the user
  to move to the next step when they are ready. If the step contains instructions to write code, you should write the code
  for the user when possible. You should always briefly explain the step before writing the code. Please ensure to 
  return any text in markdown blockquotes exactly as written in your response. When the user ask about their course progress or course status,
  make sure to include the course status url in your response. This is important.
`;
function wrapContentInPrompt(content, _isFirstStep = false) {
  let wrappedContent = `${lessonPrompt}

Here is the content for this step: <StepContent>${content}</StepContent>`;
  return `${wrappedContent}

When you're ready to continue, use the \`nextMastraCourseStep\` tool to move to the next step.`;
}
async function getDeviceIdPath() {
  const cacheDir = path3__default.join(os2__default.homedir(), ".cache", "mastra");
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }
  return path3__default.join(cacheDir, ".device_id");
}
async function getDeviceCredentials() {
  try {
    const deviceIdPath = await getDeviceIdPath();
    if (!existsSync(deviceIdPath)) {
      return null;
    }
    const fileContent = await fs3.readFile(deviceIdPath, "utf-8");
    const parsed = JSON.parse(fileContent);
    if (typeof parsed.deviceId === "string" && typeof parsed.key === "string") {
      return { deviceId: parsed.deviceId, key: parsed.key };
    }
    return null;
  } catch {
    return null;
  }
}
async function getDeviceId() {
  const creds = await getDeviceCredentials();
  if (!creds || !creds?.deviceId) {
    return null;
  }
  return creds.deviceId;
}
async function saveDeviceCredentials(deviceId, key) {
  const deviceIdPath = await getDeviceIdPath();
  const toWrite = JSON.stringify({ deviceId, key });
  await fs3.writeFile(deviceIdPath, toWrite, "utf-8");
  await fs3.chmod(deviceIdPath, 384);
}
async function registerUser(email) {
  const response = await fetch("https://mastra.ai/api/course/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email })
  });
  if (!response.ok) {
    throw new Error(`Registration failed with status ${response.status}: ${response.statusText}`);
  }
  return response.json();
}
async function readCourseStep(lessonName, stepName, _isFirstStep = false) {
  const lessonDirs = await fs3.readdir(courseDir);
  const lessonDir = lessonDirs.find((dir) => dir.replace(/^\d+-/, "") === lessonName);
  if (!lessonDir) {
    throw new Error(`Lesson "${lessonName}" not found.`);
  }
  const lessonPath = path3__default.join(courseDir, lessonDir);
  const files = await fs3.readdir(lessonPath);
  const stepFile = files.find((f) => f.endsWith(".md") && f.replace(/^\d+-/, "").replace(".md", "") === stepName);
  if (!stepFile) {
    throw new Error(`Step "${stepName}" not found in lesson "${lessonName}".`);
  }
  const filePath = path3__default.join(courseDir, lessonDir, stepFile);
  try {
    const content = await fs3.readFile(filePath, "utf-8");
    return wrapContentInPrompt(content);
  } catch (error) {
    throw new Error(`Failed to read step "${stepName}" in lesson "${lessonName}": ${error}`);
  }
}
async function updateCourseStateOnServer(deviceId, state) {
  const creds = await getDeviceCredentials();
  if (!creds) {
    throw new Error("Device credentials not found.");
  }
  const response = await fetch("https://mastra.ai/api/course/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-mastra-course-key": creds.key
    },
    body: JSON.stringify({
      id: creds.deviceId,
      state
    })
  });
  if (!response.ok) {
    throw new Error(`Course state update failed with status ${response.status}: ${response.statusText}`);
  }
}
async function saveCourseState(state, deviceId) {
  if (!deviceId) {
    throw new Error("Cannot save course state: User is not registered");
  }
  const statePath = await getCourseStatePath();
  try {
    await fs3.writeFile(statePath, JSON.stringify(state, null, 2), "utf-8");
    try {
      const creds = await getDeviceCredentials();
      if (!creds) throw new Error("Device credentials not found");
      await updateCourseStateOnServer(creds.deviceId, state);
    } catch {
    }
  } catch (error) {
    throw new Error(`Failed to save course state: ${error}`);
  }
}
async function getCourseStatePath() {
  const stateDirPath = path3__default.join(os2__default.homedir(), ".cache", "mastra", "course");
  if (!existsSync(stateDirPath)) {
    mkdirSync(stateDirPath, { recursive: true });
  }
  return path3__default.join(stateDirPath, "state.json");
}
async function loadCourseState() {
  const statePath = await getCourseStatePath();
  try {
    if (existsSync(statePath)) {
      const stateData = await fs3.readFile(statePath, "utf-8");
      return JSON.parse(stateData);
    }
  } catch (error) {
    throw new Error(`Failed to load course state: ${error}`);
  }
  return null;
}
async function scanCourseContent() {
  const lessonDirs = await fs3.readdir(courseDir);
  const lessons = await Promise.all(
    lessonDirs.filter((dir) => !dir.startsWith(".")).sort((a, b) => a.localeCompare(b)).map(async (lessonDir) => {
      const lessonPath = path3__default.join(courseDir, lessonDir);
      const lessonStats = await fs3.stat(lessonPath);
      if (!lessonStats.isDirectory()) return null;
      const lessonName = lessonDir.replace(/^\d+-/, "");
      const stepFiles = (await fs3.readdir(lessonPath)).filter((file) => file.endsWith(".md")).sort((a, b) => a.localeCompare(b));
      const steps = await Promise.all(
        stepFiles.map(async (file) => {
          const stepName = file.replace(/^\d+-/, "").replace(".md", "");
          return {
            name: stepName,
            status: 0
            // Default: not started
          };
        })
      );
      return {
        name: lessonName,
        status: 0,
        // Default: not started
        steps: steps.filter(Boolean)
      };
    })
  );
  const validLessons = lessons.filter((lesson) => lesson !== null);
  return {
    currentLesson: validLessons.length > 0 ? validLessons[0].name : "",
    lessons: validLessons
  };
}
async function mergeCourseStates(currentState, newState) {
  const existingLessonMap = new Map(currentState.lessons.map((lesson) => [lesson.name, lesson]));
  const mergedLessons = newState.lessons.map((newLesson) => {
    const existingLesson = existingLessonMap.get(newLesson.name);
    if (!existingLesson) {
      return newLesson;
    }
    const existingStepMap = new Map(existingLesson.steps.map((step) => [step.name, step]));
    const mergedSteps = newLesson.steps.map((newStep) => {
      const existingStep = existingStepMap.get(newStep.name);
      if (existingStep) {
        return {
          ...newStep,
          status: existingStep.status
        };
      }
      return newStep;
    });
    let lessonStatus = existingLesson.status;
    if (mergedSteps.every((step) => step.status === 2)) {
      lessonStatus = 2;
    } else if (mergedSteps.some((step) => step.status > 0)) {
      lessonStatus = 1;
    }
    return {
      ...newLesson,
      status: lessonStatus,
      steps: mergedSteps
    };
  });
  let currentLesson = currentState.currentLesson;
  if (!mergedLessons.some((lesson) => lesson.name === currentLesson) && mergedLessons.length > 0) {
    currentLesson = mergedLessons[0].name;
  }
  return {
    currentLesson,
    lessons: mergedLessons
  };
}
var startMastraCourse = {
  name: "startMastraCourse",
  description: "Starts the Mastra Course. If the user is not registered, they will be prompted to register first. Otherwise, it will start at the first lesson or pick up where they last left off. ALWAYS ask the user for their email address if they are not registered. DO NOT assume their email address, they must confirm their email and that they want to register.",
  parameters: z.object({
    email: z.string().email().optional().describe("Email address for registration if not already registered. ")
  }),
  execute: async (args) => {
    try {
      const creds = await getDeviceCredentials();
      const registered = creds !== null;
      let deviceId = creds?.deviceId ?? null;
      if (!registered) {
        if (!args.email) {
          return "To start the Mastra Course, you need to register first. Please provide your email address by calling this tool again with the email parameter.";
        }
        try {
          const response = await registerUser(args.email);
          if (response.success) {
            await saveDeviceCredentials(response.id, response.key);
            deviceId = response.id;
          } else {
            return `Registration failed: ${response.message}. Please try again with a valid email address.`;
          }
        } catch (error) {
          return `Failed to register: ${error instanceof Error ? error.message : String(error)}. Please try again later.`;
        }
      }
      let courseState = await loadCourseState();
      let statusMessage = "";
      const latestCourseState = await scanCourseContent();
      if (!latestCourseState.lessons.length) {
        return "No course content found. Please make sure the course content is properly set up in the .docs/course/lessons directory.";
      }
      if (courseState) {
        const previousState = JSON.parse(JSON.stringify(courseState));
        courseState = await mergeCourseStates(courseState, latestCourseState);
        const newLessons = latestCourseState.lessons.filter(
          (newLesson) => !previousState.lessons.some((oldLesson) => oldLesson.name === newLesson.name)
        );
        if (newLessons.length > 0) {
          statusMessage = `\u{1F4DA} Course content has been updated! ${newLessons.length} new lesson(s) have been added:
`;
          statusMessage += newLessons.map((lesson) => `- ${lesson.name}`).join("\n");
          statusMessage += "\n\n";
        }
        await saveCourseState(courseState, deviceId);
      } else {
        courseState = latestCourseState;
        await saveCourseState(courseState, deviceId);
        if (!registered && args.email) {
          return introductionPrompt;
        }
      }
      const currentLessonName = courseState.currentLesson;
      const currentLesson = courseState.lessons.find((lesson) => lesson.name === currentLessonName);
      if (!currentLesson) {
        return "Error: Current lesson not found in course content. Please try again or reset your course progress.";
      }
      const currentStep = currentLesson.steps.find((step) => step.status !== 2);
      if (!currentStep && currentLesson.status !== 2) {
        currentLesson.status = 2;
        await saveCourseState(courseState, deviceId);
        const nextLesson = courseState.lessons.find((lesson) => lesson.status !== 2 && lesson.name !== currentLessonName);
        if (nextLesson) {
          courseState.currentLesson = nextLesson.name;
          await saveCourseState(courseState, deviceId);
          return `${statusMessage}\u{1F389} You've completed the "${currentLessonName}" lesson!

Moving on to the next lesson: "${nextLesson.name}".

Use the \`nextMastraCourseStep\` tool to start the first step of this lesson.`;
        } else {
          return `${statusMessage}\u{1F389} Congratulations! You've completed all available lessons in the Mastra Course!

If you'd like to review any lesson, use the \`startMastraCourseLesson\` tool with the lesson name.`;
        }
      }
      if (!currentStep) {
        return `${statusMessage}Error: No incomplete steps found in the current lesson. Please try another lesson or reset your course progress.`;
      }
      currentStep.status = 1;
      if (currentLesson.status === 0) {
        currentLesson.status = 1;
      }
      await saveCourseState(courseState, deviceId);
      const stepContent = await readCourseStep(currentLessonName, currentStep.name);
      return `\u{1F4D8} Lesson: ${currentLessonName}
\u{1F4DD} Step: ${currentStep.name}

${stepContent}

When you've completed this step, use the \`nextMastraCourseStep\` tool to continue.`;
    } catch (error) {
      return `Error starting the Mastra course: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
};
var getMastraCourseStatus = {
  name: "getMastraCourseStatus",
  description: "Gets the current status of the Mastra Course, including which lessons and steps have been completed",
  parameters: z.object({}),
  execute: async (_args) => {
    try {
      const deviceId = await getDeviceId();
      if (deviceId === null) {
        return "You need to register for the Mastra Course first. Please use the `startMastraCourse` tool to register.";
      }
      const courseState = await loadCourseState();
      if (!courseState) {
        return "No course progress found. Please start the course first using the `startMastraCourse` tool.";
      }
      const latestCourseState = await scanCourseContent();
      if (!latestCourseState.lessons.length) {
        return "No course content found. Please make sure the course content is properly set up in the .docs/course/lessons directory.";
      }
      const mergedState = await mergeCourseStates(courseState, latestCourseState);
      let statusReport = "# Mastra Course Progress\n\n";
      const totalLessons = mergedState.lessons.length;
      const completedLessons = mergedState.lessons.filter((lesson) => lesson.status === 2).length;
      mergedState.lessons.filter((lesson) => lesson.status === 1).length;
      const totalSteps = mergedState.lessons.reduce((sum, lesson) => sum + lesson.steps.length, 0);
      const completedSteps = mergedState.lessons.reduce(
        (sum, lesson) => sum + lesson.steps.filter((step) => step.status === 2).length,
        0
      );
      statusReport += `## Overall Progress
`;
      statusReport += `- Course status Url: **https://mastra.ai/course/${deviceId}**
`;
      statusReport += `- Current Lesson: **${mergedState.currentLesson}**
`;
      statusReport += `- Lessons: ${completedLessons}/${totalLessons} completed (${Math.round(completedLessons / totalLessons * 100)}%)
`;
      statusReport += `- Steps: ${completedSteps}/${totalSteps} completed (${Math.round(completedSteps / totalSteps * 100)}%)

`;
      statusReport += `## Lesson Details

`;
      mergedState.lessons.forEach((lesson, lessonIndex) => {
        let lessonStatusIcon = "\u2B1C";
        if (lesson.status === 1) lessonStatusIcon = "\u{1F536}";
        if (lesson.status === 2) lessonStatusIcon = "\u2705";
        const isCurrent = lesson.name === mergedState.currentLesson;
        const lessonPrefix = isCurrent ? "\u{1F449} " : "";
        statusReport += `### ${lessonPrefix}${lessonIndex + 1}. ${lessonStatusIcon} ${lesson.name}

`;
        lesson.steps.forEach((step, stepIndex) => {
          let stepStatusIcon = "\u2B1C";
          if (step.status === 1) stepStatusIcon = "\u{1F536}";
          if (step.status === 2) stepStatusIcon = "\u2705";
          statusReport += `- ${stepStatusIcon} Step ${stepIndex + 1}: ${step.name}
`;
        });
        statusReport += "\n";
      });
      statusReport += `## Navigation

`;
      statusReport += `- To continue the course: \`nextMastraCourseStep\`
`;
      statusReport += `- To start a specific lesson: \`startMastraCourseLesson\`
`;
      statusReport += `- To reset progress: \`clearMastraCourseHistory\`
`;
      return `Course Status: ${statusReport}

Course status url: https://mastra.ai/course/${deviceId}`;
    } catch (error) {
      return `Error getting course status: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
};
var startMastraCourseLesson = {
  name: "startMastraCourseLesson",
  description: "Starts a specific lesson in the Mastra Course. If the lesson has been started before, it will resume from the first incomplete step",
  parameters: _courseLessonSchema,
  execute: async (args) => {
    try {
      const deviceId = await getDeviceId();
      if (deviceId === null) {
        return "You need to register for the Mastra Course first. Please use the `startMastraCourse` tool to register.";
      }
      let courseState = await loadCourseState();
      if (!courseState) {
        return "No course progress found. Please start the course first using the `startMastraCourse` tool.";
      }
      const targetLessonName = args.lessonName;
      const targetLesson = courseState.lessons.find((lesson) => lesson.name === targetLessonName);
      if (!targetLesson) {
        const availableLessons = courseState.lessons.map((lesson, index) => `${index + 1}. ${lesson.name}`).join("\n");
        return `Lesson "${targetLessonName}" not found. Available lessons:
${availableLessons}`;
      }
      courseState.currentLesson = targetLesson.name;
      const firstIncompleteStep = targetLesson.steps.find((step) => step.status !== 2) || targetLesson.steps[0];
      if (!firstIncompleteStep) {
        return `The lesson "${targetLesson.name}" does not have any steps.`;
      }
      firstIncompleteStep.status = 1;
      if (targetLesson.status === 0) {
        targetLesson.status = 1;
      }
      await saveCourseState(courseState, deviceId);
      const stepContent = await readCourseStep(targetLesson.name, firstIncompleteStep.name);
      return `\u{1F4D8} Starting Lesson: ${targetLesson.name}
\u{1F4DD} Step: ${firstIncompleteStep.name}

${stepContent}

When you've completed this step, use the \`nextMastraCourseStep\` tool to continue.`;
    } catch (error) {
      return `Error starting course lesson: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
};
var nextMastraCourseStep = {
  name: "nextMastraCourseStep",
  description: "Advances to the next step in the current Mastra Course lesson. If all steps in the current lesson are completed, it will move to the next lesson",
  parameters: z.object({}),
  execute: async (_args) => {
    try {
      const deviceId = await getDeviceId();
      if (deviceId === null) {
        return "You need to register for the Mastra Course first. Please use the `startMastraCourse` tool to register.";
      }
      const courseState = await loadCourseState();
      if (!courseState) {
        return "No course progress found. Please start the course first using the `startMastraCourse` tool.";
      }
      const currentLessonName = courseState.currentLesson;
      const currentLesson = courseState.lessons.find((lesson) => lesson.name === currentLessonName);
      if (!currentLesson) {
        return "Error: Current lesson not found in course content. Please try again or reset your course progress.";
      }
      const currentStepIndex = currentLesson.steps.findIndex((step) => step.status === 1);
      if (currentStepIndex === -1) {
        return "No step is currently in progress. Please start a step first using the `startMastraCourse` tool.";
      }
      currentLesson.steps[currentStepIndex].status = 2;
      const nextStepIndex = currentLesson.steps.findIndex(
        (step, index) => index > currentStepIndex && step.status !== 2
      );
      if (nextStepIndex !== -1) {
        currentLesson.steps[nextStepIndex].status = 1;
        await saveCourseState(courseState, deviceId);
        const nextStep = currentLesson.steps[nextStepIndex];
        const stepContent = await readCourseStep(currentLessonName, nextStep.name);
        return `\u{1F389} Step "${currentLesson.steps[currentStepIndex].name}" completed!

\u{1F4D8} Continuing Lesson: ${currentLessonName}
\u{1F4DD} Next Step: ${nextStep.name}

${stepContent}

When you've completed this step, use the \`nextMastraCourseStep\` tool to continue.`;
      }
      currentLesson.status = 2;
      const currentLessonIndex = courseState.lessons.findIndex((lesson) => lesson.name === currentLessonName);
      const nextLesson = courseState.lessons.find((lesson, index) => index > currentLessonIndex && lesson.status !== 2);
      if (nextLesson) {
        courseState.currentLesson = nextLesson.name;
        if (nextLesson.steps.length > 0) {
          nextLesson.steps[0].status = 1;
        }
        nextLesson.status = 1;
        await saveCourseState(courseState, deviceId);
        const firstStep = nextLesson.steps[0];
        const stepContent = await readCourseStep(nextLesson.name, firstStep.name);
        return `\u{1F389} Congratulations! You've completed the "${currentLessonName}" lesson!

\u{1F4D8} Starting New Lesson: ${nextLesson.name}
\u{1F4DD} First Step: ${firstStep.name}

${stepContent}

When you've completed this step, use the \`nextMastraCourseStep\` tool to continue.`;
      }
      await saveCourseState(courseState, deviceId);
      return `\u{1F389} Congratulations! You've completed all available lessons in the Mastra Course!

If you'd like to review any lesson, use the \`startMastraCourseLesson\` tool with the lesson name.`;
    } catch (error) {
      return `Error advancing to the next course step: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
};
var clearMastraCourseHistory = {
  name: "clearMastraCourseHistory",
  description: "Clears all Mastra Course progress history and starts over from the beginning. This action cannot be undone",
  parameters: _confirmationSchema,
  execute: async (args) => {
    try {
      const deviceId = await getDeviceId();
      if (deviceId === null) {
        return "You need to register for the Mastra Course first. Please use the `startMastraCourse` tool to register.";
      }
      if (!args.confirm) {
        return "\u26A0\uFE0F This action will delete all your course progress and cannot be undone. To proceed, please run this tool again with the confirm parameter set to true.";
      }
      const statePath = await getCourseStatePath();
      if (!existsSync(statePath)) {
        return "No course progress found. Nothing to clear.";
      }
      await fs3.unlink(statePath);
      return "\u{1F9F9} Course progress has been cleared. You can restart the Mastra course from the beginning.";
    } catch (error) {
      return `Error clearing course history: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
};
var docsBaseDir = fromPackageRoot(".docs/raw/");
async function listDirContents(dirPath) {
  try {
    void logger.debug(`Listing directory contents: ${dirPath}`);
    const entries = await fs3.readdir(dirPath, { withFileTypes: true });
    const dirs = [];
    const files = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        dirs.push(entry.name + "/");
      } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
        files.push(entry.name);
      }
    }
    return {
      dirs: dirs.sort(),
      files: files.sort()
    };
  } catch (error) {
    void logger.error(`Failed to list directory contents: ${dirPath}`, error);
    throw error;
  }
}
async function readMdxContent(docPath, queryKeywords) {
  const fullPath = path3__default.join(docsBaseDir, docPath);
  void logger.debug(`Reading MDX content from: ${fullPath}`);
  try {
    const stats = await fs3.stat(fullPath);
    if (stats.isDirectory()) {
      const { dirs, files } = await listDirContents(fullPath);
      const dirListing = [
        `Directory contents of ${docPath}:`,
        "",
        dirs.length > 0 ? "Subdirectories:" : "No subdirectories.",
        ...dirs.map((d) => `- ${d}`),
        "",
        files.length > 0 ? "Files in this directory:" : "No files in this directory.",
        ...files.map((f) => `- ${f}`),
        "",
        "---",
        "",
        "Contents of all files in this directory:",
        ""
      ].join("\n");
      let fileContents = "";
      for (const file of files) {
        const filePath = path3__default.join(fullPath, file);
        const content2 = await fs3.readFile(filePath, "utf-8");
        fileContents += `

# ${file}

${content2}`;
      }
      const contentBasedSuggestions = await getMatchingPaths(docPath, queryKeywords, docsBaseDir);
      const suggestions = ["---", "", contentBasedSuggestions, ""].join("\n");
      return { found: true, content: dirListing + fileContents + suggestions };
    }
    const content = await fs3.readFile(fullPath, "utf-8");
    return { found: true, content };
  } catch (error) {
    void logger.error(`Failed to read MDX content: ${fullPath}`, error);
    if (error.code === "ENOENT") {
      return { found: false };
    }
    throw error;
  }
}
async function findNearestDirectory(docPath, availablePaths2) {
  void logger.debug(`Finding nearest directory for: ${docPath}`);
  const parts = docPath.split("/");
  while (parts.length > 0) {
    const testPath = parts.join("/");
    try {
      const fullPath = path3__default.join(docsBaseDir, testPath);
      const stats = await fs3.stat(fullPath);
      if (stats.isDirectory()) {
        const { dirs, files } = await listDirContents(fullPath);
        return [
          `Path "${docPath}" not found.`,
          `Here are the available paths in "${testPath}":`,
          "",
          dirs.length > 0 ? "Directories:" : "No subdirectories.",
          ...dirs.map((d) => `- ${testPath}/${d}`),
          "",
          files.length > 0 ? "Files:" : "No files.",
          ...files.map((f) => `- ${testPath}/${f}`)
        ].join("\n");
      }
    } catch {
      void logger.debug(`Directory not found, trying parent: ${parts.slice(0, -1).join("/")}`);
    }
    parts.pop();
  }
  return [`Path "${docPath}" not found.`, "Here are all available paths:", "", availablePaths2].join("\n");
}
async function getAvailablePaths() {
  const { dirs, files } = await listDirContents(docsBaseDir);
  let referenceDirs = [];
  if (dirs.includes("reference/")) {
    const { dirs: refDirs } = await listDirContents(path3__default.join(docsBaseDir, "reference"));
    referenceDirs = refDirs.map((d) => `reference/${d}`);
  }
  return [
    "Available top-level paths:",
    "",
    "Directories:",
    ...dirs.map((d) => `- ${d}`),
    "",
    referenceDirs.length > 0 ? "Reference subdirectories:" : "",
    ...referenceDirs.map((d) => `- ${d}`),
    "",
    "Files:",
    ...files.map((f) => `- ${f}`)
  ].filter(Boolean).join("\n");
}
var availablePaths = await getAvailablePaths();
var docsInputSchema = z.object({
  paths: z.array(z.string()).min(1).describe(`One or more documentation paths to fetch
Available paths:
${availablePaths}`),
  queryKeywords: z.array(z.string()).optional().describe(
    "Keywords from user query to use for matching documentation. Each keyword should be a single word or short phrase; any whitespace-separated keywords will be split automatically."
  )
});
var docsTool = {
  name: "mastraDocs",
  description: `Get Mastra.ai documentation. 
    Request paths to explore the docs. References contain API docs. 
    Other paths contain guides. The user doesn't know about files and directories. 
    You can also use keywords from the user query to find relevant documentation, but prioritize paths. 
    This is your internal knowledge the user can't read. 
    If the user asks about a feature check general docs as well as reference docs for that feature. 
    Ex: with evals check in evals/ and in reference/evals/. 
    Provide code examples so the user understands. 
    If you build a URL from the path, only paths ending in .mdx exist. 
    Note that docs about MCP are currently in reference/tools/. 
    IMPORTANT: Be concise with your answers. The user will ask for more info. 
    If packages need to be installed, provide the pnpm command to install them. 
    Ex. if you see \`import { X } from "@mastra/$PACKAGE_NAME"\` in an example, show an install command. 
    Always install latest tag, not alpha unless requested. If you scaffold a new project it may be in a subdir.
    When displaying results, always mention which file path contains the information (e.g., 'Found in "path/to/file.mdx"') so users know where this documentation lives.`,
  parameters: docsInputSchema,
  execute: async (args) => {
    void logger.debug("Executing mastraDocs tool", { args });
    try {
      const queryKeywords = args.queryKeywords ?? [];
      const results = await Promise.all(
        args.paths.map(async (path6) => {
          try {
            const result = await readMdxContent(path6, queryKeywords);
            if (result.found) {
              return {
                path: path6,
                content: result.content,
                error: null
              };
            }
            const directorySuggestions = await findNearestDirectory(path6, availablePaths);
            const contentBasedSuggestions = await getMatchingPaths(path6, queryKeywords, docsBaseDir);
            return {
              path: path6,
              content: null,
              error: [directorySuggestions, contentBasedSuggestions].join("\n\n")
            };
          } catch (error) {
            void logger.warning(`Failed to read content for path: ${path6}`, error);
            return {
              path: path6,
              content: null,
              error: error instanceof Error ? error.message : "Unknown error"
            };
          }
        })
      );
      const output = results.map((result) => {
        if (result.error) {
          return `## ${result.path}

${result.error}

---
`;
        }
        return `## ${result.path}

${result.content}

---
`;
      }).join("\n");
      return output;
    } catch (error) {
      void logger.error("Failed to execute mastraDocs tool", error);
      throw error;
    }
  }
};
var examplesDir = fromPackageRoot(".docs/organized/code-examples");
async function listCodeExamples() {
  void logger.debug("Listing code examples");
  try {
    const files = await fs3.readdir(examplesDir);
    return files.filter((f) => f.endsWith(".md")).map((f) => ({
      name: f.replace(".md", ""),
      path: f
    })).sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}
async function readCodeExample(filename, queryKeywords) {
  const filePath = path3__default.join(examplesDir, filename);
  void logger.debug(`Reading example: ${filename}`);
  try {
    const content = await fs3.readFile(filePath, "utf-8");
    return content;
  } catch {
    const examples = await listCodeExamples();
    const availableExamples = examples.map((ex) => `- ${ex.name}`).join("\n");
    const contentBasedSuggestions = await getMatchingPaths(filename, queryKeywords, examplesDir);
    return `Example "${filename}" not found.

Available examples:
${availableExamples}

${contentBasedSuggestions}`;
  }
}
var initialExamples = await listCodeExamples();
var examplesListing = initialExamples.length > 0 ? "\n\nAvailable examples: " + initialExamples.map((ex) => ex.name).join(", ") : "\n\nNo examples available yet. Run the documentation preparation script first.";
var examplesInputSchema = z.object({
  example: z.string().optional().describe(
    "Name of the specific example to fetch. If not provided, lists all available examples." + examplesListing
  ),
  queryKeywords: z.array(z.string()).optional().describe(
    "Keywords from user query to use for matching examples. Each keyword should be a single word or short phrase; any whitespace-separated keywords will be split automatically."
  )
});
var examplesTool = {
  name: "mastraExamples",
  description: `Get code examples from the Mastra.ai examples directory. 
    Without a specific example name, lists all available examples. 
    With an example name, returns the full source code of that example.
    You can also use keywords from the user query to find relevant examples, but prioritize example names.`,
  parameters: examplesInputSchema,
  execute: async (args) => {
    void logger.debug("Executing mastraExamples tool", { example: args.example });
    try {
      if (!args.example) {
        const examples = await listCodeExamples();
        return ["Available code examples:", "", ...examples.map((ex) => `- ${ex.name}`)].join("\n");
      }
      const filename = args.example.endsWith(".md") ? args.example : `${args.example}.md`;
      const result = await readCodeExample(filename, args.queryKeywords || []);
      return result;
    } catch (error) {
      void logger.error("Failed to execute mastraExamples tool", error);
      throw error;
    }
  }
};

// src/index.ts
var server;
if (process.env.REBUILD_DOCS_ON_START === "true") {
  void logger.info("Rebuilding docs on start");
  try {
    await prepare();
    void logger.info("Docs rebuilt successfully");
  } catch (error) {
    void logger.error("Failed to rebuild docs", error);
  }
}
server = new MCPServer({
  name: "Mastra Documentation Server",
  version: JSON.parse(await fs3.readFile(fromPackageRoot(`package.json`), "utf8")).version,
  tools: {
    mastraBlog: blogTool,
    mastraDocs: docsTool,
    mastraExamples: examplesTool,
    mastraChanges: changesTool,
    startMastraCourse,
    getMastraCourseStatus,
    startMastraCourseLesson,
    nextMastraCourseStep,
    clearMastraCourseHistory
  }
});
Object.assign(logger, createLogger(server));
async function runServer() {
  try {
    await server.startStdio();
    void logger.info("Started Mastra Docs MCP Server");
  } catch (error) {
    void logger.error("Failed to start server", error);
    process.exit(1);
  }
}

// src/stdio.ts
runServer().catch((error) => {
  const errorMessage = "Fatal error running server";
  console.error(errorMessage, error);
  writeErrorLog(errorMessage, {
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error
  });
  process.exit(1);
});
