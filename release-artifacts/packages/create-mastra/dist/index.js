#! /usr/bin/env node
import { Command } from 'commander';
import { randomUUID } from 'node:crypto';
import * as fs3__default from 'node:fs';
import fs3__default__default, { existsSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path2, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PostHog } from 'posthog-node';
import util, { stripVTControlCharacters } from 'node:util';
import y$1, { stdout, stdin } from 'node:process';
import * as g from 'node:readline';
import g__default from 'node:readline';
import { Writable } from 'node:stream';
import child_process from 'node:child_process';
import fs4 from 'node:fs/promises';
import { execa } from 'execa';
import fsExtra3, { readJSON, ensureFile, writeJSON } from 'fs-extra/esm';
import prettier from 'prettier';
import tty from 'node:tty';
import pino from 'pino';
import pretty from 'pino-pretty';
import fsExtra from 'fs-extra';

var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var PosthogAnalytics = class {
  sessionId;
  client;
  distinctId;
  version;
  constructor({
    version,
    apiKey,
    host = "https://app.posthog.com"
  }) {
    this.version = version;
    const cliConfigPath = path2.join(__dirname, "mastra-cli.json");
    if (existsSync(cliConfigPath)) {
      try {
        const { distinctId, sessionId } = JSON.parse(readFileSync(cliConfigPath, "utf-8"));
        this.distinctId = distinctId;
        this.sessionId = sessionId;
      } catch {
        this.sessionId = randomUUID();
        this.distinctId = this.getDistinctId();
      }
      this.writeCliConfig({
        distinctId: this.distinctId,
        sessionId: this.sessionId
      });
    } else {
      this.sessionId = randomUUID();
      this.distinctId = this.getDistinctId();
      this.writeCliConfig({
        distinctId: this.distinctId,
        sessionId: this.sessionId
      });
    }
    if (this.isTelemetryEnabled()) {
      this.initializePostHog(apiKey, host);
    }
  }
  writeCliConfig({ distinctId, sessionId }) {
    try {
      writeFileSync(path2.join(__dirname, "mastra-cli.json"), JSON.stringify({ distinctId, sessionId }));
    } catch {
    }
  }
  initializePostHog(apiKey, host) {
    this.client = new PostHog(apiKey, {
      host,
      flushAt: 1,
      flushInterval: 0,
      disableGeoip: false
    });
    this.captureSessionStart();
    process.on("exit", () => {
      this.client?.flush().catch(() => {
      });
    });
  }
  isTelemetryEnabled() {
    if (process.env.MASTRA_TELEMETRY_DISABLED) {
      return false;
    }
    return true;
  }
  getDistinctId() {
    const machineId = os.hostname();
    return `mastra-${machineId}`;
  }
  getSystemProperties() {
    return {
      os: process.platform,
      os_version: os.release(),
      node_version: process.version,
      platform: process.arch,
      session_id: this.sessionId,
      cli_version: this.version || "unknown",
      machine_id: os.hostname()
    };
  }
  captureSessionStart() {
    if (!this.client) {
      return;
    }
    this.client.capture({
      distinctId: this.distinctId,
      event: "cli_session_start",
      properties: {
        ...this.getSystemProperties()
      }
    });
  }
  trackCommand(options) {
    try {
      if (!this.client) {
        return;
      }
      const commandData = {
        command: options.command,
        status: options.status || "success"
      };
      if (options.args) {
        commandData.args = options.args;
      }
      if (options.durationMs) {
        commandData.durationMs = options.durationMs;
      }
      if (options.error) {
        commandData.error = options.error;
      }
      this.client.capture({
        distinctId: this.distinctId,
        event: "cli_command",
        properties: {
          ...this.getSystemProperties(),
          ...commandData,
          origin: options?.origin || "oss"
        }
      });
    } catch {
    }
  }
  // Helper method to wrap command execution with timing
  async trackCommandExecution({
    command,
    args,
    execution,
    origin
  }) {
    const startTime = process.hrtime();
    try {
      const result = await execution();
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const durationMs = seconds * 1e3 + nanoseconds / 1e6;
      this.trackCommand({
        command,
        args,
        durationMs,
        status: "success",
        origin
      });
      return result;
    } catch (error) {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const durationMs = seconds * 1e3 + nanoseconds / 1e6;
      this.trackCommand({
        command,
        args,
        durationMs,
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        origin
      });
      throw error;
    }
  }
  // Ensure PostHog client is shutdown properly
  async shutdown() {
    if (!this.client) {
      return;
    }
    try {
      await this.client.shutdown();
    } catch {
    }
  }
};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var src;
var hasRequiredSrc;

function requireSrc () {
	if (hasRequiredSrc) return src;
	hasRequiredSrc = 1;

	const ESC = '\x1B';
	const CSI = `${ESC}[`;
	const beep = '\u0007';

	const cursor = {
	  to(x, y) {
	    if (!y) return `${CSI}${x + 1}G`;
	    return `${CSI}${y + 1};${x + 1}H`;
	  },
	  move(x, y) {
	    let ret = '';

	    if (x < 0) ret += `${CSI}${-x}D`;
	    else if (x > 0) ret += `${CSI}${x}C`;

	    if (y < 0) ret += `${CSI}${-y}A`;
	    else if (y > 0) ret += `${CSI}${y}B`;

	    return ret;
	  },
	  up: (count = 1) => `${CSI}${count}A`,
	  down: (count = 1) => `${CSI}${count}B`,
	  forward: (count = 1) => `${CSI}${count}C`,
	  backward: (count = 1) => `${CSI}${count}D`,
	  nextLine: (count = 1) => `${CSI}E`.repeat(count),
	  prevLine: (count = 1) => `${CSI}F`.repeat(count),
	  left: `${CSI}G`,
	  hide: `${CSI}?25l`,
	  show: `${CSI}?25h`,
	  save: `${ESC}7`,
	  restore: `${ESC}8`
	};

	const scroll = {
	  up: (count = 1) => `${CSI}S`.repeat(count),
	  down: (count = 1) => `${CSI}T`.repeat(count)
	};

	const erase = {
	  screen: `${CSI}2J`,
	  up: (count = 1) => `${CSI}1J`.repeat(count),
	  down: (count = 1) => `${CSI}J`.repeat(count),
	  line: `${CSI}2K`,
	  lineEnd: `${CSI}K`,
	  lineStart: `${CSI}1K`,
	  lines(count) {
	    let clear = '';
	    for (let i = 0; i < count; i++)
	      clear += this.line + (i < count - 1 ? cursor.up() : '');
	    if (count)
	      clear += cursor.left;
	    return clear;
	  }
	};

	src = { cursor, scroll, erase, beep };
	return src;
}

var srcExports = requireSrc();

var picocolors = {exports: {}};

var hasRequiredPicocolors;

function requirePicocolors () {
	if (hasRequiredPicocolors) return picocolors.exports;
	hasRequiredPicocolors = 1;
	let p = process || {}, argv = p.argv || [], env = p.env || {};
	let isColorSupported =
		!(!!env.NO_COLOR || argv.includes("--no-color")) &&
		(!!env.FORCE_COLOR || argv.includes("--color") || p.platform === "win32" || ((p.stdout || {}).isTTY && env.TERM !== "dumb") || !!env.CI);

	let formatter = (open, close, replace = open) =>
		input => {
			let string = "" + input, index = string.indexOf(close, open.length);
			return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close
		};

	let replaceClose = (string, close, replace, index) => {
		let result = "", cursor = 0;
		do {
			result += string.substring(cursor, index) + replace;
			cursor = index + close.length;
			index = string.indexOf(close, cursor);
		} while (~index)
		return result + string.substring(cursor)
	};

	let createColors = (enabled = isColorSupported) => {
		let f = enabled ? formatter : () => String;
		return {
			isColorSupported: enabled,
			reset: f("\x1b[0m", "\x1b[0m"),
			bold: f("\x1b[1m", "\x1b[22m", "\x1b[22m\x1b[1m"),
			dim: f("\x1b[2m", "\x1b[22m", "\x1b[22m\x1b[2m"),
			italic: f("\x1b[3m", "\x1b[23m"),
			underline: f("\x1b[4m", "\x1b[24m"),
			inverse: f("\x1b[7m", "\x1b[27m"),
			hidden: f("\x1b[8m", "\x1b[28m"),
			strikethrough: f("\x1b[9m", "\x1b[29m"),

			black: f("\x1b[30m", "\x1b[39m"),
			red: f("\x1b[31m", "\x1b[39m"),
			green: f("\x1b[32m", "\x1b[39m"),
			yellow: f("\x1b[33m", "\x1b[39m"),
			blue: f("\x1b[34m", "\x1b[39m"),
			magenta: f("\x1b[35m", "\x1b[39m"),
			cyan: f("\x1b[36m", "\x1b[39m"),
			white: f("\x1b[37m", "\x1b[39m"),
			gray: f("\x1b[90m", "\x1b[39m"),

			bgBlack: f("\x1b[40m", "\x1b[49m"),
			bgRed: f("\x1b[41m", "\x1b[49m"),
			bgGreen: f("\x1b[42m", "\x1b[49m"),
			bgYellow: f("\x1b[43m", "\x1b[49m"),
			bgBlue: f("\x1b[44m", "\x1b[49m"),
			bgMagenta: f("\x1b[45m", "\x1b[49m"),
			bgCyan: f("\x1b[46m", "\x1b[49m"),
			bgWhite: f("\x1b[47m", "\x1b[49m"),

			blackBright: f("\x1b[90m", "\x1b[39m"),
			redBright: f("\x1b[91m", "\x1b[39m"),
			greenBright: f("\x1b[92m", "\x1b[39m"),
			yellowBright: f("\x1b[93m", "\x1b[39m"),
			blueBright: f("\x1b[94m", "\x1b[39m"),
			magentaBright: f("\x1b[95m", "\x1b[39m"),
			cyanBright: f("\x1b[96m", "\x1b[39m"),
			whiteBright: f("\x1b[97m", "\x1b[39m"),

			bgBlackBright: f("\x1b[100m", "\x1b[49m"),
			bgRedBright: f("\x1b[101m", "\x1b[49m"),
			bgGreenBright: f("\x1b[102m", "\x1b[49m"),
			bgYellowBright: f("\x1b[103m", "\x1b[49m"),
			bgBlueBright: f("\x1b[104m", "\x1b[49m"),
			bgMagentaBright: f("\x1b[105m", "\x1b[49m"),
			bgCyanBright: f("\x1b[106m", "\x1b[49m"),
			bgWhiteBright: f("\x1b[107m", "\x1b[49m"),
		}
	};

	picocolors.exports = createColors();
	picocolors.exports.createColors = createColors;
	return picocolors.exports;
}

var picocolorsExports = /*@__PURE__*/ requirePicocolors();
var color2 = /*@__PURE__*/getDefaultExportFromCjs(picocolorsExports);

