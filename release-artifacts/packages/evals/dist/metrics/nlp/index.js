import { Metric } from '@mastra/core/eval';
import nlp from 'compromise';
import stringSimilarity from 'string-similarity';
import { SequenceMatcher } from 'difflib';
import keyword_extractor from 'keyword-extractor';
import Sentiment from 'sentiment';

var CompletenessMetric = class extends Metric {
  async measure(input, output) {
    if (input === null || input === void 0 || output === null || output === void 0) {
      throw new Error("Inputs cannot be null or undefined");
    }
    input = input.trim();
    output = output.trim();
    const inputDoc = nlp(input);
    const outputDoc = nlp(output);
    const inputElements = this.extractElements(inputDoc);
    const outputElements = this.extractElements(outputDoc);
    const coverage = this.calculateCoverage(inputElements, outputElements);
    return {
      score: coverage,
      info: {
        inputElements,
        outputElements,
        missingElements: inputElements.filter((e) => !outputElements.includes(e)),
        elementCounts: {
          input: inputElements.length,
          output: outputElements.length
        }
      }
    };
  }
  extractElements(doc) {
    const nouns = doc.nouns().out("array") || [];
    const verbs = doc.verbs().toInfinitive().out("array") || [];
    const topics = doc.topics().out("array") || [];
    const terms = doc.terms().out("array") || [];
    const cleanAndSplitTerm = (term) => {
      const normalized = this.normalizeString(term);
      return normalized.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter((word) => word.length > 0);
    };
    const processedTerms = [
      ...nouns.flatMap(cleanAndSplitTerm),
      ...verbs.flatMap(cleanAndSplitTerm),
      ...topics.flatMap(cleanAndSplitTerm),
      ...terms.flatMap(cleanAndSplitTerm)
    ];
    return [...new Set(processedTerms)];
  }
  normalizeString(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  calculateCoverage(original, simplified) {
    if (original.length === 0) {
      return simplified.length === 0 ? 1 : 0;
    }
    const covered = original.filter(
      (element) => simplified.some((s) => {
        const elem = this.normalizeString(element);
        const simp = this.normalizeString(s);
        if (elem.length <= 3) {
          return elem === simp;
        }
        const longer = elem.length > simp.length ? elem : simp;
        const shorter = elem.length > simp.length ? simp : elem;
        if (longer.includes(shorter)) {
          return shorter.length / longer.length > 0.6;
        }
        return false;
      })
    );
    return covered.length / original.length;
  }
};
var ContentSimilarityMetric = class extends Metric {
  options;
  constructor(options = {}) {
    super();
    this.options = {
      ignoreCase: true,
      ignoreWhitespace: true,
      ...options
    };
  }
  async measure(input, output) {
    let processedInput = input;
    let processedOutput = output;
    if (this.options.ignoreCase) {
      processedInput = processedInput.toLowerCase();
      processedOutput = processedOutput.toLowerCase();
    }
    if (this.options.ignoreWhitespace) {
      processedInput = processedInput.replace(/\s+/g, " ").trim();
      processedOutput = processedOutput.replace(/\s+/g, " ").trim();
    }
    const similarity = stringSimilarity.compareTwoStrings(processedInput, processedOutput);
    return {
      score: similarity,
      info: { similarity }
    };
  }
};
var TextualDifferenceMetric = class extends Metric {
  async measure(input, output) {
    const matcher = new SequenceMatcher(null, input, output);
    const ratio = matcher.ratio();
    const ops = matcher.getOpcodes();
    const changes = ops.filter(([op]) => op !== "equal").length;
    const maxLength = Math.max(input.length, output.length);
    const lengthDiff = maxLength > 0 ? Math.abs(input.length - output.length) / maxLength : 0;
    const confidence = 1 - lengthDiff;
    return {
      score: ratio,
      info: {
        confidence,
        ratio,
        changes,
        lengthDiff
      }
    };
  }
};
var KeywordCoverageMetric = class extends Metric {
  async measure(input, output) {
    if (!input && !output) {
      return {
        score: 1,
        info: {
          totalKeywords: 0,
          matchedKeywords: 0
        }
      };
    }
    const extractKeywords = (text) => {
      return keyword_extractor.extract(text, {
        language: "english",
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true
      });
    };
    const referenceKeywords = new Set(extractKeywords(input));
    const responseKeywords = new Set(extractKeywords(output));
    const matchedKeywords = [...referenceKeywords].filter((k) => responseKeywords.has(k));
    const totalKeywords = referenceKeywords.size;
    const coverage = totalKeywords > 0 ? matchedKeywords.length / totalKeywords : 0;
    return {
      score: coverage,
      info: {
        totalKeywords: referenceKeywords.size,
        matchedKeywords: matchedKeywords.length
      }
    };
  }
};
var ToneConsistencyMetric = class extends Metric {
  sentiment = new Sentiment();
  async measure(input, output) {
    const responseSentiment = this.sentiment.analyze(input);
    if (output) {
      const referenceSentiment = this.sentiment.analyze(output);
      const sentimentDiff = Math.abs(responseSentiment.comparative - referenceSentiment.comparative);
      const normalizedScore = Math.max(0, 1 - sentimentDiff);
      return {
        score: normalizedScore,
        info: {
          responseSentiment: responseSentiment.comparative,
          referenceSentiment: referenceSentiment.comparative,
          difference: sentimentDiff
        }
      };
    }
    const sentences = input.match(/[^.!?]+[.!?]+/g) || [input];
    const sentiments = sentences.map((s) => this.sentiment.analyze(s).comparative);
    const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const variance = sentiments.reduce((sum, s) => sum + Math.pow(s - avgSentiment, 2), 0) / sentiments.length;
    const stability = Math.max(0, 1 - variance);
    return {
      score: stability,
      info: {
        avgSentiment,
        sentimentVariance: variance
      }
    };
  }
};

export { CompletenessMetric, ContentSimilarityMetric, KeywordCoverageMetric, TextualDifferenceMetric, ToneConsistencyMetric };