function DD({onlyFirst:e=false}={}){const t=["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?(?:\\u0007|\\u001B\\u005C|\\u009C))","(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"].join("|");return new RegExp(t,e?void 0:"g")}const uD=DD();function P$1(e){if(typeof e!="string")throw new TypeError(`Expected a \`string\`, got \`${typeof e}\``);return e.replace(uD,"")}function L$1(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var W$1={exports:{}};(function(e){var u={};e.exports=u,u.eastAsianWidth=function(F){var s=F.charCodeAt(0),i=F.length==2?F.charCodeAt(1):0,D=s;return 55296<=s&&s<=56319&&56320<=i&&i<=57343&&(s&=1023,i&=1023,D=s<<10|i,D+=65536),D==12288||65281<=D&&D<=65376||65504<=D&&D<=65510?"F":D==8361||65377<=D&&D<=65470||65474<=D&&D<=65479||65482<=D&&D<=65487||65490<=D&&D<=65495||65498<=D&&D<=65500||65512<=D&&D<=65518?"H":4352<=D&&D<=4447||4515<=D&&D<=4519||4602<=D&&D<=4607||9001<=D&&D<=9002||11904<=D&&D<=11929||11931<=D&&D<=12019||12032<=D&&D<=12245||12272<=D&&D<=12283||12289<=D&&D<=12350||12353<=D&&D<=12438||12441<=D&&D<=12543||12549<=D&&D<=12589||12593<=D&&D<=12686||12688<=D&&D<=12730||12736<=D&&D<=12771||12784<=D&&D<=12830||12832<=D&&D<=12871||12880<=D&&D<=13054||13056<=D&&D<=19903||19968<=D&&D<=42124||42128<=D&&D<=42182||43360<=D&&D<=43388||44032<=D&&D<=55203||55216<=D&&D<=55238||55243<=D&&D<=55291||63744<=D&&D<=64255||65040<=D&&D<=65049||65072<=D&&D<=65106||65108<=D&&D<=65126||65128<=D&&D<=65131||110592<=D&&D<=110593||127488<=D&&D<=127490||127504<=D&&D<=127546||127552<=D&&D<=127560||127568<=D&&D<=127569||131072<=D&&D<=194367||177984<=D&&D<=196605||196608<=D&&D<=262141?"W":32<=D&&D<=126||162<=D&&D<=163||165<=D&&D<=166||D==172||D==175||10214<=D&&D<=10221||10629<=D&&D<=10630?"Na":D==161||D==164||167<=D&&D<=168||D==170||173<=D&&D<=174||176<=D&&D<=180||182<=D&&D<=186||188<=D&&D<=191||D==198||D==208||215<=D&&D<=216||222<=D&&D<=225||D==230||232<=D&&D<=234||236<=D&&D<=237||D==240||242<=D&&D<=243||247<=D&&D<=250||D==252||D==254||D==257||D==273||D==275||D==283||294<=D&&D<=295||D==299||305<=D&&D<=307||D==312||319<=D&&D<=322||D==324||328<=D&&D<=331||D==333||338<=D&&D<=339||358<=D&&D<=359||D==363||D==462||D==464||D==466||D==468||D==470||D==472||D==474||D==476||D==593||D==609||D==708||D==711||713<=D&&D<=715||D==717||D==720||728<=D&&D<=731||D==733||D==735||768<=D&&D<=879||913<=D&&D<=929||931<=D&&D<=937||945<=D&&D<=961||963<=D&&D<=969||D==1025||1040<=D&&D<=1103||D==1105||D==8208||8211<=D&&D<=8214||8216<=D&&D<=8217||8220<=D&&D<=8221||8224<=D&&D<=8226||8228<=D&&D<=8231||D==8240||8242<=D&&D<=8243||D==8245||D==8251||D==8254||D==8308||D==8319||8321<=D&&D<=8324||D==8364||D==8451||D==8453||D==8457||D==8467||D==8470||8481<=D&&D<=8482||D==8486||D==8491||8531<=D&&D<=8532||8539<=D&&D<=8542||8544<=D&&D<=8555||8560<=D&&D<=8569||D==8585||8592<=D&&D<=8601||8632<=D&&D<=8633||D==8658||D==8660||D==8679||D==8704||8706<=D&&D<=8707||8711<=D&&D<=8712||D==8715||D==8719||D==8721||D==8725||D==8730||8733<=D&&D<=8736||D==8739||D==8741||8743<=D&&D<=8748||D==8750||8756<=D&&D<=8759||8764<=D&&D<=8765||D==8776||D==8780||D==8786||8800<=D&&D<=8801||8804<=D&&D<=8807||8810<=D&&D<=8811||8814<=D&&D<=8815||8834<=D&&D<=8835||8838<=D&&D<=8839||D==8853||D==8857||D==8869||D==8895||D==8978||9312<=D&&D<=9449||9451<=D&&D<=9547||9552<=D&&D<=9587||9600<=D&&D<=9615||9618<=D&&D<=9621||9632<=D&&D<=9633||9635<=D&&D<=9641||9650<=D&&D<=9651||9654<=D&&D<=9655||9660<=D&&D<=9661||9664<=D&&D<=9665||9670<=D&&D<=9672||D==9675||9678<=D&&D<=9681||9698<=D&&D<=9701||D==9711||9733<=D&&D<=9734||D==9737||9742<=D&&D<=9743||9748<=D&&D<=9749||D==9756||D==9758||D==9792||D==9794||9824<=D&&D<=9825||9827<=D&&D<=9829||9831<=D&&D<=9834||9836<=D&&D<=9837||D==9839||9886<=D&&D<=9887||9918<=D&&D<=9919||9924<=D&&D<=9933||9935<=D&&D<=9953||D==9955||9960<=D&&D<=9983||D==10045||D==10071||10102<=D&&D<=10111||11093<=D&&D<=11097||12872<=D&&D<=12879||57344<=D&&D<=63743||65024<=D&&D<=65039||D==65533||127232<=D&&D<=127242||127248<=D&&D<=127277||127280<=D&&D<=127337||127344<=D&&D<=127386||917760<=D&&D<=917999||983040<=D&&D<=1048573||1048576<=D&&D<=1114109?"A":"N"},u.characterLength=function(F){var s=this.eastAsianWidth(F);return s=="F"||s=="W"||s=="A"?2:1};function t(F){return F.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g)||[]}u.length=function(F){for(var s=t(F),i=0,D=0;D<s.length;D++)i=i+this.characterLength(s[D]);return i},u.slice=function(F,s,i){textLen=u.length(F),s=s||0,i=i||1,s<0&&(s=textLen+s),i<0&&(i=textLen+i);for(var D="",C=0,n=t(F),E=0;E<n.length;E++){var a=n[E],o=u.length(a);if(C>=s-(o==2?1:0))if(C+o<=i)D+=a;else break;C+=o;}return D};})(W$1);var tD=W$1.exports;const eD=L$1(tD);var FD=function(){return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|(?:\uD83E\uDDD1\uD83C\uDFFF\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFC-\uDFFF])|\uD83D\uDC68(?:\uD83C\uDFFB(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|[\u2695\u2696\u2708]\uFE0F|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))?|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])\uFE0F|\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC)?|(?:\uD83D\uDC69(?:\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC69(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83E\uDDD1(?:\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDE36\u200D\uD83C\uDF2B|\uD83C\uDFF3\uFE0F\u200D\u26A7|\uD83D\uDC3B\u200D\u2744|(?:(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\uD83C\uDFF4\u200D\u2620|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299]|\uD83C[\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]|\uD83D[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3])\uFE0F|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDE35\u200D\uD83D\uDCAB|\uD83D\uDE2E\u200D\uD83D\uDCA8|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83E\uDDD1(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83D\uDC69(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC08\u200D\u2B1B|\u2764\uFE0F\u200D(?:\uD83D\uDD25|\uD83E\uDE79)|\uD83D\uDC41\uFE0F|\uD83C\uDFF3\uFE0F|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|\u2764\uFE0F|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF4|(?:[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270C\u270D]|\uD83D[\uDD74\uDD90])(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC08\uDC15\uDC3B\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE2E\uDE35\uDE36\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5]|\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD]|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0D\uDD0E\uDD10-\uDD17\uDD1D\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78\uDD7A-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCB\uDDD0\uDDE0-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6]|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDD77\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g};const sD=L$1(FD);function p(e,u={}){if(typeof e!="string"||e.length===0||(u={ambiguousIsNarrow:true,...u},e=P$1(e),e.length===0))return 0;e=e.replace(sD(),"  ");const t=u.ambiguousIsNarrow?1:2;let F=0;for(const s of e){const i=s.codePointAt(0);if(i<=31||i>=127&&i<=159||i>=768&&i<=879)continue;switch(eD.eastAsianWidth(s)){case "F":case "W":F+=2;break;case "A":F+=t;break;default:F+=1;}}return F}const w=10,N=(e=0)=>u=>`\x1B[${u+e}m`,I=(e=0)=>u=>`\x1B[${38+e};5;${u}m`,R=(e=0)=>(u,t,F)=>`\x1B[${38+e};2;${u};${t};${F}m`,r={modifier:{reset:[0,0],bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],overline:[53,55],inverse:[7,27],hidden:[8,28],strikethrough:[9,29]},color:{black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],blackBright:[90,39],gray:[90,39],grey:[90,39],redBright:[91,39],greenBright:[92,39],yellowBright:[93,39],blueBright:[94,39],magentaBright:[95,39],cyanBright:[96,39],whiteBright:[97,39]},bgColor:{bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49],bgBlackBright:[100,49],bgGray:[100,49],bgGrey:[100,49],bgRedBright:[101,49],bgGreenBright:[102,49],bgYellowBright:[103,49],bgBlueBright:[104,49],bgMagentaBright:[105,49],bgCyanBright:[106,49],bgWhiteBright:[107,49]}};Object.keys(r.modifier);const iD=Object.keys(r.color),CD=Object.keys(r.bgColor);[...iD,...CD];function rD(){const e=new Map;for(const[u,t]of Object.entries(r)){for(const[F,s]of Object.entries(t))r[F]={open:`\x1B[${s[0]}m`,close:`\x1B[${s[1]}m`},t[F]=r[F],e.set(s[0],s[1]);Object.defineProperty(r,u,{value:t,enumerable:false});}return Object.defineProperty(r,"codes",{value:e,enumerable:false}),r.color.close="\x1B[39m",r.bgColor.close="\x1B[49m",r.color.ansi=N(),r.color.ansi256=I(),r.color.ansi16m=R(),r.bgColor.ansi=N(w),r.bgColor.ansi256=I(w),r.bgColor.ansi16m=R(w),Object.defineProperties(r,{rgbToAnsi256:{value:(u,t,F)=>u===t&&t===F?u<8?16:u>248?231:Math.round((u-8)/247*24)+232:16+36*Math.round(u/255*5)+6*Math.round(t/255*5)+Math.round(F/255*5),enumerable:false},hexToRgb:{value:u=>{const t=/[a-f\d]{6}|[a-f\d]{3}/i.exec(u.toString(16));if(!t)return [0,0,0];let[F]=t;F.length===3&&(F=[...F].map(i=>i+i).join(""));const s=Number.parseInt(F,16);return [s>>16&255,s>>8&255,s&255]},enumerable:false},hexToAnsi256:{value:u=>r.rgbToAnsi256(...r.hexToRgb(u)),enumerable:false},ansi256ToAnsi:{value:u=>{if(u<8)return 30+u;if(u<16)return 90+(u-8);let t,F,s;if(u>=232)t=((u-232)*10+8)/255,F=t,s=t;else {u-=16;const C=u%36;t=Math.floor(u/36)/5,F=Math.floor(C/6)/5,s=C%6/5;}const i=Math.max(t,F,s)*2;if(i===0)return 30;let D=30+(Math.round(s)<<2|Math.round(F)<<1|Math.round(t));return i===2&&(D+=60),D},enumerable:false},rgbToAnsi:{value:(u,t,F)=>r.ansi256ToAnsi(r.rgbToAnsi256(u,t,F)),enumerable:false},hexToAnsi:{value:u=>r.ansi256ToAnsi(r.hexToAnsi256(u)),enumerable:false}}),r}const ED=rD(),d$1=new Set(["\x1B","\x9B"]),oD=39,y="\x07",V$1="[",nD="]",G$1="m",_$1=`${nD}8;;`,z=e=>`${d$1.values().next().value}${V$1}${e}${G$1}`,K$1=e=>`${d$1.values().next().value}${_$1}${e}${y}`,aD=e=>e.split(" ").map(u=>p(u)),k$1=(e,u,t)=>{const F=[...u];let s=false,i=false,D=p(P$1(e[e.length-1]));for(const[C,n]of F.entries()){const E=p(n);if(D+E<=t?e[e.length-1]+=n:(e.push(n),D=0),d$1.has(n)&&(s=true,i=F.slice(C+1).join("").startsWith(_$1)),s){i?n===y&&(s=false,i=false):n===G$1&&(s=false);continue}D+=E,D===t&&C<F.length-1&&(e.push(""),D=0);}!D&&e[e.length-1].length>0&&e.length>1&&(e[e.length-2]+=e.pop());},hD=e=>{const u=e.split(" ");let t=u.length;for(;t>0&&!(p(u[t-1])>0);)t--;return t===u.length?e:u.slice(0,t).join(" ")+u.slice(t).join("")},lD=(e,u,t={})=>{if(t.trim!==false&&e.trim()==="")return "";let F="",s,i;const D=aD(e);let C=[""];for(const[E,a]of e.split(" ").entries()){t.trim!==false&&(C[C.length-1]=C[C.length-1].trimStart());let o=p(C[C.length-1]);if(E!==0&&(o>=u&&(t.wordWrap===false||t.trim===false)&&(C.push(""),o=0),(o>0||t.trim===false)&&(C[C.length-1]+=" ",o++)),t.hard&&D[E]>u){const c=u-o,f=1+Math.floor((D[E]-c-1)/u);Math.floor((D[E]-1)/u)<f&&C.push(""),k$1(C,a,u);continue}if(o+D[E]>u&&o>0&&D[E]>0){if(t.wordWrap===false&&o<u){k$1(C,a,u);continue}C.push("");}if(o+D[E]>u&&t.wordWrap===false){k$1(C,a,u);continue}C[C.length-1]+=a;}t.trim!==false&&(C=C.map(E=>hD(E)));const n=[...C.join(`
`)];for(const[E,a]of n.entries()){if(F+=a,d$1.has(a)){const{groups:c}=new RegExp(`(?:\\${V$1}(?<code>\\d+)m|\\${_$1}(?<uri>.*)${y})`).exec(n.slice(E).join(""))||{groups:{}};if(c.code!==void 0){const f=Number.parseFloat(c.code);s=f===oD?void 0:f;}else c.uri!==void 0&&(i=c.uri.length===0?void 0:c.uri);}const o=ED.codes.get(Number(s));n[E+1]===`
`?(i&&(F+=K$1("")),s&&o&&(F+=z(o))):a===`
`&&(s&&o&&(F+=z(s)),i&&(F+=K$1(i)));}return F};function Y$1(e,u,t){return String(e).normalize().replace(/\r\n/g,`
`).split(`
`).map(F=>lD(F,u,t)).join(`
`)}const xD=["up","down","left","right","space","enter","cancel"],B={actions:new Set(xD),aliases:new Map([["k","up"],["j","down"],["h","left"],["l","right"],["","cancel"],["escape","cancel"]])};function $(e,u){if(typeof e=="string")return B.aliases.get(e)===u;for(const t of e)if(t!==void 0&&$(t,u))return  true;return  false}function BD(e,u){if(e===u)return;const t=e.split(`
`),F=u.split(`
`),s=[];for(let i=0;i<Math.max(t.length,F.length);i++)t[i]!==F[i]&&s.push(i);return s}const AD=globalThis.process.platform.startsWith("win"),S=Symbol("clack:cancel");function pD(e){return e===S}function m(e,u){const t=e;t.isTTY&&t.setRawMode(u);}function fD({input:e=stdin,output:u=stdout,overwrite:t=true,hideCursor:F=true}={}){const s=g.createInterface({input:e,output:u,prompt:"",tabSize:1});g.emitKeypressEvents(e,s),e.isTTY&&e.setRawMode(true);const i=(D,{name:C,sequence:n})=>{const E=String(D);if($([E,C,n],"cancel")){F&&u.write(srcExports.cursor.show),process.exit(0);return}if(!t)return;const a=C==="return"?0:-1,o=C==="return"?-1:0;g.moveCursor(u,a,o,()=>{g.clearLine(u,1,()=>{e.once("keypress",i);});});};return F&&u.write(srcExports.cursor.hide),e.once("keypress",i),()=>{e.off("keypress",i),F&&u.write(srcExports.cursor.show),e.isTTY&&!AD&&e.setRawMode(false),s.terminal=false,s.close();}}var gD=Object.defineProperty,vD=(e,u,t)=>u in e?gD(e,u,{enumerable:true,configurable:true,writable:true,value:t}):e[u]=t,h=(e,u,t)=>(vD(e,typeof u!="symbol"?u+"":u,t),t);class x{constructor(u,t=true){h(this,"input"),h(this,"output"),h(this,"_abortSignal"),h(this,"rl"),h(this,"opts"),h(this,"_render"),h(this,"_track",false),h(this,"_prevFrame",""),h(this,"_subscribers",new Map),h(this,"_cursor",0),h(this,"state","initial"),h(this,"error",""),h(this,"value");const{input:F=stdin,output:s=stdout,render:i,signal:D,...C}=u;this.opts=C,this.onKeypress=this.onKeypress.bind(this),this.close=this.close.bind(this),this.render=this.render.bind(this),this._render=i.bind(this),this._track=t,this._abortSignal=D,this.input=F,this.output=s;}unsubscribe(){this._subscribers.clear();}setSubscriber(u,t){const F=this._subscribers.get(u)??[];F.push(t),this._subscribers.set(u,F);}on(u,t){this.setSubscriber(u,{cb:t});}once(u,t){this.setSubscriber(u,{cb:t,once:true});}emit(u,...t){const F=this._subscribers.get(u)??[],s=[];for(const i of F)i.cb(...t),i.once&&s.push(()=>F.splice(F.indexOf(i),1));for(const i of s)i();}prompt(){return new Promise((u,t)=>{if(this._abortSignal){if(this._abortSignal.aborted)return this.state="cancel",this.close(),u(S);this._abortSignal.addEventListener("abort",()=>{this.state="cancel",this.close();},{once:true});}const F=new Writable;F._write=(s,i,D)=>{this._track&&(this.value=this.rl?.line.replace(/\t/g,""),this._cursor=this.rl?.cursor??0,this.emit("value",this.value)),D();},this.input.pipe(F),this.rl=g__default.createInterface({input:this.input,output:F,tabSize:2,prompt:"",escapeCodeTimeout:50,terminal:true}),g__default.emitKeypressEvents(this.input,this.rl),this.rl.prompt(),this.opts.initialValue!==void 0&&this._track&&this.rl.write(this.opts.initialValue),this.input.on("keypress",this.onKeypress),m(this.input,true),this.output.on("resize",this.render),this.render(),this.once("submit",()=>{this.output.write(srcExports.cursor.show),this.output.off("resize",this.render),m(this.input,false),u(this.value);}),this.once("cancel",()=>{this.output.write(srcExports.cursor.show),this.output.off("resize",this.render),m(this.input,false),u(S);});})}onKeypress(u,t){if(this.state==="error"&&(this.state="active"),t?.name&&(!this._track&&B.aliases.has(t.name)&&this.emit("cursor",B.aliases.get(t.name)),B.actions.has(t.name)&&this.emit("cursor",t.name)),u&&(u.toLowerCase()==="y"||u.toLowerCase()==="n")&&this.emit("confirm",u.toLowerCase()==="y"),u==="	"&&this.opts.placeholder&&(this.value||(this.rl?.write(this.opts.placeholder),this.emit("value",this.opts.placeholder))),u&&this.emit("key",u.toLowerCase()),t?.name==="return"){if(this.opts.validate){const F=this.opts.validate(this.value);F&&(this.error=F instanceof Error?F.message:F,this.state="error",this.rl?.write(this.value));}this.state!=="error"&&(this.state="submit");}$([u,t?.name,t?.sequence],"cancel")&&(this.state="cancel"),(this.state==="submit"||this.state==="cancel")&&this.emit("finalize"),this.render(),(this.state==="submit"||this.state==="cancel")&&this.close();}close(){this.input.unpipe(),this.input.removeListener("keypress",this.onKeypress),this.output.write(`
`),m(this.input,false),this.rl?.close(),this.rl=void 0,this.emit(`${this.state}`,this.value),this.unsubscribe();}restoreCursor(){const u=Y$1(this._prevFrame,process.stdout.columns,{hard:true}).split(`
`).length-1;this.output.write(srcExports.cursor.move(-999,u*-1));}render(){const u=Y$1(this._render(this)??"",process.stdout.columns,{hard:true});if(u!==this._prevFrame){if(this.state==="initial")this.output.write(srcExports.cursor.hide);else {const t=BD(this._prevFrame,u);if(this.restoreCursor(),t&&t?.length===1){const F=t[0];this.output.write(srcExports.cursor.move(0,F)),this.output.write(srcExports.erase.lines(1));const s=u.split(`
`);this.output.write(s[F]),this._prevFrame=u,this.output.write(srcExports.cursor.move(0,s.length-F-1));return}if(t&&t?.length>1){const F=t[0];this.output.write(srcExports.cursor.move(0,F)),this.output.write(srcExports.erase.down());const s=u.split(`
`).slice(F);this.output.write(s.join(`
`)),this._prevFrame=u;return}this.output.write(srcExports.erase.down());}this.output.write(u),this.state==="initial"&&(this.state="active"),this._prevFrame=u;}}}var OD=Object.defineProperty,PD=(e,u,t)=>u in e?OD(e,u,{enumerable:true,configurable:true,writable:true,value:t}):e[u]=t,J=(e,u,t)=>(PD(e,typeof u!="symbol"?u+"":u,t),t);class LD extends x{constructor(u){super(u,false),J(this,"options"),J(this,"cursor",0),this.options=u.options,this.cursor=this.options.findIndex(({value:t})=>t===u.initialValue),this.cursor===-1&&(this.cursor=0),this.changeValue(),this.on("cursor",t=>{switch(t){case "left":case "up":this.cursor=this.cursor===0?this.options.length-1:this.cursor-1;break;case "down":case "right":this.cursor=this.cursor===this.options.length-1?0:this.cursor+1;break}this.changeValue();});}get _value(){return this.options[this.cursor]}changeValue(){this.value=this._value.value;}}class RD extends x{get valueWithCursor(){if(this.state==="submit")return this.value;if(this.cursor>=this.value.length)return `${this.value}\u2588`;const u=this.value.slice(0,this.cursor),[t,...F]=this.value.slice(this.cursor);return `${u}${color2.inverse(t)}${F.join("")}`}get cursor(){return this._cursor}constructor(u){super(u),this.on("finalize",()=>{this.value||(this.value=u.defaultValue);});}}

function ce(){return y$1.platform!=="win32"?y$1.env.TERM!=="linux":!!y$1.env.CI||!!y$1.env.WT_SESSION||!!y$1.env.TERMINUS_SUBLIME||y$1.env.ConEmuTask==="{cmd::Cmder}"||y$1.env.TERM_PROGRAM==="Terminus-Sublime"||y$1.env.TERM_PROGRAM==="vscode"||y$1.env.TERM==="xterm-256color"||y$1.env.TERM==="alacritty"||y$1.env.TERMINAL_EMULATOR==="JetBrains-JediTerm"}const V=ce(),u=(t,n)=>V?t:n,le=u("\u25C6","*"),L=u("\u25A0","x"),W=u("\u25B2","x"),C=u("\u25C7","o"),ue=u("\u250C","T"),o=u("\u2502","|"),d=u("\u2514","\u2014"),k=u("\u25CF",">"),P=u("\u25CB"," "),_=u("\u2500","-"),me=u("\u256E","+"),de=u("\u251C","+"),pe=u("\u256F","+"),q=u("\u25CF","\u2022"),D=u("\u25C6","*"),U=u("\u25B2","!"),K=u("\u25A0","x"),b=t=>{switch(t){case "initial":case "active":return color2.cyan(le);case "cancel":return color2.red(L);case "error":return color2.yellow(W);case "submit":return color2.green(C)}},G=t=>{const{cursor:n,options:r,style:i}=t,s=t.maxItems??Number.POSITIVE_INFINITY,c=Math.max(process.stdout.rows-4,0),a=Math.min(c,Math.max(s,5));let l=0;n>=l+a-3?l=Math.max(Math.min(n-a+3,r.length-a),0):n<l+2&&(l=Math.max(n-2,0));const $=a<r.length&&l>0,g=a<r.length&&l+a<r.length;return r.slice(l,l+a).map((p,v,f)=>{const j=v===0&&$,E=v===f.length-1&&g;return j||E?color2.dim("..."):i(p,v+l===n)})},he=t=>new RD({validate:t.validate,placeholder:t.placeholder,defaultValue:t.defaultValue,initialValue:t.initialValue,render(){const n=`${color2.gray(o)}
${b(this.state)}  ${t.message}
`,r=t.placeholder?color2.inverse(t.placeholder[0])+color2.dim(t.placeholder.slice(1)):color2.inverse(color2.hidden("_")),i=this.value?this.valueWithCursor:r;switch(this.state){case "error":return `${n.trim()}
${color2.yellow(o)}  ${i}
${color2.yellow(d)}  ${color2.yellow(this.error)}
`;case "submit":return `${n}${color2.gray(o)}  ${color2.dim(this.value||t.placeholder)}`;case "cancel":return `${n}${color2.gray(o)}  ${color2.strikethrough(color2.dim(this.value??""))}${this.value?.trim()?`
${color2.gray(o)}`:""}`;default:return `${n}${color2.cyan(o)}  ${i}
${color2.cyan(d)}
`}}}).prompt(),ve=t=>{const n=(r,i)=>{const s=r.label??String(r.value);switch(i){case "selected":return `${color2.dim(s)}`;case "active":return `${color2.green(k)} ${s} ${r.hint?color2.dim(`(${r.hint})`):""}`;case "cancelled":return `${color2.strikethrough(color2.dim(s))}`;default:return `${color2.dim(P)} ${color2.dim(s)}`}};return new LD({options:t.options,initialValue:t.initialValue,render(){const r=`${color2.gray(o)}
${b(this.state)}  ${t.message}
`;switch(this.state){case "submit":return `${r}${color2.gray(o)}  ${n(this.options[this.cursor],"selected")}`;case "cancel":return `${r}${color2.gray(o)}  ${n(this.options[this.cursor],"cancelled")}
${color2.gray(o)}`;default:return `${r}${color2.cyan(o)}  ${G({cursor:this.cursor,options:this.options,maxItems:t.maxItems,style:(i,s)=>n(i,s?"active":"inactive")}).join(`
${color2.cyan(o)}  `)}
${color2.cyan(d)}
`}}}).prompt()},Me=(t="",n="")=>{const r=`
${t}
`.split(`
`),i=stripVTControlCharacters(n).length,s=Math.max(r.reduce((a,l)=>{const $=stripVTControlCharacters(l);return $.length>a?$.length:a},0),i)+2,c=r.map(a=>`${color2.gray(o)}  ${color2.dim(a)}${" ".repeat(s-stripVTControlCharacters(a).length)}${color2.gray(o)}`).join(`
`);process.stdout.write(`${color2.gray(o)}
${color2.green(C)}  ${color2.reset(n)} ${color2.gray(_.repeat(Math.max(s-i-1,1))+me)}
${c}
${color2.gray(de+_.repeat(s+2)+pe)}
`);},xe=(t="")=>{process.stdout.write(`${color2.gray(d)}  ${color2.red(t)}

`);},Ie=(t="")=>{process.stdout.write(`${color2.gray(ue)}  ${t}
`);},Se=(t="")=>{process.stdout.write(`${color2.gray(o)}
${color2.gray(d)}  ${t}

`);},M={message:(t="",{symbol:n=color2.gray(o)}={})=>{const r=[`${color2.gray(o)}`];if(t){const[i,...s]=t.split(`
`);r.push(`${n}  ${i}`,...s.map(c=>`${color2.gray(o)}  ${c}`));}process.stdout.write(`${r.join(`
`)}
`);},info:t=>{M.message(t,{symbol:color2.blue(q)});},success:t=>{M.message(t,{symbol:color2.green(D)});},step:t=>{M.message(t,{symbol:color2.green(C)});},warn:t=>{M.message(t,{symbol:color2.yellow(U)});},warning:t=>{M.warn(t);},error:t=>{M.message(t,{symbol:color2.red(K)});}};`${color2.gray(o)}  `;const Y=({indicator:t="dots"}={})=>{const n=V?["\u25D2","\u25D0","\u25D3","\u25D1"]:["\u2022","o","O","0"],r=V?80:120,i=process.env.CI==="true";let s,c,a=false,l="",$,g=performance.now();const p=m=>{const h=m>1?"Something went wrong":"Canceled";a&&N(h,m);},v=()=>p(2),f=()=>p(1),j=()=>{process.on("uncaughtExceptionMonitor",v),process.on("unhandledRejection",v),process.on("SIGINT",f),process.on("SIGTERM",f),process.on("exit",p);},E=()=>{process.removeListener("uncaughtExceptionMonitor",v),process.removeListener("unhandledRejection",v),process.removeListener("SIGINT",f),process.removeListener("SIGTERM",f),process.removeListener("exit",p);},B=()=>{if($===void 0)return;i&&process.stdout.write(`
`);const m=$.split(`
`);process.stdout.write(srcExports.cursor.move(-999,m.length-1)),process.stdout.write(srcExports.erase.down(m.length));},R=m=>m.replace(/\.+$/,""),O=m=>{const h=(performance.now()-m)/1e3,w=Math.floor(h/60),I=Math.floor(h%60);return w>0?`[${w}m ${I}s]`:`[${I}s]`},H=(m="")=>{a=true,s=fD(),l=R(m),g=performance.now(),process.stdout.write(`${color2.gray(o)}
`);let h=0,w=0;j(),c=setInterval(()=>{if(i&&l===$)return;B(),$=l;const I=color2.magenta(n[h]);if(i)process.stdout.write(`${I}  ${l}...`);else if(t==="timer")process.stdout.write(`${I}  ${l} ${O(g)}`);else {const z=".".repeat(Math.floor(w)).slice(0,3);process.stdout.write(`${I}  ${l}${z}`);}h=h+1<n.length?h+1:0,w=w<n.length?w+.125:0;},r);},N=(m="",h=0)=>{a=false,clearInterval(c),B();const w=h===0?color2.green(C):h===1?color2.red(L):color2.red(W);l=R(m??l),t==="timer"?process.stdout.write(`${w}  ${l} ${O(g)}
`):process.stdout.write(`${w}  ${l}
`),E(),s();};return {start:H,stop:N,message:(m="")=>{l=R(m??l);}}},Ce=async(t,n)=>{const r={},i=Object.keys(t);for(const s of i){const c=t[s],a=await c({results:r})?.catch(l=>{throw l});if(typeof n?.onCancel=="function"&&pD(a)){r[s]="canceled",n.onCancel({results:r});continue}r[s]=a;}return r};

var shellQuote$1 = {};

var quote;
var hasRequiredQuote;

function requireQuote () {
	if (hasRequiredQuote) return quote;
	hasRequiredQuote = 1;

	quote = function quote(xs) {
		return xs.map(function (s) {
			if (s === '') {
				return '\'\'';
			}
			if (s && typeof s === 'object') {
				return s.op.replace(/(.)/g, '\\$1');
			}
			if ((/["\s\\]/).test(s) && !(/'/).test(s)) {
				return "'" + s.replace(/(['])/g, '\\$1') + "'";
			}
			if ((/["'\s]/).test(s)) {
				return '"' + s.replace(/(["\\$`!])/g, '\\$1') + '"';
			}
			return String(s).replace(/([A-Za-z]:)?([#!"$&'()*,:;<=>?@[\\\]^`{|}])/g, '$1\\$2');
		}).join(' ');
	};
	return quote;
}

var parse;
var hasRequiredParse;

function requireParse () {
	if (hasRequiredParse) return parse;
	hasRequiredParse = 1;

	// '<(' is process substitution operator and
	// can be parsed the same as control operator
	var CONTROL = '(?:' + [
		'\\|\\|',
		'\\&\\&',
		';;',
		'\\|\\&',
		'\\<\\(',
		'\\<\\<\\<',
		'>>',
		'>\\&',
		'<\\&',
		'[&;()|<>]'
	].join('|') + ')';
	var controlRE = new RegExp('^' + CONTROL + '$');
	var META = '|&;()<> \\t';
	var SINGLE_QUOTE = '"((\\\\"|[^"])*?)"';
	var DOUBLE_QUOTE = '\'((\\\\\'|[^\'])*?)\'';
	var hash = /^#$/;

	var SQ = "'";
	var DQ = '"';
	var DS = '$';

	var TOKEN = '';
	var mult = 0x100000000; // Math.pow(16, 8);
	for (var i = 0; i < 4; i++) {
		TOKEN += (mult * Math.random()).toString(16);
	}
	var startsWithToken = new RegExp('^' + TOKEN);

	function matchAll(s, r) {
		var origIndex = r.lastIndex;

		var matches = [];
		var matchObj;

		while ((matchObj = r.exec(s))) {
			matches.push(matchObj);
			if (r.lastIndex === matchObj.index) {
				r.lastIndex += 1;
			}
		}

		r.lastIndex = origIndex;

		return matches;
	}

	function getVar(env, pre, key) {
		var r = typeof env === 'function' ? env(key) : env[key];
		if (typeof r === 'undefined' && key != '') {
			r = '';
		} else if (typeof r === 'undefined') {
			r = '$';
		}

		if (typeof r === 'object') {
			return pre + TOKEN + JSON.stringify(r) + TOKEN;
		}
		return pre + r;
	}

	function parseInternal(string, env, opts) {
		if (!opts) {
			opts = {};
		}
		var BS = opts.escape || '\\';
		var BAREWORD = '(\\' + BS + '[\'"' + META + ']|[^\\s\'"' + META + '])+';

		var chunker = new RegExp([
			'(' + CONTROL + ')', // control chars
			'(' + BAREWORD + '|' + SINGLE_QUOTE + '|' + DOUBLE_QUOTE + ')+'
		].join('|'), 'g');

		var matches = matchAll(string, chunker);

		if (matches.length === 0) {
			return [];
		}
		if (!env) {
			env = {};
		}

		var commented = false;

		return matches.map(function (match) {
			var s = match[0];
			if (!s || commented) {
				return void undefined;
			}
			if (controlRE.test(s)) {
				return { op: s };
			}

			// Hand-written scanner/parser for Bash quoting rules:
			//
			// 1. inside single quotes, all characters are printed literally.
			// 2. inside double quotes, all characters are printed literally
			//    except variables prefixed by '$' and backslashes followed by
			//    either a double quote or another backslash.
			// 3. outside of any quotes, backslashes are treated as escape
			//    characters and not printed (unless they are themselves escaped)
			// 4. quote context can switch mid-token if there is no whitespace
			//     between the two quote contexts (e.g. all'one'"token" parses as
			//     "allonetoken")
			var quote = false;
			var esc = false;
			var out = '';
			var isGlob = false;
			var i;

			function parseEnvVar() {
				i += 1;
				var varend;
				var varname;
				var char = s.charAt(i);

				if (char === '{') {
					i += 1;
					if (s.charAt(i) === '}') {
						throw new Error('Bad substitution: ' + s.slice(i - 2, i + 1));
					}
					varend = s.indexOf('}', i);
					if (varend < 0) {
						throw new Error('Bad substitution: ' + s.slice(i));
					}
					varname = s.slice(i, varend);
					i = varend;
				} else if ((/[*@#?$!_-]/).test(char)) {
					varname = char;
					i += 1;
				} else {
					var slicedFromI = s.slice(i);
					varend = slicedFromI.match(/[^\w\d_]/);
					if (!varend) {
						varname = slicedFromI;
						i = s.length;
					} else {
						varname = slicedFromI.slice(0, varend.index);
						i += varend.index - 1;
					}
				}
				return getVar(env, '', varname);
			}

			for (i = 0; i < s.length; i++) {
				var c = s.charAt(i);
				isGlob = isGlob || (!quote && (c === '*' || c === '?'));
				if (esc) {
					out += c;
					esc = false;
				} else if (quote) {
					if (c === quote) {
						quote = false;
					} else if (quote == SQ) {
						out += c;
					} else { // Double quote
						if (c === BS) {
							i += 1;
							c = s.charAt(i);
							if (c === DQ || c === BS || c === DS) {
								out += c;
							} else {
								out += BS + c;
							}
						} else if (c === DS) {
							out += parseEnvVar();
						} else {
							out += c;
						}
					}
				} else if (c === DQ || c === SQ) {
					quote = c;
				} else if (controlRE.test(c)) {
					return { op: s };
				} else if (hash.test(c)) {
					commented = true;
					var commentObj = { comment: string.slice(match.index + i + 1) };
					if (out.length) {
						return [out, commentObj];
					}
					return [commentObj];
				} else if (c === BS) {
					esc = true;
				} else if (c === DS) {
					out += parseEnvVar();
				} else {
					out += c;
				}
			}

			if (isGlob) {
				return { op: 'glob', pattern: out };
			}

			return out;
		}).reduce(function (prev, arg) { // finalize parsed arguments
			// TODO: replace this whole reduce with a concat
			return typeof arg === 'undefined' ? prev : prev.concat(arg);
		}, []);
	}

	parse = function parse(s, env, opts) {
		var mapped = parseInternal(s, env, opts);
		if (typeof env !== 'function') {
			return mapped;
		}
		return mapped.reduce(function (acc, s) {
			if (typeof s === 'object') {
				return acc.concat(s);
			}
			var xs = s.split(RegExp('(' + TOKEN + '.*?' + TOKEN + ')', 'g'));
			if (xs.length === 1) {
				return acc.concat(xs[0]);
			}
			return acc.concat(xs.filter(Boolean).map(function (x) {
				if (startsWithToken.test(x)) {
					return JSON.parse(x.split(TOKEN)[1]);
				}
				return x;
			}));
		}, []);
	};
	return parse;
}

var hasRequiredShellQuote;

function requireShellQuote () {
	if (hasRequiredShellQuote) return shellQuote$1;
	hasRequiredShellQuote = 1;

	shellQuote$1.quote = requireQuote();
	shellQuote$1.parse = requireParse();
	return shellQuote$1;
}

var shellQuoteExports = requireShellQuote();
var shellQuote = /*@__PURE__*/getDefaultExportFromCjs(shellQuoteExports);

// eslint-disable-next-line no-warning-comments
// TODO: Use a better method when it's added to Node.js (https://github.com/nodejs/node/pull/40240)
// Lots of optionals here to support Deno.
const hasColors = tty?.WriteStream?.prototype?.hasColors?.() ?? false;

const format = (open, close) => {
	if (!hasColors) {
		return input => input;
	}

	const openCode = `\u001B[${open}m`;
	const closeCode = `\u001B[${close}m`;

	return input => {
		const string = input + ''; // eslint-disable-line no-implicit-coercion -- This is faster.
		let index = string.indexOf(closeCode);

		if (index === -1) {
			// Note: Intentionally not using string interpolation for performance reasons.
			return openCode + string + closeCode;
		}

		// Handle nested colors.

		// We could have done this, but it's too slow (as of Node.js 22).
		// return openCode + string.replaceAll(closeCode, openCode) + closeCode;

		let result = openCode;
		let lastIndex = 0;

		while (index !== -1) {
			result += string.slice(lastIndex, index) + openCode;
			lastIndex = index + closeCode.length;
			index = string.indexOf(closeCode, lastIndex);
		}

		result += string.slice(lastIndex) + closeCode;

		return result;
	};
};

const reset = format(0, 0);
const bold = format(1, 22);
const dim = format(2, 22);
const italic = format(3, 23);
const underline = format(4, 24);
const overline = format(53, 55);
const inverse = format(7, 27);
const hidden = format(8, 28);
const strikethrough = format(9, 29);

const black = format(30, 39);
const red = format(31, 39);
const green = format(32, 39);
const yellow = format(33, 39);
const blue = format(34, 39);
const magenta = format(35, 39);
const cyan = format(36, 39);
const white = format(37, 39);
const gray = format(90, 39);

const bgBlack = format(40, 49);
const bgRed = format(41, 49);
const bgGreen = format(42, 49);
const bgYellow = format(43, 49);
const bgBlue = format(44, 49);
const bgMagenta = format(45, 49);
const bgCyan = format(46, 49);
const bgWhite = format(47, 49);
const bgGray = format(100, 49);

const redBright = format(91, 39);
const greenBright = format(92, 39);
const yellowBright = format(93, 39);
const blueBright = format(94, 39);
const magentaBright = format(95, 39);
const cyanBright = format(96, 39);
const whiteBright = format(97, 39);

const bgRedBright = format(101, 49);
const bgGreenBright = format(102, 49);
const bgYellowBright = format(103, 49);
const bgBlueBright = format(104, 49);
const bgMagentaBright = format(105, 49);
const bgCyanBright = format(106, 49);
const bgWhiteBright = format(107, 49);

var yoctocolors = /*#__PURE__*/Object.freeze({
  __proto__: null,
  bgBlack: bgBlack,
  bgBlue: bgBlue,
  bgBlueBright: bgBlueBright,
  bgCyan: bgCyan,
  bgCyanBright: bgCyanBright,
  bgGray: bgGray,
  bgGreen: bgGreen,
  bgGreenBright: bgGreenBright,
  bgMagenta: bgMagenta,
  bgMagentaBright: bgMagentaBright,
  bgRed: bgRed,
  bgRedBright: bgRedBright,
  bgWhite: bgWhite,
  bgWhiteBright: bgWhiteBright,
  bgYellow: bgYellow,
  bgYellowBright: bgYellowBright,
  black: black,
  blue: blue,
  blueBright: blueBright,
  bold: bold,
  cyan: cyan,
  cyanBright: cyanBright,
  dim: dim,
  gray: gray,
  green: green,
  greenBright: greenBright,
  hidden: hidden,
  inverse: inverse,
  italic: italic,
  magenta: magenta,
  magentaBright: magentaBright,
  overline: overline,
  red: red,
  redBright: redBright,
  reset: reset,
  strikethrough: strikethrough,
  underline: underline,
  white: white,
  whiteBright: whiteBright,
  yellow: yellow,
  yellowBright: yellowBright
});

const isUnicodeSupported = y$1.platform !== 'win32'
	|| Boolean(y$1.env.WT_SESSION) // Windows Terminal
	|| y$1.env.TERM_PROGRAM === 'vscode';

const isInteractive = stream => Boolean(
	stream.isTTY
	&& y$1.env.TERM !== 'dumb'
	&& !('CI' in y$1.env),
);

const infoSymbol = blue(isUnicodeSupported ? 'ℹ' : 'i');
const successSymbol = green(isUnicodeSupported ? '✔' : '√');
const warningSymbol = yellow(isUnicodeSupported ? '⚠' : '‼');
const errorSymbol = red(isUnicodeSupported ? '✖' : '×');

const defaultSpinner = {
	frames: isUnicodeSupported
		? [
			'⠋',
			'⠙',
			'⠹',
			'⠸',
			'⠼',
			'⠴',
			'⠦',
			'⠧',
			'⠇',
			'⠏',
		]
		: [
			'-',
			'\\',
			'|',
			'/',
		],
	interval: 80,
};

class YoctoSpinner {
	#frames;
	#interval;
	#currentFrame = -1;
	#timer;
	#text;
	#stream;
	#color;
	#lines = 0;
	#exitHandlerBound;
	#isInteractive;
	#lastSpinnerFrameTime = 0;

	constructor(options = {}) {
		const spinner = options.spinner ?? defaultSpinner;
		this.#frames = spinner.frames;
		this.#interval = spinner.interval;
		this.#text = options.text ?? '';
		this.#stream = options.stream ?? y$1.stderr;
		this.#color = options.color ?? 'cyan';
		this.#isInteractive = isInteractive(this.#stream);
		this.#exitHandlerBound = this.#exitHandler.bind(this);
	}

	start(text) {
		if (text) {
			this.#text = text;
		}

		if (this.isSpinning) {
			return this;
		}

		this.#hideCursor();
		this.#render();
		this.#subscribeToProcessEvents();

		this.#timer = setInterval(() => {
			this.#render();
		}, this.#interval);

		return this;
	}

	stop(finalText) {
		if (!this.isSpinning) {
			return this;
		}

		clearInterval(this.#timer);
		this.#timer = undefined;
		this.#showCursor();
		this.clear();
		this.#unsubscribeFromProcessEvents();

		if (finalText) {
			this.#stream.write(`${finalText}\n`);
		}

		return this;
	}

	#symbolStop(symbol, text) {
		return this.stop(`${symbol} ${text ?? this.#text}`);
	}

	success(text) {
		return this.#symbolStop(successSymbol, text);
	}

	error(text) {
		return this.#symbolStop(errorSymbol, text);
	}

	warning(text) {
		return this.#symbolStop(warningSymbol, text);
	}

	info(text) {
		return this.#symbolStop(infoSymbol, text);
	}

	get isSpinning() {
		return this.#timer !== undefined;
	}

	get text() {
		return this.#text;
	}

	set text(value) {
		this.#text = value ?? '';
		this.#render();
	}

	get color() {
		return this.#color;
	}

	set color(value) {
		this.#color = value;
		this.#render();
	}

	clear() {
		if (!this.#isInteractive) {
			return this;
		}

		this.#stream.cursorTo(0);

		for (let index = 0; index < this.#lines; index++) {
			if (index > 0) {
				this.#stream.moveCursor(0, -1);
			}

			this.#stream.clearLine(1);
		}

		this.#lines = 0;

		return this;
	}

	#render() {
		// Ensure we only update the spinner frame at the wanted interval,
		// even if the frame method is called more often.
		const now = Date.now();
		if (this.#currentFrame === -1 || now - this.#lastSpinnerFrameTime >= this.#interval) {
			this.#currentFrame = ++this.#currentFrame % this.#frames.length;
			this.#lastSpinnerFrameTime = now;
		}

		const applyColor = yoctocolors[this.#color] ?? cyan;
		const frame = this.#frames[this.#currentFrame];
		let string = `${applyColor(frame)} ${this.#text}`;

		if (!this.#isInteractive) {
			string += '\n';
		}

		this.clear();
		this.#write(string);

		if (this.#isInteractive) {
			this.#lines = this.#lineCount(string);
		}
	}

	#write(text) {
		this.#stream.write(text);
	}

	#lineCount(text) {
		const width = this.#stream.columns ?? 80;
		const lines = stripVTControlCharacters(text).split('\n');

		let lineCount = 0;
		for (const line of lines) {
			lineCount += Math.max(1, Math.ceil(line.length / width));
		}

		return lineCount;
	}

	#hideCursor() {
		if (this.#isInteractive) {
			this.#write('\u001B[?25l');
		}
	}

	#showCursor() {
		if (this.#isInteractive) {
			this.#write('\u001B[?25h');
		}
	}

	#subscribeToProcessEvents() {
		y$1.once('SIGINT', this.#exitHandlerBound);
		y$1.once('SIGTERM', this.#exitHandlerBound);
	}

	#unsubscribeFromProcessEvents() {
		y$1.off('SIGINT', this.#exitHandlerBound);
		y$1.off('SIGTERM', this.#exitHandlerBound);
	}

	#exitHandler(signal) {
		if (this.isSpinning) {
			this.stop();
		}

		// SIGINT: 128 + 2
		// SIGTERM: 128 + 15
		const exitCode = signal === 'SIGINT' ? 130 : (signal === 'SIGTERM' ? 143 : 1);
		y$1.exit(exitCode);
	}
}

function yoctoSpinner(options) {
	return new YoctoSpinner(options);
}

var LogLevel = {
  INFO: "info",
  ERROR: "error"};
var MastraLogger = class {
  name;
  level;
  transports;
  constructor(options = {}) {
    this.name = options.name || "Mastra";
    this.level = options.level || LogLevel.ERROR;
    this.transports = new Map(Object.entries(options.transports || {}));
  }
  getTransports() {
    return this.transports;
  }
  trackException(_error) {
  }
  async getLogs(transportId, params) {
    if (!transportId || !this.transports.has(transportId)) {
      return { logs: [], total: 0, page: params?.page ?? 1, perPage: params?.perPage ?? 100, hasMore: false };
    }
    return this.transports.get(transportId).getLogs(params) ?? {
      logs: [],
      total: 0,
      page: params?.page ?? 1,
      perPage: params?.perPage ?? 100,
      hasMore: false
    };
  }
  async getLogsByRunId({
    transportId,
    runId,
    fromDate,
    toDate,
    logLevel,
    filters,
    page,
    perPage
  }) {
    if (!transportId || !this.transports.has(transportId) || !runId) {
      return { logs: [], total: 0, page: page ?? 1, perPage: perPage ?? 100, hasMore: false };
    }
    return this.transports.get(transportId).getLogsByRunId({ runId, fromDate, toDate, logLevel, filters, page, perPage }) ?? {
      logs: [],
      total: 0,
      page: page ?? 1,
      perPage: perPage ?? 100,
      hasMore: false
    };
  }
};

var PinoLogger = class extends MastraLogger {
  logger;
  constructor(options = {}) {
    super(options);
    let prettyStream = void 0;
    if (!options.overrideDefaultTransports) {
      prettyStream = pretty({
        colorize: true,
        levelFirst: true,
        ignore: "pid,hostname",
        colorizeObjects: true,
        translateTime: "SYS:standard",
        singleLine: false
      });
    }
    const transportsAry = [...this.getTransports().entries()];
    this.logger = pino(
      {
        name: options.name || "app",
        level: options.level || LogLevel.INFO,
        formatters: {
          level: (label) => ({ level: label })
        }
      },
      options.overrideDefaultTransports ? options?.transports?.default : transportsAry.length === 0 ? prettyStream : pino.multistream([
        ...transportsAry.map(([, transport]) => ({
          stream: transport,
          level: options.level || LogLevel.INFO
        })),
        {
          stream: prettyStream,
          level: options.level || LogLevel.INFO
        }
      ])
    );
  }
  debug(message, args = {}) {
    this.logger.debug(args, message);
  }
  info(message, args = {}) {
    this.logger.info(args, message);
  }
  warn(message, args = {}) {
    this.logger.warn(args, message);
  }
  error(message, args = {}) {
    this.logger.error(args, message);
  }
};

var DepsService = class {
  packageManager;
  constructor() {
    this.packageManager = this.getPackageManager();
  }
  findLockFile(dir) {
    const lockFiles = ["pnpm-lock.yaml", "package-lock.json", "yarn.lock", "bun.lock"];
    for (const file of lockFiles) {
      if (fs3__default__default.existsSync(path2.join(dir, file))) {
        return file;
      }
    }
    const parentDir = path2.resolve(dir, "..");
    if (parentDir !== dir) {
      return this.findLockFile(parentDir);
    }
    return null;
  }
  getPackageManager() {
    const lockFile = this.findLockFile(process.cwd());
    switch (lockFile) {
      case "pnpm-lock.yaml":
        return "pnpm";
      case "package-lock.json":
        return "npm";
      case "yarn.lock":
        return "yarn";
      case "bun.lock":
        return "bun";
      default:
        return "npm";
    }
  }
  async installPackages(packages) {
    let runCommand = this.packageManager;
    if (this.packageManager === "npm") {
      runCommand = `${this.packageManager} i`;
    } else {
      runCommand = `${this.packageManager} add`;
    }
    const packageList = packages.join(" ");
    return execa(`${runCommand} ${packageList}`, {
      all: true,
      shell: true,
      stdio: "inherit"
    });
  }
  async checkDependencies(dependencies) {
    try {
      const packageJsonPath = path2.join(process.cwd(), "package.json");
      try {
        await fs4.access(packageJsonPath);
      } catch {
        return "No package.json file found in the current directory";
      }
      const packageJson = JSON.parse(await fs4.readFile(packageJsonPath, "utf-8"));
      for (const dependency of dependencies) {
        if (!packageJson.dependencies || !packageJson.dependencies[dependency]) {
          return `Please install ${dependency} before running this command (${this.packageManager} install ${dependency})`;
        }
      }
      return "ok";
    } catch (err) {
      console.error(err);
      return "Could not check dependencies";
    }
  }
  async getProjectName() {
    try {
      const packageJsonPath = path2.join(process.cwd(), "package.json");
      const packageJson = await fs4.readFile(packageJsonPath, "utf-8");
      const pkg = JSON.parse(packageJson);
      return pkg.name;
    } catch (err) {
      throw err;
    }
  }
  async getPackageVersion() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const pkgJsonPath = path2.join(__dirname, "..", "package.json");
    const content = await fsExtra3.readJSON(pkgJsonPath);
    return content.version;
  }
  async addScriptsToPackageJson(scripts) {
    const packageJson = JSON.parse(await fs4.readFile("package.json", "utf-8"));
    packageJson.scripts = {
      ...packageJson.scripts,
      ...scripts
    };
    await fs4.writeFile("package.json", JSON.stringify(packageJson, null, 2));
  }
};
function getPackageManager() {
  const userAgent = process.env.npm_config_user_agent || "";
  const execPath = process.env.npm_execpath || "";
  if (userAgent.includes("yarn")) {
    return "yarn";
  }
  if (userAgent.includes("pnpm")) {
    return "pnpm";
  }
  if (userAgent.includes("npm")) {
    return "npm";
  }
  if (execPath.includes("yarn")) {
    return "yarn";
  }
  if (execPath.includes("pnpm")) {
    return "pnpm";
  }
  if (execPath.includes("npm")) {
    return "npm";
  }
  return "npm";
}
function getPackageManagerInstallCommand(pm) {
  switch (pm) {
    case "npm":
      return "install";
    case "yarn":
      return "add";
    case "pnpm":
      return "add";
    default:
      return "install";
  }
}
var args = ["-y", "@mastra/mcp-docs-server"];
var createMcpConfig = (editor) => {
  if (editor === "vscode") {
    return {
      servers: {
        mastra: process.platform === `win32` ? {
          command: "cmd",
          args: ["/c", "npx", ...args],
          type: "stdio"
        } : {
          command: "npx",
          args,
          type: "stdio"
        }
      }
    };
  }
  return {
    mcpServers: {
      mastra: {
        command: "npx",
        args
      }
    }
  };
};
function makeConfig(original, editor) {
  if (editor === "vscode") {
    return {
      ...original,
      servers: {
        ...original?.servers || {},
        ...createMcpConfig(editor).servers
      }
    };
  }
  return {
    ...original,
    mcpServers: {
      ...original?.mcpServers || {},
      ...createMcpConfig(editor).mcpServers
    }
  };
}
async function writeMergedConfig(configPath, editor) {
  const configExists = existsSync(configPath);
  const config = makeConfig(configExists ? await readJSON(configPath) : {}, editor);
  await ensureFile(configPath);
  await writeJSON(configPath, config, {
    spaces: 2
  });
}
var windsurfGlobalMCPConfigPath = path2.join(os.homedir(), ".codeium", "windsurf", "mcp_config.json");
var cursorGlobalMCPConfigPath = path2.join(os.homedir(), ".cursor", "mcp.json");
path2.join(process.cwd(), ".vscode", "mcp.json");
var vscodeGlobalMCPConfigPath = path2.join(
  os.homedir(),
  process.platform === "win32" ? path2.join("AppData", "Roaming", "Code", "User", "settings.json") : process.platform === "darwin" ? path2.join("Library", "Application Support", "Code", "User", "settings.json") : path2.join(".config", "Code", "User", "settings.json")
);
async function installMastraDocsMCPServer({ editor, directory }) {
  if (editor === `cursor`) {
    await writeMergedConfig(path2.join(directory, ".cursor", "mcp.json"), "cursor");
  }
  if (editor === `vscode`) {
    await writeMergedConfig(path2.join(directory, ".vscode", "mcp.json"), "vscode");
  }
  if (editor === `cursor-global`) {
    const alreadyInstalled = await globalMCPIsAlreadyInstalled(editor);
    if (alreadyInstalled) {
      return;
    }
    await writeMergedConfig(cursorGlobalMCPConfigPath, "cursor-global");
  }
  if (editor === `windsurf`) {
    const alreadyInstalled = await globalMCPIsAlreadyInstalled(editor);
    if (alreadyInstalled) {
      return;
    }
    await writeMergedConfig(windsurfGlobalMCPConfigPath, editor);
  }
}
async function globalMCPIsAlreadyInstalled(editor) {
  let configPath = ``;
  if (editor === "windsurf") {
    configPath = windsurfGlobalMCPConfigPath;
  } else if (editor === "cursor-global") {
    configPath = cursorGlobalMCPConfigPath;
  } else if (editor === "vscode") {
    configPath = vscodeGlobalMCPConfigPath;
  }
  if (!configPath || !existsSync(configPath)) {
    return false;
  }
  try {
    const configContents = await readJSON(configPath);
    if (!configContents) return false;
    if (editor === "vscode") {
      if (!configContents.servers) return false;
      const hasMastraMCP2 = Object.values(configContents.servers).some(
        (server) => server?.args?.find((arg) => arg?.includes(`@mastra/mcp-docs-server`))
      );
      return hasMastraMCP2;
    }
    if (!configContents?.mcpServers) return false;
    const hasMastraMCP = Object.values(configContents.mcpServers).some(
      (server) => server?.args?.find((arg) => arg?.includes(`@mastra/mcp-docs-server`))
    );
    return hasMastraMCP;
  } catch {
    return false;
  }
}
var EnvService = class {
};
var FileEnvService = class extends EnvService {
  filePath;
  constructor(filePath) {
    super();
    this.filePath = filePath;
  }
  readFile(filePath) {
    return new Promise((resolve, reject) => {
      fs3__default.readFile(filePath, "utf8", (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
  writeFile({ filePath, data }) {
    return new Promise((resolve, reject) => {
      fs3__default.writeFile(filePath, data, "utf8", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  async updateEnvData({
    key,
    value,
    filePath = this.filePath,
    data
  }) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (data.match(regex)) {
      data = data.replace(regex, `${key}=${value}`);
    } else {
      data += `
${key}=${value}`;
    }
    await this.writeFile({ filePath, data });
    console.log(`${key} set to ${value} in ENV file.`);
    return data;
  }
  async getEnvValue(key) {
    try {
      const data = await this.readFile(this.filePath);
      const regex = new RegExp(`^${key}=(.*)$`, "m");
      const match = data.match(regex);
      return match?.[1] || null;
    } catch (err) {
      console.error(`Error reading ENV value: ${err}`);
      return null;
    }
  }
  async setEnvValue(key, value) {
    try {
      const data = await this.readFile(this.filePath);
      await this.updateEnvData({ key, value, data });
    } catch (err) {
      console.error(`Error writing ENV value: ${err}`);
    }
  }
};
var FileService = class {
  /**
   *
   * @param inputFile the file in the starter files directory to copy
   * @param outputFilePath the destination path
   * @param replaceIfExists flag to replace if it exists
   * @returns
   */
  async copyStarterFile(inputFile, outputFilePath, replaceIfExists) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path2.dirname(__filename);
    const filePath = path2.resolve(__dirname, "starter-files", inputFile);
    const fileString = fs3__default__default.readFileSync(filePath, "utf8");
    if (fs3__default__default.existsSync(outputFilePath) && !replaceIfExists) {
      console.log(`${outputFilePath} already exists`);
      return false;
    }
    await fsExtra3.outputFile(outputFilePath, fileString);
    return true;
  }
  async setupEnvFile({ dbUrl }) {
    const envPath = path2.join(process.cwd(), ".env.development");
    await fsExtra3.ensureFile(envPath);
    const fileEnvService = new FileEnvService(envPath);
    await fileEnvService.setEnvValue("DB_URL", dbUrl);
  }
  getFirstExistingFile(files) {
    for (const f of files) {
      if (fs3__default__default.existsSync(f)) {
        return f;
      }
    }
    throw new Error("Missing required file, checked the following paths: " + files.join(", "));
  }
  replaceValuesInFile({
    filePath,
    replacements
  }) {
    let fileContent = fs3__default__default.readFileSync(filePath, "utf8");
    replacements.forEach(({ search, replace }) => {
      fileContent = fileContent.replaceAll(search, replace);
    });
    fs3__default__default.writeFileSync(filePath, fileContent);
  }
};
new PinoLogger({
  name: "Mastra CLI",
  level: "info"
});
var exec = util.promisify(child_process.exec);
var getAISDKPackage = (llmProvider) => {
  switch (llmProvider) {
    case "openai":
      return "@ai-sdk/openai";
    case "anthropic":
      return "@ai-sdk/anthropic";
    case "groq":
      return "@ai-sdk/groq";
    case "google":
      return "@ai-sdk/google";
    case "cerebras":
      return "@ai-sdk/cerebras";
    default:
      return "@ai-sdk/openai";
  }
};
var getProviderImportAndModelItem = (llmProvider) => {
  let providerImport = "";
  let modelItem = "";
  if (llmProvider === "openai") {
    providerImport = `import { openai } from '${getAISDKPackage(llmProvider)}';`;
    modelItem = `openai('gpt-4o-mini')`;
  } else if (llmProvider === "anthropic") {
    providerImport = `import { anthropic } from '${getAISDKPackage(llmProvider)}';`;
    modelItem = `anthropic('claude-3-5-sonnet-20241022')`;
  } else if (llmProvider === "groq") {
    providerImport = `import { groq } from '${getAISDKPackage(llmProvider)}';`;
    modelItem = `groq('llama-3.3-70b-versatile')`;
  } else if (llmProvider === "google") {
    providerImport = `import { google } from '${getAISDKPackage(llmProvider)}';`;
    modelItem = `google('gemini-1.5-pro-latest')`;
  } else if (llmProvider === "cerebras") {
    providerImport = `import { cerebras } from '${getAISDKPackage(llmProvider)}';`;
    modelItem = `cerebras('llama-3.3-70b')`;
  }
  return { providerImport, modelItem };
};
async function writeAgentSample(llmProvider, destPath, addExampleTool) {
  const { providerImport, modelItem } = getProviderImportAndModelItem(llmProvider);
  const instructions = `
      You are a helpful weather assistant that provides accurate weather information.

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn\u2019t in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative

      ${addExampleTool ? "Use the weatherTool to fetch current weather data." : ""}
`;
  const content = `
${providerImport}
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
${addExampleTool ? `import { weatherTool } from '../tools/weather-tool';` : ""}

export const weatherAgent = new Agent({
  name: 'Weather Agent',
  instructions: \`${instructions}\`,
  model: ${modelItem},
  ${addExampleTool ? "tools: { weatherTool }," : ""}
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db", // path is relative to the .mastra/output directory
    })
  })
});
    `;
  const formattedContent = await prettier.format(content, {
    parser: "typescript",
    singleQuote: true
  });
  await fs4.writeFile(destPath, "");
  await fs4.writeFile(destPath, formattedContent);
}
async function writeWorkflowSample(destPath, llmProvider) {
  const { providerImport, modelItem } = getProviderImportAndModelItem(llmProvider);
  const content = `${providerImport}
import { Agent } from '@mastra/core/agent';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const llm = ${modelItem};

const agent = new Agent({
  name: 'Weather Agent',
  model: llm,
  instructions: \`
        You are a local activities and travel expert who excels at weather-based planning. Analyze the weather data and provide practical activity recommendations.

        For each day in the forecast, structure your response exactly as follows:

        \u{1F4C5} [Day, Month Date, Year]
        \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

        \u{1F321}\uFE0F WEATHER SUMMARY
        \u2022 Conditions: [brief description]
        \u2022 Temperature: [X\xB0C/Y\xB0F to A\xB0C/B\xB0F]
        \u2022 Precipitation: [X% chance]

        \u{1F305} MORNING ACTIVITIES
        Outdoor:
        \u2022 [Activity Name] - [Brief description including specific location/route]
          Best timing: [specific time range]
          Note: [relevant weather consideration]

        \u{1F31E} AFTERNOON ACTIVITIES
        Outdoor:
        \u2022 [Activity Name] - [Brief description including specific location/route]
          Best timing: [specific time range]
          Note: [relevant weather consideration]

        \u{1F3E0} INDOOR ALTERNATIVES
        \u2022 [Activity Name] - [Brief description including specific venue]
          Ideal for: [weather condition that would trigger this alternative]

        \u26A0\uFE0F SPECIAL CONSIDERATIONS
        \u2022 [Any relevant weather warnings, UV index, wind conditions, etc.]

        Guidelines:
        - Suggest 2-3 time-specific outdoor activities per day
        - Include 1-2 indoor backup options
        - For precipitation >50%, lead with indoor activities
        - All activities must be specific to the location
        - Include specific venues, trails, or locations
        - Consider activity intensity based on temperature
        - Keep descriptions concise but informative

        Maintain this exact formatting for consistency, using the emoji and section headers as shown.
      \`,
});

const forecastSchema = z.object({
  date: z.string(),
  maxTemp: z.number(),
  minTemp: z.number(),
  precipitationChance: z.number(),
  condition: z.string(),
  location: z.string(),
})

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    95: 'Thunderstorm',
  }
  return conditions[code] || 'Unknown'
}

const fetchWeather = createStep({
  id: 'fetch-weather',
  description: 'Fetches weather forecast for a given city',
  inputSchema: z.object({
    city: z.string().describe('The city to get the weather for'),
  }),
  outputSchema: forecastSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error('Input data not found');
    }

    const geocodingUrl = \`https://geocoding-api.open-meteo.com/v1/search?name=\${encodeURIComponent(inputData.city)}&count=1\`;
    const geocodingResponse = await fetch(geocodingUrl);
    const geocodingData = (await geocodingResponse.json()) as {
      results: { latitude: number; longitude: number; name: string }[];
    };

    if (!geocodingData.results?.[0]) {
      throw new Error(\`Location '\${inputData.city}' not found\`);
    }

    const { latitude, longitude, name } = geocodingData.results[0];

    const weatherUrl = \`https://api.open-meteo.com/v1/forecast?latitude=\${latitude}&longitude=\${longitude}&current=precipitation,weathercode&timezone=auto,&hourly=precipitation_probability,temperature_2m\`;
    const response = await fetch(weatherUrl);
    const data = (await response.json()) as {
      current: {
        time: string
        precipitation: number
        weathercode: number
      }
      hourly: {
        precipitation_probability: number[]
        temperature_2m: number[]
      }
    }

    const forecast = {
      date: new Date().toISOString(),
      maxTemp: Math.max(...data.hourly.temperature_2m),
      minTemp: Math.min(...data.hourly.temperature_2m),
      condition: getWeatherCondition(data.current.weathercode),
      precipitationChance: data.hourly.precipitation_probability.reduce(
        (acc, curr) => Math.max(acc, curr),
        0
      ),
      location: name
    }

    return forecast;
  },
});


const planActivities = createStep({
  id: 'plan-activities',
  description: 'Suggests activities based on weather conditions',
  inputSchema: forecastSchema,
  outputSchema: z.object({
    activities: z.string(),
  }),
  execute: async ({ inputData }) => {
    const forecast = inputData

    if (!forecast) {
      throw new Error('Forecast data not found')
    }

    const prompt = \`Based on the following weather forecast for \${forecast.location}, suggest appropriate activities:
      \${JSON.stringify(forecast, null, 2)}
      \`;

    const response = await agent.stream([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    let activitiesText = '';

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      activitiesText += chunk;
    }

    return {
      activities: activitiesText,
    };
  },
});

const weatherWorkflow = createWorkflow({
  id: 'weather-workflow',
  inputSchema: z.object({
    city: z.string().describe('The city to get the weather for'),
  }),
  outputSchema: z.object({
    activities: z.string(),
  })
})
  .then(fetchWeather)
  .then(planActivities);

weatherWorkflow.commit();

export { weatherWorkflow };`;
  const formattedContent = await prettier.format(content, {
    parser: "typescript",
    semi: true,
    singleQuote: true
  });
  await fs4.writeFile(destPath, formattedContent);
}
async function writeToolSample(destPath) {
  const fileService = new FileService();
  await fileService.copyStarterFile("tools.ts", destPath);
}
async function writeCodeSampleForComponents(llmprovider, component, destPath, importComponents) {
  switch (component) {
    case "agents":
      return writeAgentSample(llmprovider, destPath, importComponents.includes("tools"));
    case "tools":
      return writeToolSample(destPath);
    case "workflows":
      return writeWorkflowSample(destPath, llmprovider);
    default:
      return "";
  }
}
var createComponentsDir = async (dirPath, component) => {
  const componentPath = dirPath + `/${component}`;
  await fsExtra3.ensureDir(componentPath);
};
var writeIndexFile = async ({
  dirPath,
  addAgent,
  addExample,
  addWorkflow
}) => {
  const indexPath = dirPath + "/index.ts";
  const destPath = path2.join(indexPath);
  try {
    await fs4.writeFile(destPath, "");
    const filteredExports = [
      addWorkflow ? `workflows: { weatherWorkflow },` : "",
      addAgent ? `agents: { weatherAgent },` : ""
    ].filter(Boolean);
    if (!addExample) {
      await fs4.writeFile(
        destPath,
        `
import { Mastra } from '@mastra/core';

export const mastra = new Mastra()
        `
      );
      return;
    }
    await fs4.writeFile(
      destPath,
      `
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
${addWorkflow ? `import { weatherWorkflow } from './workflows/weather-workflow';` : ""}
${addAgent ? `import { weatherAgent } from './agents/weather-agent';` : ""}

export const mastra = new Mastra({
  ${filteredExports.join("\n  ")}
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
`
    );
  } catch (err) {
    throw err;
  }
};
yoctoSpinner({ text: "Installing Mastra core dependencies\n" });
var getAPIKey = async (provider) => {
  let key = "OPENAI_API_KEY";
  switch (provider) {
    case "anthropic":
      key = "ANTHROPIC_API_KEY";
      return key;
    case "groq":
      key = "GROQ_API_KEY";
      return key;
    case "google":
      key = "GOOGLE_GENERATIVE_AI_API_KEY";
      return key;
    case "cerebras":
      key = "CEREBRAS_API_KEY";
      return key;
    default:
      return key;
  }
};
var writeAPIKey = async ({
  provider,
  apiKey = "your-api-key"
}) => {
  const key = await getAPIKey(provider);
  const escapedKey = shellQuote.quote([key]);
  const escapedApiKey = shellQuote.quote([apiKey]);
  await exec(`echo ${escapedKey}=${escapedApiKey} >> .env`);
};
var createMastraDir = async (directory) => {
  let dir = directory.trim().split("/").filter((item) => item !== "");
  const dirPath = path2.join(process.cwd(), ...dir, "mastra");
  try {
    await fs4.access(dirPath);
    return { ok: false };
  } catch {
    await fsExtra3.ensureDir(dirPath);
    return { ok: true, dirPath };
  }
};
var writeCodeSample = async (dirPath, component, llmProvider, importComponents) => {
  const destPath = dirPath + `/${component}/weather-${component.slice(0, -1)}.ts`;
  try {
    await writeCodeSampleForComponents(llmProvider, component, destPath, importComponents);
  } catch (err) {
    throw err;
  }
};
var interactivePrompt = async () => {
  Ie(color2.inverse(" Mastra Init "));
  const mastraProject = await Ce(
    {
      directory: () => he({
        message: "Where should we create the Mastra files? (default: src/)",
        placeholder: "src/",
        defaultValue: "src/"
      }),
      llmProvider: () => ve({
        message: "Select default provider:",
        options: [
          { value: "openai", label: "OpenAI", hint: "recommended" },
          { value: "anthropic", label: "Anthropic" },
          { value: "groq", label: "Groq" },
          { value: "google", label: "Google" },
          { value: "cerebras", label: "Cerebras" }
        ]
      }),
      llmApiKey: async ({ results: { llmProvider } }) => {
        const keyChoice = await ve({
          message: `Enter your ${llmProvider} API key?`,
          options: [
            { value: "skip", label: "Skip for now", hint: "default" },
            { value: "enter", label: "Enter API key" }
          ],
          initialValue: "skip"
        });
        if (keyChoice === "enter") {
          return he({
            message: "Enter your API key:",
            placeholder: "sk-..."
          });
        }
        return void 0;
      },
      configureEditorWithDocsMCP: async () => {
        const windsurfIsAlreadyInstalled = await globalMCPIsAlreadyInstalled(`windsurf`);
        const cursorIsAlreadyInstalled = await globalMCPIsAlreadyInstalled(`cursor`);
        const vscodeIsAlreadyInstalled = await globalMCPIsAlreadyInstalled(`vscode`);
        const editor = await ve({
          message: `Make your AI IDE into a Mastra expert? (installs Mastra docs MCP server)`,
          options: [
            { value: "skip", label: "Skip for now", hint: "default" },
            {
              value: "cursor",
              label: "Cursor (project only)",
              hint: cursorIsAlreadyInstalled ? `Already installed globally` : void 0
            },
            {
              value: "cursor-global",
              label: "Cursor (global, all projects)",
              hint: cursorIsAlreadyInstalled ? `Already installed` : void 0
            },
            {
              value: "windsurf",
              label: "Windsurf",
              hint: windsurfIsAlreadyInstalled ? `Already installed` : void 0
            },
            {
              value: "vscode",
              label: "VSCode",
              hint: vscodeIsAlreadyInstalled ? `Already installed` : void 0
            }
          ]
        });
        if (editor === `skip`) return void 0;
        if (editor === `windsurf` && windsurfIsAlreadyInstalled) {
          M.message(`
Windsurf is already installed, skipping.`);
          return void 0;
        }
        if (editor === `vscode` && vscodeIsAlreadyInstalled) {
          M.message(`
VSCode is already installed, skipping.`);
          return void 0;
        }
        if (editor === `cursor`) {
          M.message(
            `
Note: you will need to go into Cursor Settings -> MCP Settings and manually enable the installed Mastra MCP server.
`
          );
        }
        if (editor === `cursor-global`) {
          const confirm2 = await ve({
            message: `Global install will add/update ${cursorGlobalMCPConfigPath} and make the Mastra docs MCP server available in all your Cursor projects. Continue?`,
            options: [
              { value: "yes", label: "Yes, I understand" },
              { value: "skip", label: "No, skip for now" }
            ]
          });
          if (confirm2 !== `yes`) {
            return void 0;
          }
        }
        if (editor === `windsurf`) {
          const confirm2 = await ve({
            message: `Windsurf only supports a global MCP config (at ${windsurfGlobalMCPConfigPath}) is it ok to add/update that global config?
This means the Mastra docs MCP server will be available in all your Windsurf projects.`,
            options: [
              { value: "yes", label: "Yes, I understand" },
              { value: "skip", label: "No, skip for now" }
            ]
          });
          if (confirm2 !== `yes`) {
            return void 0;
          }
        }
        return editor;
      }
    },
    {
      onCancel: () => {
        xe("Operation cancelled.");
        process.exit(0);
      }
    }
  );
  return mastraProject;
};
var s = Y();
var exec2 = util.promisify(child_process.exec);
var init = async ({
  directory,
  addExample = false,
  components,
  llmProvider = "openai",
  llmApiKey,
  configureEditorWithDocsMCP
}) => {
  s.start("Initializing Mastra");
  try {
    const result = await createMastraDir(directory);
    if (!result.ok) {
      s.stop(color2.inverse(" Mastra already initialized "));
      return { success: false };
    }
    const dirPath = result.dirPath;
    await Promise.all([
      writeIndexFile({
        dirPath,
        addExample,
        addWorkflow: components.includes("workflows"),
        addAgent: components.includes("agents")
      }),
      ...components.map((component) => createComponentsDir(dirPath, component)),
      writeAPIKey({ provider: llmProvider, apiKey: llmApiKey })
    ]);
    if (addExample) {
      await Promise.all([
        ...components.map(
          (component) => writeCodeSample(dirPath, component, llmProvider, components)
        )
      ]);
      const depService = new DepsService();
      const needsLibsql = await depService.checkDependencies(["@mastra/libsql"]) !== `ok`;
      if (needsLibsql) {
        await depService.installPackages(["@mastra/libsql"]);
      }
      const needsMemory = components.includes(`agents`) && await depService.checkDependencies(["@mastra/memory"]) !== `ok`;
      if (needsMemory) {
        await depService.installPackages(["@mastra/memory"]);
      }
      const needsLoggers = await depService.checkDependencies(["@mastra/loggers"]) !== `ok`;
      if (needsLoggers) {
        await depService.installPackages(["@mastra/loggers"]);
      }
    }
    const key = await getAPIKey(llmProvider || "openai");
    const aiSdkPackage = getAISDKPackage(llmProvider);
    const depsService = new DepsService();
    const pm = depsService.packageManager;
    const installCommand = getPackageManagerInstallCommand(pm);
    await exec2(`${pm} ${installCommand} ${aiSdkPackage}`);
    if (configureEditorWithDocsMCP) {
      await installMastraDocsMCPServer({
        editor: configureEditorWithDocsMCP,
        directory: process.cwd()
      });
    }
    s.stop();
    if (!llmApiKey) {
      Me(`
      ${color2.green("Mastra initialized successfully!")}

      Add your ${color2.cyan(key)} as an environment variable
      in your ${color2.cyan(".env")} file
      `);
    } else {
      Me(`
      ${color2.green("Mastra initialized successfully!")}
      `);
    }
    return { success: true };
  } catch (err) {
    s.stop(color2.inverse("An error occurred while initializing Mastra"));
    console.error(err);
    return { success: false };
  }
};
var exec3 = util.promisify(child_process.exec);
var execWithTimeout = async (command, timeoutMs) => {
  try {
    const promise = exec3(command, { killSignal: "SIGTERM" });
    if (!timeoutMs) {
      return await promise;
    }
    let timeoutId;
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Command timed out")), timeoutMs);
    });
    try {
      const result = await Promise.race([promise, timeout]);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.message === "Command timed out") {
        throw new Error("Something went wrong during installation, please try again.");
      }
      throw error;
    }
  } catch (error) {
    throw error;
  }
};
async function installMastraDependency(pm, dependency, versionTag, isDev, timeout) {
  let installCommand = getPackageManagerInstallCommand(pm);
  if (isDev) {
    installCommand = `${installCommand} --save-dev`;
  }
  try {
    await execWithTimeout(`${pm} ${installCommand} ${dependency}${versionTag}`, timeout);
  } catch (err) {
    if (versionTag === "@latest") {
      throw new Error(
        `Failed to install ${dependency}@latest: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
    try {
      await execWithTimeout(`${pm} ${installCommand} ${dependency}@latest`, timeout);
    } catch (fallbackErr) {
      throw new Error(
        `Failed to install ${dependency} (tried ${versionTag} and @latest): ${fallbackErr instanceof Error ? fallbackErr.message : "Unknown error"}`
      );
    }
  }
}
var createMastraProject = async ({
  projectName: name,
  createVersionTag,
  timeout
}) => {
  Ie(color2.inverse(" Mastra Create "));
  const projectName = name ?? await he({
    message: "What do you want to name your project?",
    placeholder: "my-mastra-app",
    defaultValue: "my-mastra-app"
  });
  if (pD(projectName)) {
    xe("Operation cancelled");
    process.exit(0);
  }
  const s2 = Y();
  try {
    s2.start("Creating project");
    try {
      await fs4.mkdir(projectName);
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "EEXIST") {
        s2.stop(`A directory named "${projectName}" already exists. Please choose a different name.`);
        process.exit(1);
      }
      throw new Error(
        `Failed to create project directory: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
    process.chdir(projectName);
    const pm = getPackageManager();
    const installCommand = getPackageManagerInstallCommand(pm);
    s2.message("Initializing project structure");
    try {
      await exec3(`npm init -y`);
      await exec3(`npm pkg set type="module"`);
      await exec3(`npm pkg set engines.node=">=20.9.0"`);
      const depsService = new DepsService();
      await depsService.addScriptsToPackageJson({
        dev: "mastra dev",
        build: "mastra build",
        start: "mastra start"
      });
    } catch (error) {
      throw new Error(
        `Failed to initialize project structure: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
    s2.stop("Project structure created");
    s2.start(`Installing ${pm} dependencies`);
    try {
      await exec3(`${pm} ${installCommand} zod`);
      await exec3(`${pm} ${installCommand} typescript @types/node --save-dev`);
      await exec3(`echo '{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "outDir": "dist"
  },
  "include": [
    "src/**/*"
  ]
}' > tsconfig.json`);
    } catch (error) {
      throw new Error(
        `Failed to install basic dependencies: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
    s2.stop(`${pm} dependencies installed`);
    s2.start("Installing mastra");
    const versionTag = createVersionTag ? `@${createVersionTag}` : "@latest";
    try {
      await installMastraDependency(pm, "mastra", versionTag, true, timeout);
    } catch (error) {
      throw new Error(`Failed to install Mastra CLI: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
    s2.stop("mastra installed");
    s2.start("Installing dependencies");
    try {
      await installMastraDependency(pm, "@mastra/core", versionTag, false, timeout);
      await installMastraDependency(pm, "@mastra/libsql", versionTag, false, timeout);
      await installMastraDependency(pm, "@mastra/memory", versionTag, false, timeout);
    } catch (error) {
      throw new Error(
        `Failed to install Mastra dependencies: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
    s2.stop("Mastra dependencies installed");
    s2.start("Adding .gitignore");
    try {
      await exec3(`echo output.txt >> .gitignore`);
      await exec3(`echo node_modules >> .gitignore`);
      await exec3(`echo dist >> .gitignore`);
      await exec3(`echo .mastra >> .gitignore`);
      await exec3(`echo .env.development >> .gitignore`);
      await exec3(`echo .env >> .gitignore`);
      await exec3(`echo *.db >> .gitignore`);
      await exec3(`echo *.db-* >> .gitignore`);
    } catch (error) {
      throw new Error(`Failed to create .gitignore: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
    s2.stop(".gitignore added");
    Se("Project created successfully");
    console.log("");
    return { projectName };
  } catch (error) {
    s2.stop();
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    xe(`Project creation failed: ${errorMessage}`);
    process.exit(1);
  }
};
var create = async (args2) => {
  const { projectName } = await createMastraProject({
    projectName: args2?.projectName,
    createVersionTag: args2?.createVersionTag,
    timeout: args2?.timeout
  });
  const directory = args2.directory || "src/";
  if (args2.components === void 0 || args2.llmProvider === void 0 || args2.addExample === void 0) {
    const result = await interactivePrompt();
    await init({
      ...result,
      llmApiKey: result?.llmApiKey,
      components: ["agents", "tools", "workflows"],
      addExample: true
    });
    postCreate({ projectName });
    return;
  }
  const { components = [], llmProvider = "openai", addExample = false, llmApiKey } = args2;
  await init({
    directory,
    components,
    llmProvider,
    addExample,
    llmApiKey,
    configureEditorWithDocsMCP: args2.mcpServer
  });
  postCreate({ projectName });
};
var postCreate = ({ projectName }) => {
  const packageManager = getPackageManager();
  Se(`
   ${color2.green("To start your project:")}

    ${color2.cyan("cd")} ${projectName}
    ${color2.cyan(`${packageManager} run dev`)}
  `);
};

async function getPackageVersion() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const pkgJsonPath = path2.join(__dirname, "..", "package.json");
  const content = await fsExtra.readJSON(pkgJsonPath);
  return content.version;
}
async function getCreateVersionTag() {
  try {
    const pkgPath = fileURLToPath(import.meta.resolve("create-mastra/package.json"));
    const json = await fsExtra.readJSON(pkgPath);
    const { stdout } = await execa("npm", ["dist-tag", "create-mastra"]);
    const tagLine = stdout.split("\n").find((distLine) => distLine.endsWith(`: ${json.version}`));
    const tag = tagLine ? tagLine.split(":")[0].trim() : "latest";
    return tag;
  } catch {
    console.error('We could not resolve the create-mastra version tag, falling back to "latest"');
  }
  return "latest";
}

const version = await getPackageVersion();
const createVersionTag = await getCreateVersionTag();
const analytics = new PosthogAnalytics({
  apiKey: "phc_SBLpZVAB6jmHOct9CABq3PF0Yn5FU3G2FgT4xUr2XrT",
  host: "https://us.posthog.com",
  version
});
const program = new Command();
program.version(`${version}`, "-v, --version").description(`create-mastra ${version}`).action(async () => {
  try {
    analytics.trackCommand({
      command: "version"
    });
    console.log(`create-mastra ${version}`);
  } catch {
  }
});
program.name("create-mastra").description("Create a new Mastra project").argument("[project-name]", "Directory name of the project").option(
  "-p, --project-name <string>",
  "Project name that will be used in package.json and as the project directory name."
).option("--default", "Quick start with defaults(src, OpenAI, examples)").option("-c, --components <components>", "Comma-separated list of components (agents, tools, workflows)").option("-l, --llm <model-provider>", "Default model provider (openai, anthropic, groq, google, or cerebras)").option("-k, --llm-api-key <api-key>", "API key for the model provider").option("-e, --example", "Include example code").option("-n, --no-example", "Do not include example code").option("-t, --timeout [timeout]", "Configurable timeout for package installation, defaults to 60000 ms").option("-d, --dir <directory>", "Target directory for Mastra source code (default: src/)").option("-m, --mcp <mcp>", "MCP Server for code editor (cursor, cursor-global, windsurf, vscode)").action(async (projectNameArg, args) => {
  const projectName = projectNameArg || args.projectName;
  const timeout = args?.timeout ? args?.timeout === true ? 6e4 : parseInt(args?.timeout, 10) : void 0;
  if (args.default) {
    await create({
      components: ["agents", "tools", "workflows"],
      llmProvider: "openai",
      addExample: true,
      createVersionTag,
      timeout,
      mcpServer: args.mcp,
      directory: "src/"
    });
    return;
  }
  await create({
    components: args.components ? args.components.split(",") : [],
    llmProvider: args.llm,
    addExample: args.example,
    llmApiKey: args["llm-api-key"],
    createVersionTag,
    timeout,
    projectName,
    directory: args.dir,
    mcpServer: args.mcp
  });
});
program.parse(process.argv);
//# sourceMappingURL=index.js.map
