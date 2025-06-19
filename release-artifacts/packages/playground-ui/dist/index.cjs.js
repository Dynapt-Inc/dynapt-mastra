'use strict';

Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

require('./index.css');const jsxRuntime = require('react/jsx-runtime');
const React = require('react');
const clientJs = require('@mastra/client-js');
const react = require('@assistant-ui/react');
const lucideReact = require('lucide-react');
const reactSlot = require('@radix-ui/react-slot');
const TooltipPrimitive = require('@radix-ui/react-tooltip');
const AvatarPrimitive = require('@radix-ui/react-avatar');
const reactMarkdown = require('@assistant-ui/react-markdown');
require('@assistant-ui/react-markdown/styles/dot.css');
const remarkGfm = require('remark-gfm');
const reactSyntaxHighlighter = require('@assistant-ui/react-syntax-highlighter');
const prism = require('react-syntax-highlighter/dist/cjs/styles/prism');
const langJson = require('@codemirror/lang-json');
const highlight$1 = require('@lezer/highlight');
const codemirrorThemeDracula = require('@uiw/codemirror-theme-dracula');
const CodeMirror = require('@uiw/react-codemirror');
const sonner = require('sonner');
const DialogPrimitive = require('@radix-ui/react-dialog');
const shallow = require('zustand/shallow');
const di = require('@mastra/core/di');
const zustand = require('zustand');
const middleware = require('zustand/middleware');
const dateFns = require('date-fns');
const TabsPrimitive = require('@radix-ui/react-tabs');
const react$1 = require('motion/react');
const colors = require('./colors-Du4i-E0i.cjs');
const uiUtils = require('@ai-sdk/ui-utils');
const Markdown = require('react-markdown');
const useDebounce = require('use-debounce');
const react$2 = require('@xyflow/react');
require('@xyflow/react/dist/style.css');
const Dagre = require('@dagrejs/dagre');
const prismReactRenderer = require('prism-react-renderer');
const CollapsiblePrimitive = require('@radix-ui/react-collapsible');
const ScrollAreaPrimitive = require('@radix-ui/react-scroll-area');
const jsonSchemaToZod = require('json-schema-to-zod');
const superjson = require('superjson');
const z = require('zod');
const react$3 = require('@autoform/react');
const CheckboxPrimitive = require('@radix-ui/react-checkbox');
const reactDayPicker = require('react-day-picker');
const PopoverPrimitive = require('@radix-ui/react-popover');
const SelectPrimitive = require('@radix-ui/react-select');
const uuid = require('@lukeed/uuid');
const zod = require('@autoform/zod');
const LabelPrimitive = require('@radix-ui/react-label');
const reactCodeBlock = require('react-code-block');
const SliderPrimitive = require('@radix-ui/react-slider');
const reactTable = require('@tanstack/react-table');

function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: 'Module' } });
  if (e) {
    for (const k in e) {
      if (k !== 'default') {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}

const React__namespace = /*#__PURE__*/_interopNamespaceDefault(React);
const TooltipPrimitive__namespace = /*#__PURE__*/_interopNamespaceDefault(TooltipPrimitive);
const AvatarPrimitive__namespace = /*#__PURE__*/_interopNamespaceDefault(AvatarPrimitive);
const DialogPrimitive__namespace = /*#__PURE__*/_interopNamespaceDefault(DialogPrimitive);
const TabsPrimitive__namespace = /*#__PURE__*/_interopNamespaceDefault(TabsPrimitive);
const CollapsiblePrimitive__namespace = /*#__PURE__*/_interopNamespaceDefault(CollapsiblePrimitive);
const ScrollAreaPrimitive__namespace = /*#__PURE__*/_interopNamespaceDefault(ScrollAreaPrimitive);
const CheckboxPrimitive__namespace = /*#__PURE__*/_interopNamespaceDefault(CheckboxPrimitive);
const PopoverPrimitive__namespace = /*#__PURE__*/_interopNamespaceDefault(PopoverPrimitive);
const SelectPrimitive__namespace = /*#__PURE__*/_interopNamespaceDefault(SelectPrimitive);
const LabelPrimitive__namespace = /*#__PURE__*/_interopNamespaceDefault(LabelPrimitive);
const SliderPrimitive__namespace = /*#__PURE__*/_interopNamespaceDefault(SliderPrimitive);

const createMastraClient = (baseUrl, mastraClientHeaders = {}) => {
  return new clientJs.MastraClient({
    baseUrl: baseUrl || "",
    // only add the header if the baseUrl is not provided i.e it's a local dev environment
    headers: !baseUrl ? { ...mastraClientHeaders, "x-mastra-dev-playground": "true" } : mastraClientHeaders
  });
};

const MastraClientContext = React.createContext(void 0);
const MastraClientProvider = ({
  children,
  baseUrl,
  headers
}) => {
  const client = createMastraClient(baseUrl, headers);
  return /* @__PURE__ */ jsxRuntime.jsx(MastraClientContext.Provider, { value: { client }, children });
};
const useMastraClient = () => {
  const context = React.useContext(MastraClientContext);
  if (context === void 0) {
    throw new Error("useMastraClient must be used within a MastraClientProvider");
  }
  return context.client;
};

function r(e){var t,f,n="";if("string"==typeof e||"number"==typeof e)n+=e;else if("object"==typeof e)if(Array.isArray(e)){var o=e.length;for(t=0;t<o;t++)e[t]&&(f=r(e[t]))&&(n&&(n+=" "),n+=f);}else for(f in e)e[f]&&(n&&(n+=" "),n+=f);return n}function clsx(){for(var e,t,f=0,n="",o=arguments.length;f<o;f++)(e=arguments[f])&&(t=r(e))&&(n&&(n+=" "),n+=t);return n}

const falsyToString = (value)=>typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;
const cx = clsx;
const cva = (base, config)=>(props)=>{
        var _config_compoundVariants;
        if ((config === null || config === void 0 ? void 0 : config.variants) == null) return cx(base, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
        const { variants, defaultVariants } = config;
        const getVariantClassNames = Object.keys(variants).map((variant)=>{
            const variantProp = props === null || props === void 0 ? void 0 : props[variant];
            const defaultVariantProp = defaultVariants === null || defaultVariants === void 0 ? void 0 : defaultVariants[variant];
            if (variantProp === null) return null;
            const variantKey = falsyToString(variantProp) || falsyToString(defaultVariantProp);
            return variants[variant][variantKey];
        });
        const propsWithoutUndefined = props && Object.entries(props).reduce((acc, param)=>{
            let [key, value] = param;
            if (value === undefined) {
                return acc;
            }
            acc[key] = value;
            return acc;
        }, {});
        const getCompoundVariantClassNames = config === null || config === void 0 ? void 0 : (_config_compoundVariants = config.compoundVariants) === null || _config_compoundVariants === void 0 ? void 0 : _config_compoundVariants.reduce((acc, param)=>{
            let { class: cvClass, className: cvClassName, ...compoundVariantOptions } = param;
            return Object.entries(compoundVariantOptions).every((param)=>{
                let [key, value] = param;
                return Array.isArray(value) ? value.includes({
                    ...defaultVariants,
                    ...propsWithoutUndefined
                }[key]) : ({
                    ...defaultVariants,
                    ...propsWithoutUndefined
                })[key] === value;
            }) ? [
                ...acc,
                cvClass,
                cvClassName
            ] : acc;
        }, []);
        return cx(base, getVariantClassNames, getCompoundVariantClassNames, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
    };

const CLASS_PART_SEPARATOR = '-';
const createClassGroupUtils = config => {
  const classMap = createClassMap(config);
  const {
    conflictingClassGroups,
    conflictingClassGroupModifiers
  } = config;
  const getClassGroupId = className => {
    const classParts = className.split(CLASS_PART_SEPARATOR);
    // Classes like `-inset-1` produce an empty string as first classPart. We assume that classes for negative values are used correctly and remove it from classParts.
    if (classParts[0] === '' && classParts.length !== 1) {
      classParts.shift();
    }
    return getGroupRecursive(classParts, classMap) || getGroupIdForArbitraryProperty(className);
  };
  const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
    const conflicts = conflictingClassGroups[classGroupId] || [];
    if (hasPostfixModifier && conflictingClassGroupModifiers[classGroupId]) {
      return [...conflicts, ...conflictingClassGroupModifiers[classGroupId]];
    }
    return conflicts;
  };
  return {
    getClassGroupId,
    getConflictingClassGroupIds
  };
};
const getGroupRecursive = (classParts, classPartObject) => {
  if (classParts.length === 0) {
    return classPartObject.classGroupId;
  }
  const currentClassPart = classParts[0];
  const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
  const classGroupFromNextClassPart = nextClassPartObject ? getGroupRecursive(classParts.slice(1), nextClassPartObject) : undefined;
  if (classGroupFromNextClassPart) {
    return classGroupFromNextClassPart;
  }
  if (classPartObject.validators.length === 0) {
    return undefined;
  }
  const classRest = classParts.join(CLASS_PART_SEPARATOR);
  return classPartObject.validators.find(({
    validator
  }) => validator(classRest))?.classGroupId;
};
const arbitraryPropertyRegex = /^\[(.+)\]$/;
const getGroupIdForArbitraryProperty = className => {
  if (arbitraryPropertyRegex.test(className)) {
    const arbitraryPropertyClassName = arbitraryPropertyRegex.exec(className)[1];
    const property = arbitraryPropertyClassName?.substring(0, arbitraryPropertyClassName.indexOf(':'));
    if (property) {
      // I use two dots here because one dot is used as prefix for class groups in plugins
      return 'arbitrary..' + property;
    }
  }
};
/**
 * Exported for testing only
 */
const createClassMap = config => {
  const {
    theme,
    classGroups
  } = config;
  const classMap = {
    nextPart: new Map(),
    validators: []
  };
  for (const classGroupId in classGroups) {
    processClassesRecursively(classGroups[classGroupId], classMap, classGroupId, theme);
  }
  return classMap;
};
const processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
  classGroup.forEach(classDefinition => {
    if (typeof classDefinition === 'string') {
      const classPartObjectToEdit = classDefinition === '' ? classPartObject : getPart(classPartObject, classDefinition);
      classPartObjectToEdit.classGroupId = classGroupId;
      return;
    }
    if (typeof classDefinition === 'function') {
      if (isThemeGetter(classDefinition)) {
        processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
        return;
      }
      classPartObject.validators.push({
        validator: classDefinition,
        classGroupId
      });
      return;
    }
    Object.entries(classDefinition).forEach(([key, classGroup]) => {
      processClassesRecursively(classGroup, getPart(classPartObject, key), classGroupId, theme);
    });
  });
};
const getPart = (classPartObject, path) => {
  let currentClassPartObject = classPartObject;
  path.split(CLASS_PART_SEPARATOR).forEach(pathPart => {
    if (!currentClassPartObject.nextPart.has(pathPart)) {
      currentClassPartObject.nextPart.set(pathPart, {
        nextPart: new Map(),
        validators: []
      });
    }
    currentClassPartObject = currentClassPartObject.nextPart.get(pathPart);
  });
  return currentClassPartObject;
};
const isThemeGetter = func => func.isThemeGetter;

// LRU cache inspired from hashlru (https://github.com/dominictarr/hashlru/blob/v1.0.4/index.js) but object replaced with Map to improve performance
const createLruCache = maxCacheSize => {
  if (maxCacheSize < 1) {
    return {
      get: () => undefined,
      set: () => {}
    };
  }
  let cacheSize = 0;
  let cache = new Map();
  let previousCache = new Map();
  const update = (key, value) => {
    cache.set(key, value);
    cacheSize++;
    if (cacheSize > maxCacheSize) {
      cacheSize = 0;
      previousCache = cache;
      cache = new Map();
    }
  };
  return {
    get(key) {
      let value = cache.get(key);
      if (value !== undefined) {
        return value;
      }
      if ((value = previousCache.get(key)) !== undefined) {
        update(key, value);
        return value;
      }
    },
    set(key, value) {
      if (cache.has(key)) {
        cache.set(key, value);
      } else {
        update(key, value);
      }
    }
  };
};
const IMPORTANT_MODIFIER = '!';
const MODIFIER_SEPARATOR = ':';
const MODIFIER_SEPARATOR_LENGTH = MODIFIER_SEPARATOR.length;
const createParseClassName = config => {
  const {
    prefix,
    experimentalParseClassName
  } = config;
  /**
   * Parse class name into parts.
   *
   * Inspired by `splitAtTopLevelOnly` used in Tailwind CSS
   * @see https://github.com/tailwindlabs/tailwindcss/blob/v3.2.2/src/util/splitAtTopLevelOnly.js
   */
  let parseClassName = className => {
    const modifiers = [];
    let bracketDepth = 0;
    let parenDepth = 0;
    let modifierStart = 0;
    let postfixModifierPosition;
    for (let index = 0; index < className.length; index++) {
      let currentCharacter = className[index];
      if (bracketDepth === 0 && parenDepth === 0) {
        if (currentCharacter === MODIFIER_SEPARATOR) {
          modifiers.push(className.slice(modifierStart, index));
          modifierStart = index + MODIFIER_SEPARATOR_LENGTH;
          continue;
        }
        if (currentCharacter === '/') {
          postfixModifierPosition = index;
          continue;
        }
      }
      if (currentCharacter === '[') {
        bracketDepth++;
      } else if (currentCharacter === ']') {
        bracketDepth--;
      } else if (currentCharacter === '(') {
        parenDepth++;
      } else if (currentCharacter === ')') {
        parenDepth--;
      }
    }
    const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.substring(modifierStart);
    const baseClassName = stripImportantModifier(baseClassNameWithImportantModifier);
    const hasImportantModifier = baseClassName !== baseClassNameWithImportantModifier;
    const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : undefined;
    return {
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    };
  };
  if (prefix) {
    const fullPrefix = prefix + MODIFIER_SEPARATOR;
    const parseClassNameOriginal = parseClassName;
    parseClassName = className => className.startsWith(fullPrefix) ? parseClassNameOriginal(className.substring(fullPrefix.length)) : {
      isExternal: true,
      modifiers: [],
      hasImportantModifier: false,
      baseClassName: className,
      maybePostfixModifierPosition: undefined
    };
  }
  if (experimentalParseClassName) {
    const parseClassNameOriginal = parseClassName;
    parseClassName = className => experimentalParseClassName({
      className,
      parseClassName: parseClassNameOriginal
    });
  }
  return parseClassName;
};
const stripImportantModifier = baseClassName => {
  if (baseClassName.endsWith(IMPORTANT_MODIFIER)) {
    return baseClassName.substring(0, baseClassName.length - 1);
  }
  /**
   * In Tailwind CSS v3 the important modifier was at the start of the base class name. This is still supported for legacy reasons.
   * @see https://github.com/dcastil/tailwind-merge/issues/513#issuecomment-2614029864
   */
  if (baseClassName.startsWith(IMPORTANT_MODIFIER)) {
    return baseClassName.substring(1);
  }
  return baseClassName;
};

/**
 * Sorts modifiers according to following schema:
 * - Predefined modifiers are sorted alphabetically
 * - When an arbitrary variant appears, it must be preserved which modifiers are before and after it
 */
const createSortModifiers = config => {
  const orderSensitiveModifiers = Object.fromEntries(config.orderSensitiveModifiers.map(modifier => [modifier, true]));
  const sortModifiers = modifiers => {
    if (modifiers.length <= 1) {
      return modifiers;
    }
    const sortedModifiers = [];
    let unsortedModifiers = [];
    modifiers.forEach(modifier => {
      const isPositionSensitive = modifier[0] === '[' || orderSensitiveModifiers[modifier];
      if (isPositionSensitive) {
        sortedModifiers.push(...unsortedModifiers.sort(), modifier);
        unsortedModifiers = [];
      } else {
        unsortedModifiers.push(modifier);
      }
    });
    sortedModifiers.push(...unsortedModifiers.sort());
    return sortedModifiers;
  };
  return sortModifiers;
};
const createConfigUtils = config => ({
  cache: createLruCache(config.cacheSize),
  parseClassName: createParseClassName(config),
  sortModifiers: createSortModifiers(config),
  ...createClassGroupUtils(config)
});
const SPLIT_CLASSES_REGEX = /\s+/;
const mergeClassList = (classList, configUtils) => {
  const {
    parseClassName,
    getClassGroupId,
    getConflictingClassGroupIds,
    sortModifiers
  } = configUtils;
  /**
   * Set of classGroupIds in following format:
   * `{importantModifier}{variantModifiers}{classGroupId}`
   * @example 'float'
   * @example 'hover:focus:bg-color'
   * @example 'md:!pr'
   */
  const classGroupsInConflict = [];
  const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
  let result = '';
  for (let index = classNames.length - 1; index >= 0; index -= 1) {
    const originalClassName = classNames[index];
    const {
      isExternal,
      modifiers,
      hasImportantModifier,
      baseClassName,
      maybePostfixModifierPosition
    } = parseClassName(originalClassName);
    if (isExternal) {
      result = originalClassName + (result.length > 0 ? ' ' + result : result);
      continue;
    }
    let hasPostfixModifier = !!maybePostfixModifierPosition;
    let classGroupId = getClassGroupId(hasPostfixModifier ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
    if (!classGroupId) {
      if (!hasPostfixModifier) {
        // Not a Tailwind class
        result = originalClassName + (result.length > 0 ? ' ' + result : result);
        continue;
      }
      classGroupId = getClassGroupId(baseClassName);
      if (!classGroupId) {
        // Not a Tailwind class
        result = originalClassName + (result.length > 0 ? ' ' + result : result);
        continue;
      }
      hasPostfixModifier = false;
    }
    const variantModifier = sortModifiers(modifiers).join(':');
    const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
    const classId = modifierId + classGroupId;
    if (classGroupsInConflict.includes(classId)) {
      // Tailwind class omitted due to conflict
      continue;
    }
    classGroupsInConflict.push(classId);
    const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
    for (let i = 0; i < conflictGroups.length; ++i) {
      const group = conflictGroups[i];
      classGroupsInConflict.push(modifierId + group);
    }
    // Tailwind class not in conflict
    result = originalClassName + (result.length > 0 ? ' ' + result : result);
  }
  return result;
};

/**
 * The code in this file is copied from https://github.com/lukeed/clsx and modified to suit the needs of tailwind-merge better.
 *
 * Specifically:
 * - Runtime code from https://github.com/lukeed/clsx/blob/v1.2.1/src/index.js
 * - TypeScript types from https://github.com/lukeed/clsx/blob/v1.2.1/clsx.d.ts
 *
 * Original code has MIT license: Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
 */
function twJoin() {
  let index = 0;
  let argument;
  let resolvedValue;
  let string = '';
  while (index < arguments.length) {
    if (argument = arguments[index++]) {
      if (resolvedValue = toValue(argument)) {
        string && (string += ' ');
        string += resolvedValue;
      }
    }
  }
  return string;
}
const toValue = mix => {
  if (typeof mix === 'string') {
    return mix;
  }
  let resolvedValue;
  let string = '';
  for (let k = 0; k < mix.length; k++) {
    if (mix[k]) {
      if (resolvedValue = toValue(mix[k])) {
        string && (string += ' ');
        string += resolvedValue;
      }
    }
  }
  return string;
};
function createTailwindMerge(createConfigFirst, ...createConfigRest) {
  let configUtils;
  let cacheGet;
  let cacheSet;
  let functionToCall = initTailwindMerge;
  function initTailwindMerge(classList) {
    const config = createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst());
    configUtils = createConfigUtils(config);
    cacheGet = configUtils.cache.get;
    cacheSet = configUtils.cache.set;
    functionToCall = tailwindMerge;
    return tailwindMerge(classList);
  }
  function tailwindMerge(classList) {
    const cachedResult = cacheGet(classList);
    if (cachedResult) {
      return cachedResult;
    }
    const result = mergeClassList(classList, configUtils);
    cacheSet(classList, result);
    return result;
  }
  return function callTailwindMerge() {
    return functionToCall(twJoin.apply(null, arguments));
  };
}
const fromTheme = key => {
  const themeGetter = theme => theme[key] || [];
  themeGetter.isThemeGetter = true;
  return themeGetter;
};
const arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
const arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
const fractionRegex = /^\d+\/\d+$/;
const tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
const lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
const colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
// Shadow always begins with x and y offset separated by underscore optionally prepended by inset
const shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
const imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
const isFraction = value => fractionRegex.test(value);
const isNumber = value => !!value && !Number.isNaN(Number(value));
const isInteger = value => !!value && Number.isInteger(Number(value));
const isPercent = value => value.endsWith('%') && isNumber(value.slice(0, -1));
const isTshirtSize = value => tshirtUnitRegex.test(value);
const isAny = () => true;
const isLengthOnly = value =>
// `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
// For example, `hsl(0 0% 0%)` would be classified as a length without this check.
// I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
lengthUnitRegex.test(value) && !colorFunctionRegex.test(value);
const isNever = () => false;
const isShadow = value => shadowRegex.test(value);
const isImage = value => imageRegex.test(value);
const isAnyNonArbitrary = value => !isArbitraryValue(value) && !isArbitraryVariable(value);
const isArbitrarySize = value => getIsArbitraryValue(value, isLabelSize, isNever);
const isArbitraryValue = value => arbitraryValueRegex.test(value);
const isArbitraryLength = value => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
const isArbitraryNumber = value => getIsArbitraryValue(value, isLabelNumber, isNumber);
const isArbitraryPosition = value => getIsArbitraryValue(value, isLabelPosition, isNever);
const isArbitraryImage = value => getIsArbitraryValue(value, isLabelImage, isImage);
const isArbitraryShadow = value => getIsArbitraryValue(value, isLabelShadow, isShadow);
const isArbitraryVariable = value => arbitraryVariableRegex.test(value);
const isArbitraryVariableLength = value => getIsArbitraryVariable(value, isLabelLength);
const isArbitraryVariableFamilyName = value => getIsArbitraryVariable(value, isLabelFamilyName);
const isArbitraryVariablePosition = value => getIsArbitraryVariable(value, isLabelPosition);
const isArbitraryVariableSize = value => getIsArbitraryVariable(value, isLabelSize);
const isArbitraryVariableImage = value => getIsArbitraryVariable(value, isLabelImage);
const isArbitraryVariableShadow = value => getIsArbitraryVariable(value, isLabelShadow, true);
// Helpers
const getIsArbitraryValue = (value, testLabel, testValue) => {
  const result = arbitraryValueRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return testValue(result[2]);
  }
  return false;
};
const getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
  const result = arbitraryVariableRegex.exec(value);
  if (result) {
    if (result[1]) {
      return testLabel(result[1]);
    }
    return shouldMatchNoLabel;
  }
  return false;
};
// Labels
const isLabelPosition = label => label === 'position' || label === 'percentage';
const isLabelImage = label => label === 'image' || label === 'url';
const isLabelSize = label => label === 'length' || label === 'size' || label === 'bg-size';
const isLabelLength = label => label === 'length';
const isLabelNumber = label => label === 'number';
const isLabelFamilyName = label => label === 'family-name';
const isLabelShadow = label => label === 'shadow';
const getDefaultConfig = () => {
  /**
   * Theme getters for theme variable namespaces
   * @see https://tailwindcss.com/docs/theme#theme-variable-namespaces
   */
  /***/
  const themeColor = fromTheme('color');
  const themeFont = fromTheme('font');
  const themeText = fromTheme('text');
  const themeFontWeight = fromTheme('font-weight');
  const themeTracking = fromTheme('tracking');
  const themeLeading = fromTheme('leading');
  const themeBreakpoint = fromTheme('breakpoint');
  const themeContainer = fromTheme('container');
  const themeSpacing = fromTheme('spacing');
  const themeRadius = fromTheme('radius');
  const themeShadow = fromTheme('shadow');
  const themeInsetShadow = fromTheme('inset-shadow');
  const themeTextShadow = fromTheme('text-shadow');
  const themeDropShadow = fromTheme('drop-shadow');
  const themeBlur = fromTheme('blur');
  const themePerspective = fromTheme('perspective');
  const themeAspect = fromTheme('aspect');
  const themeEase = fromTheme('ease');
  const themeAnimate = fromTheme('animate');
  /**
   * Helpers to avoid repeating the same scales
   *
   * We use functions that create a new array every time they're called instead of static arrays.
   * This ensures that users who modify any scale by mutating the array (e.g. with `array.push(element)`) don't accidentally mutate arrays in other parts of the config.
   */
  /***/
  const scaleBreak = () => ['auto', 'avoid', 'all', 'avoid-page', 'page', 'left', 'right', 'column'];
  const scalePosition = () => ['center', 'top', 'bottom', 'left', 'right', 'top-left',
  // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
  'left-top', 'top-right',
  // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
  'right-top', 'bottom-right',
  // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
  'right-bottom', 'bottom-left',
  // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
  'left-bottom'];
  const scalePositionWithArbitrary = () => [...scalePosition(), isArbitraryVariable, isArbitraryValue];
  const scaleOverflow = () => ['auto', 'hidden', 'clip', 'visible', 'scroll'];
  const scaleOverscroll = () => ['auto', 'contain', 'none'];
  const scaleUnambiguousSpacing = () => [isArbitraryVariable, isArbitraryValue, themeSpacing];
  const scaleInset = () => [isFraction, 'full', 'auto', ...scaleUnambiguousSpacing()];
  const scaleGridTemplateColsRows = () => [isInteger, 'none', 'subgrid', isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartAndEnd = () => ['auto', {
    span: ['full', isInteger, isArbitraryVariable, isArbitraryValue]
  }, isInteger, isArbitraryVariable, isArbitraryValue];
  const scaleGridColRowStartOrEnd = () => [isInteger, 'auto', isArbitraryVariable, isArbitraryValue];
  const scaleGridAutoColsRows = () => ['auto', 'min', 'max', 'fr', isArbitraryVariable, isArbitraryValue];
  const scaleAlignPrimaryAxis = () => ['start', 'end', 'center', 'between', 'around', 'evenly', 'stretch', 'baseline', 'center-safe', 'end-safe'];
  const scaleAlignSecondaryAxis = () => ['start', 'end', 'center', 'stretch', 'center-safe', 'end-safe'];
  const scaleMargin = () => ['auto', ...scaleUnambiguousSpacing()];
  const scaleSizing = () => [isFraction, 'auto', 'full', 'dvw', 'dvh', 'lvw', 'lvh', 'svw', 'svh', 'min', 'max', 'fit', ...scaleUnambiguousSpacing()];
  const scaleColor = () => [themeColor, isArbitraryVariable, isArbitraryValue];
  const scaleBgPosition = () => [...scalePosition(), isArbitraryVariablePosition, isArbitraryPosition, {
    position: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleBgRepeat = () => ['no-repeat', {
    repeat: ['', 'x', 'y', 'space', 'round']
  }];
  const scaleBgSize = () => ['auto', 'cover', 'contain', isArbitraryVariableSize, isArbitrarySize, {
    size: [isArbitraryVariable, isArbitraryValue]
  }];
  const scaleGradientStopPosition = () => [isPercent, isArbitraryVariableLength, isArbitraryLength];
  const scaleRadius = () => [
  // Deprecated since Tailwind CSS v4.0.0
  '', 'none', 'full', themeRadius, isArbitraryVariable, isArbitraryValue];
  const scaleBorderWidth = () => ['', isNumber, isArbitraryVariableLength, isArbitraryLength];
  const scaleLineStyle = () => ['solid', 'dashed', 'dotted', 'double'];
  const scaleBlendMode = () => ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'];
  const scaleMaskImagePosition = () => [isNumber, isPercent, isArbitraryVariablePosition, isArbitraryPosition];
  const scaleBlur = () => [
  // Deprecated since Tailwind CSS v4.0.0
  '', 'none', themeBlur, isArbitraryVariable, isArbitraryValue];
  const scaleRotate = () => ['none', isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleScale = () => ['none', isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleSkew = () => [isNumber, isArbitraryVariable, isArbitraryValue];
  const scaleTranslate = () => [isFraction, 'full', ...scaleUnambiguousSpacing()];
  return {
    cacheSize: 500,
    theme: {
      animate: ['spin', 'ping', 'pulse', 'bounce'],
      aspect: ['video'],
      blur: [isTshirtSize],
      breakpoint: [isTshirtSize],
      color: [isAny],
      container: [isTshirtSize],
      'drop-shadow': [isTshirtSize],
      ease: ['in', 'out', 'in-out'],
      font: [isAnyNonArbitrary],
      'font-weight': ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'],
      'inset-shadow': [isTshirtSize],
      leading: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'],
      perspective: ['dramatic', 'near', 'normal', 'midrange', 'distant', 'none'],
      radius: [isTshirtSize],
      shadow: [isTshirtSize],
      spacing: ['px', isNumber],
      text: [isTshirtSize],
      'text-shadow': [isTshirtSize],
      tracking: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest']
    },
    classGroups: {
      // --------------
      // --- Layout ---
      // --------------
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ['auto', 'square', isFraction, isArbitraryValue, isArbitraryVariable, themeAspect]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       * @deprecated since Tailwind CSS v4.0.0
       */
      container: ['container'],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isNumber, isArbitraryValue, isArbitraryVariable, themeContainer]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      'break-after': [{
        'break-after': scaleBreak()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      'break-before': [{
        'break-before': scaleBreak()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      'break-inside': [{
        'break-inside': ['auto', 'avoid', 'avoid-page', 'avoid-column']
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      'box-decoration': [{
        'box-decoration': ['slice', 'clone']
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ['border', 'content']
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'table', 'inline-table', 'table-caption', 'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 'table-header-group', 'table-row-group', 'table-row', 'flow-root', 'grid', 'inline-grid', 'contents', 'list-item', 'hidden'],
      /**
       * Screen Reader Only
       * @see https://tailwindcss.com/docs/display#screen-reader-only
       */
      sr: ['sr-only', 'not-sr-only'],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ['right', 'left', 'none', 'start', 'end']
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ['left', 'right', 'both', 'none', 'start', 'end']
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ['isolate', 'isolation-auto'],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      'object-fit': [{
        object: ['contain', 'cover', 'fill', 'none', 'scale-down']
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      'object-position': [{
        object: scalePositionWithArbitrary()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: scaleOverflow()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow-x': [{
        'overflow-x': scaleOverflow()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow-y': [{
        'overflow-y': scaleOverflow()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: scaleOverscroll()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      'overscroll-x': [{
        'overscroll-x': scaleOverscroll()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      'overscroll-y': [{
        'overscroll-y': scaleOverscroll()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ['static', 'fixed', 'absolute', 'relative', 'sticky'],
      /**
       * Top / Right / Bottom / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: scaleInset()
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-x': [{
        'inset-x': scaleInset()
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-y': [{
        'inset-y': scaleInset()
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: scaleInset()
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: scaleInset()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: scaleInset()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: scaleInset()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: scaleInset()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: scaleInset()
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ['visible', 'invisible', 'collapse'],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: [isInteger, 'auto', isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [isFraction, 'full', 'auto', themeContainer, ...scaleUnambiguousSpacing()]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      'flex-direction': [{
        flex: ['row', 'row-reverse', 'col', 'col-reverse']
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      'flex-wrap': [{
        flex: ['nowrap', 'wrap', 'wrap-reverse']
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: [isNumber, isFraction, 'auto', 'initial', 'none', isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [isInteger, 'first', 'last', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      'grid-cols': [{
        'grid-cols': scaleGridTemplateColsRows()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-start-end': [{
        col: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-start': [{
        'col-start': scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-end': [{
        'col-end': scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      'grid-rows': [{
        'grid-rows': scaleGridTemplateColsRows()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-start-end': [{
        row: scaleGridColRowStartAndEnd()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-start': [{
        'row-start': scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-end': [{
        'row-end': scaleGridColRowStartOrEnd()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      'grid-flow': [{
        'grid-flow': ['row', 'col', 'dense', 'row-dense', 'col-dense']
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      'auto-cols': [{
        'auto-cols': scaleGridAutoColsRows()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      'auto-rows': [{
        'auto-rows': scaleGridAutoColsRows()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: scaleUnambiguousSpacing()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-x': [{
        'gap-x': scaleUnambiguousSpacing()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-y': [{
        'gap-y': scaleUnambiguousSpacing()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      'justify-content': [{
        justify: [...scaleAlignPrimaryAxis(), 'normal']
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      'justify-items': [{
        'justify-items': [...scaleAlignSecondaryAxis(), 'normal']
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      'justify-self': [{
        'justify-self': ['auto', ...scaleAlignSecondaryAxis()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      'align-content': [{
        content: ['normal', ...scaleAlignPrimaryAxis()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      'align-items': [{
        items: [...scaleAlignSecondaryAxis(), {
          baseline: ['', 'last']
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      'align-self': [{
        self: ['auto', ...scaleAlignSecondaryAxis(), {
          baseline: ['', 'last']
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      'place-content': [{
        'place-content': scaleAlignPrimaryAxis()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      'place-items': [{
        'place-items': [...scaleAlignSecondaryAxis(), 'baseline']
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      'place-self': [{
        'place-self': ['auto', ...scaleAlignSecondaryAxis()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: scaleUnambiguousSpacing()
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: scaleUnambiguousSpacing()
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: scaleUnambiguousSpacing()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: scaleUnambiguousSpacing()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: scaleMargin()
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: scaleMargin()
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: scaleMargin()
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: scaleMargin()
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: scaleMargin()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: scaleMargin()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: scaleMargin()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: scaleMargin()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: scaleMargin()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-x': [{
        'space-x': scaleUnambiguousSpacing()
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-x-reverse': ['space-x-reverse'],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-y': [{
        'space-y': scaleUnambiguousSpacing()
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      'space-y-reverse': ['space-y-reverse'],
      // --------------
      // --- Sizing ---
      // --------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      size: [{
        size: scaleSizing()
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [themeContainer, 'screen', ...scaleSizing()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      'min-w': [{
        'min-w': [themeContainer, 'screen', /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
        'none', ...scaleSizing()]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      'max-w': [{
        'max-w': [themeContainer, 'screen', 'none', /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
        'prose', /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
        {
          screen: [themeBreakpoint]
        }, ...scaleSizing()]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ['screen', 'lh', ...scaleSizing()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      'min-h': [{
        'min-h': ['screen', 'lh', 'none', ...scaleSizing()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      'max-h': [{
        'max-h': ['screen', 'lh', ...scaleSizing()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      'font-size': [{
        text: ['base', themeText, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      'font-smoothing': ['antialiased', 'subpixel-antialiased'],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      'font-style': ['italic', 'not-italic'],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      'font-weight': [{
        font: [themeFontWeight, isArbitraryVariable, isArbitraryNumber]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      'font-stretch': [{
        'font-stretch': ['ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'normal', 'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded', isPercent, isArbitraryValue]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      'font-family': [{
        font: [isArbitraryVariableFamilyName, isArbitraryValue, themeFont]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-normal': ['normal-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-ordinal': ['ordinal'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-slashed-zero': ['slashed-zero'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-figure': ['lining-nums', 'oldstyle-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-spacing': ['proportional-nums', 'tabular-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-fraction': ['diagonal-fractions', 'stacked-fractions'],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: [themeTracking, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      'line-clamp': [{
        'line-clamp': [isNumber, 'none', isArbitraryVariable, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [/** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
        themeLeading, ...scaleUnambiguousSpacing()]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      'list-image': [{
        'list-image': ['none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      'list-style-position': [{
        list: ['inside', 'outside']
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      'list-style-type': [{
        list: ['disc', 'decimal', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      'text-alignment': [{
        text: ['left', 'center', 'right', 'justify', 'start', 'end']
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://v3.tailwindcss.com/docs/placeholder-color
       */
      'placeholder-color': [{
        placeholder: scaleColor()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      'text-color': [{
        text: scaleColor()
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      'text-decoration': ['underline', 'overline', 'line-through', 'no-underline'],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      'text-decoration-style': [{
        decoration: [...scaleLineStyle(), 'wavy']
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      'text-decoration-thickness': [{
        decoration: [isNumber, 'from-font', 'auto', isArbitraryVariable, isArbitraryLength]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      'text-decoration-color': [{
        decoration: scaleColor()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      'underline-offset': [{
        'underline-offset': [isNumber, 'auto', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      'text-transform': ['uppercase', 'lowercase', 'capitalize', 'normal-case'],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      'text-overflow': ['truncate', 'text-ellipsis', 'text-clip'],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      'text-wrap': [{
        text: ['wrap', 'nowrap', 'balance', 'pretty']
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: scaleUnambiguousSpacing()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      'vertical-align': [{
        align: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces']
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ['normal', 'words', 'all', 'keep']
      }],
      /**
       * Overflow Wrap
       * @see https://tailwindcss.com/docs/overflow-wrap
       */
      wrap: [{
        wrap: ['break-word', 'anywhere', 'normal']
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ['none', 'manual', 'auto']
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ['none', isArbitraryVariable, isArbitraryValue]
      }],
      // -------------------
      // --- Backgrounds ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      'bg-attachment': [{
        bg: ['fixed', 'local', 'scroll']
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      'bg-clip': [{
        'bg-clip': ['border', 'padding', 'content', 'text']
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      'bg-origin': [{
        'bg-origin': ['border', 'padding', 'content']
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      'bg-position': [{
        bg: scaleBgPosition()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      'bg-repeat': [{
        bg: scaleBgRepeat()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      'bg-size': [{
        bg: scaleBgSize()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      'bg-image': [{
        bg: ['none', {
          linear: [{
            to: ['t', 'tr', 'r', 'br', 'b', 'bl', 'l', 'tl']
          }, isInteger, isArbitraryVariable, isArbitraryValue],
          radial: ['', isArbitraryVariable, isArbitraryValue],
          conic: [isInteger, isArbitraryVariable, isArbitraryValue]
        }, isArbitraryVariableImage, isArbitraryImage]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      'bg-color': [{
        bg: scaleColor()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-from-pos': [{
        from: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-via-pos': [{
        via: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-to-pos': [{
        to: scaleGradientStopPosition()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-from': [{
        from: scaleColor()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-via': [{
        via: scaleColor()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-to': [{
        to: scaleColor()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: scaleRadius()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-s': [{
        'rounded-s': scaleRadius()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-e': [{
        'rounded-e': scaleRadius()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-t': [{
        'rounded-t': scaleRadius()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-r': [{
        'rounded-r': scaleRadius()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-b': [{
        'rounded-b': scaleRadius()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-l': [{
        'rounded-l': scaleRadius()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-ss': [{
        'rounded-ss': scaleRadius()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-se': [{
        'rounded-se': scaleRadius()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-ee': [{
        'rounded-ee': scaleRadius()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-es': [{
        'rounded-es': scaleRadius()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-tl': [{
        'rounded-tl': scaleRadius()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-tr': [{
        'rounded-tr': scaleRadius()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-br': [{
        'rounded-br': scaleRadius()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-bl': [{
        'rounded-bl': scaleRadius()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w': [{
        border: scaleBorderWidth()
      }],
      /**
       * Border Width X
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-x': [{
        'border-x': scaleBorderWidth()
      }],
      /**
       * Border Width Y
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-y': [{
        'border-y': scaleBorderWidth()
      }],
      /**
       * Border Width Start
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-s': [{
        'border-s': scaleBorderWidth()
      }],
      /**
       * Border Width End
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-e': [{
        'border-e': scaleBorderWidth()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-t': [{
        'border-t': scaleBorderWidth()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-r': [{
        'border-r': scaleBorderWidth()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-b': [{
        'border-b': scaleBorderWidth()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-l': [{
        'border-l': scaleBorderWidth()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      'divide-x': [{
        'divide-x': scaleBorderWidth()
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      'divide-x-reverse': ['divide-x-reverse'],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      'divide-y': [{
        'divide-y': scaleBorderWidth()
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      'divide-y-reverse': ['divide-y-reverse'],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      'border-style': [{
        border: [...scaleLineStyle(), 'hidden', 'none']
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      'divide-style': [{
        divide: [...scaleLineStyle(), 'hidden', 'none']
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color': [{
        border: scaleColor()
      }],
      /**
       * Border Color X
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-x': [{
        'border-x': scaleColor()
      }],
      /**
       * Border Color Y
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-y': [{
        'border-y': scaleColor()
      }],
      /**
       * Border Color S
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-s': [{
        'border-s': scaleColor()
      }],
      /**
       * Border Color E
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-e': [{
        'border-e': scaleColor()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-t': [{
        'border-t': scaleColor()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-r': [{
        'border-r': scaleColor()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-b': [{
        'border-b': scaleColor()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-l': [{
        'border-l': scaleColor()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      'divide-color': [{
        divide: scaleColor()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      'outline-style': [{
        outline: [...scaleLineStyle(), 'none', 'hidden']
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      'outline-offset': [{
        'outline-offset': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      'outline-w': [{
        outline: ['', isNumber, isArbitraryVariableLength, isArbitraryLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      'outline-color': [{
        outline: scaleColor()
      }],
      // ---------------
      // --- Effects ---
      // ---------------
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: [
        // Deprecated since Tailwind CSS v4.0.0
        '', 'none', themeShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      'shadow-color': [{
        shadow: scaleColor()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      'inset-shadow': [{
        'inset-shadow': ['none', themeInsetShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      'inset-shadow-color': [{
        'inset-shadow': scaleColor()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      'ring-w': [{
        ring: scaleBorderWidth()
      }],
      /**
       * Ring Width Inset
       * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      'ring-w-inset': ['ring-inset'],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      'ring-color': [{
        ring: scaleColor()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      'ring-offset-w': [{
        'ring-offset': [isNumber, isArbitraryLength]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      'ring-offset-color': [{
        'ring-offset': scaleColor()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      'inset-ring-w': [{
        'inset-ring': scaleBorderWidth()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      'inset-ring-color': [{
        'inset-ring': scaleColor()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      'text-shadow': [{
        'text-shadow': ['none', themeTextShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      'text-shadow-color': [{
        'text-shadow': scaleColor()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      'mix-blend': [{
        'mix-blend': [...scaleBlendMode(), 'plus-darker', 'plus-lighter']
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      'bg-blend': [{
        'bg-blend': scaleBlendMode()
      }],
      /**
       * Mask Clip
       * @see https://tailwindcss.com/docs/mask-clip
       */
      'mask-clip': [{
        'mask-clip': ['border', 'padding', 'content', 'fill', 'stroke', 'view']
      }, 'mask-no-clip'],
      /**
       * Mask Composite
       * @see https://tailwindcss.com/docs/mask-composite
       */
      'mask-composite': [{
        mask: ['add', 'subtract', 'intersect', 'exclude']
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      'mask-image-linear-pos': [{
        'mask-linear': [isNumber]
      }],
      'mask-image-linear-from-pos': [{
        'mask-linear-from': scaleMaskImagePosition()
      }],
      'mask-image-linear-to-pos': [{
        'mask-linear-to': scaleMaskImagePosition()
      }],
      'mask-image-linear-from-color': [{
        'mask-linear-from': scaleColor()
      }],
      'mask-image-linear-to-color': [{
        'mask-linear-to': scaleColor()
      }],
      'mask-image-t-from-pos': [{
        'mask-t-from': scaleMaskImagePosition()
      }],
      'mask-image-t-to-pos': [{
        'mask-t-to': scaleMaskImagePosition()
      }],
      'mask-image-t-from-color': [{
        'mask-t-from': scaleColor()
      }],
      'mask-image-t-to-color': [{
        'mask-t-to': scaleColor()
      }],
      'mask-image-r-from-pos': [{
        'mask-r-from': scaleMaskImagePosition()
      }],
      'mask-image-r-to-pos': [{
        'mask-r-to': scaleMaskImagePosition()
      }],
      'mask-image-r-from-color': [{
        'mask-r-from': scaleColor()
      }],
      'mask-image-r-to-color': [{
        'mask-r-to': scaleColor()
      }],
      'mask-image-b-from-pos': [{
        'mask-b-from': scaleMaskImagePosition()
      }],
      'mask-image-b-to-pos': [{
        'mask-b-to': scaleMaskImagePosition()
      }],
      'mask-image-b-from-color': [{
        'mask-b-from': scaleColor()
      }],
      'mask-image-b-to-color': [{
        'mask-b-to': scaleColor()
      }],
      'mask-image-l-from-pos': [{
        'mask-l-from': scaleMaskImagePosition()
      }],
      'mask-image-l-to-pos': [{
        'mask-l-to': scaleMaskImagePosition()
      }],
      'mask-image-l-from-color': [{
        'mask-l-from': scaleColor()
      }],
      'mask-image-l-to-color': [{
        'mask-l-to': scaleColor()
      }],
      'mask-image-x-from-pos': [{
        'mask-x-from': scaleMaskImagePosition()
      }],
      'mask-image-x-to-pos': [{
        'mask-x-to': scaleMaskImagePosition()
      }],
      'mask-image-x-from-color': [{
        'mask-x-from': scaleColor()
      }],
      'mask-image-x-to-color': [{
        'mask-x-to': scaleColor()
      }],
      'mask-image-y-from-pos': [{
        'mask-y-from': scaleMaskImagePosition()
      }],
      'mask-image-y-to-pos': [{
        'mask-y-to': scaleMaskImagePosition()
      }],
      'mask-image-y-from-color': [{
        'mask-y-from': scaleColor()
      }],
      'mask-image-y-to-color': [{
        'mask-y-to': scaleColor()
      }],
      'mask-image-radial': [{
        'mask-radial': [isArbitraryVariable, isArbitraryValue]
      }],
      'mask-image-radial-from-pos': [{
        'mask-radial-from': scaleMaskImagePosition()
      }],
      'mask-image-radial-to-pos': [{
        'mask-radial-to': scaleMaskImagePosition()
      }],
      'mask-image-radial-from-color': [{
        'mask-radial-from': scaleColor()
      }],
      'mask-image-radial-to-color': [{
        'mask-radial-to': scaleColor()
      }],
      'mask-image-radial-shape': [{
        'mask-radial': ['circle', 'ellipse']
      }],
      'mask-image-radial-size': [{
        'mask-radial': [{
          closest: ['side', 'corner'],
          farthest: ['side', 'corner']
        }]
      }],
      'mask-image-radial-pos': [{
        'mask-radial-at': scalePosition()
      }],
      'mask-image-conic-pos': [{
        'mask-conic': [isNumber]
      }],
      'mask-image-conic-from-pos': [{
        'mask-conic-from': scaleMaskImagePosition()
      }],
      'mask-image-conic-to-pos': [{
        'mask-conic-to': scaleMaskImagePosition()
      }],
      'mask-image-conic-from-color': [{
        'mask-conic-from': scaleColor()
      }],
      'mask-image-conic-to-color': [{
        'mask-conic-to': scaleColor()
      }],
      /**
       * Mask Mode
       * @see https://tailwindcss.com/docs/mask-mode
       */
      'mask-mode': [{
        mask: ['alpha', 'luminance', 'match']
      }],
      /**
       * Mask Origin
       * @see https://tailwindcss.com/docs/mask-origin
       */
      'mask-origin': [{
        'mask-origin': ['border', 'padding', 'content', 'fill', 'stroke', 'view']
      }],
      /**
       * Mask Position
       * @see https://tailwindcss.com/docs/mask-position
       */
      'mask-position': [{
        mask: scaleBgPosition()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      'mask-repeat': [{
        mask: scaleBgRepeat()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      'mask-size': [{
        mask: scaleBgSize()
      }],
      /**
       * Mask Type
       * @see https://tailwindcss.com/docs/mask-type
       */
      'mask-type': [{
        'mask-type': ['alpha', 'luminance']
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      'mask-image': [{
        mask: ['none', isArbitraryVariable, isArbitraryValue]
      }],
      // ---------------
      // --- Filters ---
      // ---------------
      /**
       * Filter
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: [
        // Deprecated since Tailwind CSS v3.0.0
        '', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: scaleBlur()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      'drop-shadow': [{
        'drop-shadow': [
        // Deprecated since Tailwind CSS v4.0.0
        '', 'none', themeDropShadow, isArbitraryVariableShadow, isArbitraryShadow]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      'drop-shadow-color': [{
        'drop-shadow': scaleColor()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      'hue-rotate': [{
        'hue-rotate': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Filter
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      'backdrop-filter': [{
        'backdrop-filter': [
        // Deprecated since Tailwind CSS v3.0.0
        '', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      'backdrop-blur': [{
        'backdrop-blur': scaleBlur()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      'backdrop-brightness': [{
        'backdrop-brightness': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      'backdrop-contrast': [{
        'backdrop-contrast': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      'backdrop-grayscale': [{
        'backdrop-grayscale': ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      'backdrop-hue-rotate': [{
        'backdrop-hue-rotate': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      'backdrop-invert': [{
        'backdrop-invert': ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      'backdrop-opacity': [{
        'backdrop-opacity': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      'backdrop-saturate': [{
        'backdrop-saturate': [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      'backdrop-sepia': [{
        'backdrop-sepia': ['', isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      // --------------
      // --- Tables ---
      // --------------
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      'border-collapse': [{
        border: ['collapse', 'separate']
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing': [{
        'border-spacing': scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing-x': [{
        'border-spacing-x': scaleUnambiguousSpacing()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing-y': [{
        'border-spacing-y': scaleUnambiguousSpacing()
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      'table-layout': [{
        table: ['auto', 'fixed']
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ['top', 'bottom']
      }],
      // ---------------------------------
      // --- Transitions and Animation ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ['', 'all', 'colors', 'opacity', 'shadow', 'transform', 'none', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Behavior
       * @see https://tailwindcss.com/docs/transition-behavior
       */
      'transition-behavior': [{
        transition: ['normal', 'discrete']
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: [isNumber, 'initial', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ['linear', 'initial', themeEase, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [isNumber, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ['none', themeAnimate, isArbitraryVariable, isArbitraryValue]
      }],
      // ------------------
      // --- Transforms ---
      // ------------------
      /**
       * Backface Visibility
       * @see https://tailwindcss.com/docs/backface-visibility
       */
      backface: [{
        backface: ['hidden', 'visible']
      }],
      /**
       * Perspective
       * @see https://tailwindcss.com/docs/perspective
       */
      perspective: [{
        perspective: [themePerspective, isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      'perspective-origin': [{
        'perspective-origin': scalePositionWithArbitrary()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: scaleRotate()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      'rotate-x': [{
        'rotate-x': scaleRotate()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      'rotate-y': [{
        'rotate-y': scaleRotate()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      'rotate-z': [{
        'rotate-z': scaleRotate()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: scaleScale()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-x': [{
        'scale-x': scaleScale()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-y': [{
        'scale-y': scaleScale()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-z': [{
        'scale-z': scaleScale()
      }],
      /**
       * Scale 3D
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-3d': ['scale-3d'],
      /**
       * Skew
       * @see https://tailwindcss.com/docs/skew
       */
      skew: [{
        skew: scaleSkew()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      'skew-x': [{
        'skew-x': scaleSkew()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      'skew-y': [{
        'skew-y': scaleSkew()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [isArbitraryVariable, isArbitraryValue, '', 'none', 'gpu', 'cpu']
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      'transform-origin': [{
        origin: scalePositionWithArbitrary()
      }],
      /**
       * Transform Style
       * @see https://tailwindcss.com/docs/transform-style
       */
      'transform-style': [{
        transform: ['3d', 'flat']
      }],
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      translate: [{
        translate: scaleTranslate()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-x': [{
        'translate-x': scaleTranslate()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-y': [{
        'translate-y': scaleTranslate()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-z': [{
        'translate-z': scaleTranslate()
      }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-none': ['translate-none'],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: scaleColor()
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ['none', 'auto']
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      'caret-color': [{
        caret: scaleColor()
      }],
      /**
       * Color Scheme
       * @see https://tailwindcss.com/docs/color-scheme
       */
      'color-scheme': [{
        scheme: ['normal', 'dark', 'light', 'light-dark', 'only-dark', 'only-light']
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ['auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed', 'none', 'context-menu', 'progress', 'cell', 'crosshair', 'vertical-text', 'alias', 'copy', 'no-drop', 'grab', 'grabbing', 'all-scroll', 'col-resize', 'row-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'zoom-in', 'zoom-out', isArbitraryVariable, isArbitraryValue]
      }],
      /**
       * Field Sizing
       * @see https://tailwindcss.com/docs/field-sizing
       */
      'field-sizing': [{
        'field-sizing': ['fixed', 'content']
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      'pointer-events': [{
        'pointer-events': ['auto', 'none']
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ['none', '', 'y', 'x']
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      'scroll-behavior': [{
        scroll: ['auto', 'smooth']
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-m': [{
        'scroll-m': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mx': [{
        'scroll-mx': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-my': [{
        'scroll-my': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-ms': [{
        'scroll-ms': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-me': [{
        'scroll-me': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mt': [{
        'scroll-mt': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mr': [{
        'scroll-mr': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mb': [{
        'scroll-mb': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-ml': [{
        'scroll-ml': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-p': [{
        'scroll-p': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-px': [{
        'scroll-px': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-py': [{
        'scroll-py': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-ps': [{
        'scroll-ps': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pe': [{
        'scroll-pe': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pt': [{
        'scroll-pt': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pr': [{
        'scroll-pr': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pb': [{
        'scroll-pb': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pl': [{
        'scroll-pl': scaleUnambiguousSpacing()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      'snap-align': [{
        snap: ['start', 'end', 'center', 'align-none']
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      'snap-stop': [{
        snap: ['normal', 'always']
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      'snap-type': [{
        snap: ['none', 'x', 'y', 'both']
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      'snap-strictness': [{
        snap: ['mandatory', 'proximity']
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ['auto', 'none', 'manipulation']
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-x': [{
        'touch-pan': ['x', 'left', 'right']
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-y': [{
        'touch-pan': ['y', 'up', 'down']
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      'touch-pz': ['touch-pinch-zoom'],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ['none', 'text', 'all', 'auto']
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      'will-change': [{
        'will-change': ['auto', 'scroll', 'contents', 'transform', isArbitraryVariable, isArbitraryValue]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ['none', ...scaleColor()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      'stroke-w': [{
        stroke: [isNumber, isArbitraryVariableLength, isArbitraryLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ['none', ...scaleColor()]
      }],
      // ---------------------
      // --- Accessibility ---
      // ---------------------
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      'forced-color-adjust': [{
        'forced-color-adjust': ['auto', 'none']
      }]
    },
    conflictingClassGroups: {
      overflow: ['overflow-x', 'overflow-y'],
      overscroll: ['overscroll-x', 'overscroll-y'],
      inset: ['inset-x', 'inset-y', 'start', 'end', 'top', 'right', 'bottom', 'left'],
      'inset-x': ['right', 'left'],
      'inset-y': ['top', 'bottom'],
      flex: ['basis', 'grow', 'shrink'],
      gap: ['gap-x', 'gap-y'],
      p: ['px', 'py', 'ps', 'pe', 'pt', 'pr', 'pb', 'pl'],
      px: ['pr', 'pl'],
      py: ['pt', 'pb'],
      m: ['mx', 'my', 'ms', 'me', 'mt', 'mr', 'mb', 'ml'],
      mx: ['mr', 'ml'],
      my: ['mt', 'mb'],
      size: ['w', 'h'],
      'font-size': ['leading'],
      'fvn-normal': ['fvn-ordinal', 'fvn-slashed-zero', 'fvn-figure', 'fvn-spacing', 'fvn-fraction'],
      'fvn-ordinal': ['fvn-normal'],
      'fvn-slashed-zero': ['fvn-normal'],
      'fvn-figure': ['fvn-normal'],
      'fvn-spacing': ['fvn-normal'],
      'fvn-fraction': ['fvn-normal'],
      'line-clamp': ['display', 'overflow'],
      rounded: ['rounded-s', 'rounded-e', 'rounded-t', 'rounded-r', 'rounded-b', 'rounded-l', 'rounded-ss', 'rounded-se', 'rounded-ee', 'rounded-es', 'rounded-tl', 'rounded-tr', 'rounded-br', 'rounded-bl'],
      'rounded-s': ['rounded-ss', 'rounded-es'],
      'rounded-e': ['rounded-se', 'rounded-ee'],
      'rounded-t': ['rounded-tl', 'rounded-tr'],
      'rounded-r': ['rounded-tr', 'rounded-br'],
      'rounded-b': ['rounded-br', 'rounded-bl'],
      'rounded-l': ['rounded-tl', 'rounded-bl'],
      'border-spacing': ['border-spacing-x', 'border-spacing-y'],
      'border-w': ['border-w-x', 'border-w-y', 'border-w-s', 'border-w-e', 'border-w-t', 'border-w-r', 'border-w-b', 'border-w-l'],
      'border-w-x': ['border-w-r', 'border-w-l'],
      'border-w-y': ['border-w-t', 'border-w-b'],
      'border-color': ['border-color-x', 'border-color-y', 'border-color-s', 'border-color-e', 'border-color-t', 'border-color-r', 'border-color-b', 'border-color-l'],
      'border-color-x': ['border-color-r', 'border-color-l'],
      'border-color-y': ['border-color-t', 'border-color-b'],
      translate: ['translate-x', 'translate-y', 'translate-none'],
      'translate-none': ['translate', 'translate-x', 'translate-y', 'translate-z'],
      'scroll-m': ['scroll-mx', 'scroll-my', 'scroll-ms', 'scroll-me', 'scroll-mt', 'scroll-mr', 'scroll-mb', 'scroll-ml'],
      'scroll-mx': ['scroll-mr', 'scroll-ml'],
      'scroll-my': ['scroll-mt', 'scroll-mb'],
      'scroll-p': ['scroll-px', 'scroll-py', 'scroll-ps', 'scroll-pe', 'scroll-pt', 'scroll-pr', 'scroll-pb', 'scroll-pl'],
      'scroll-px': ['scroll-pr', 'scroll-pl'],
      'scroll-py': ['scroll-pt', 'scroll-pb'],
      touch: ['touch-x', 'touch-y', 'touch-pz'],
      'touch-x': ['touch'],
      'touch-y': ['touch'],
      'touch-pz': ['touch']
    },
    conflictingClassGroupModifiers: {
      'font-size': ['leading']
    },
    orderSensitiveModifiers: ['*', '**', 'after', 'backdrop', 'before', 'details-content', 'file', 'first-letter', 'first-line', 'marker', 'placeholder', 'selection']
  };
};
const twMerge = /*#__PURE__*/createTailwindMerge(getDefaultConfig);

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button$1 = React__namespace.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? reactSlot.Slot : "button";
    return /* @__PURE__ */ jsxRuntime.jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button$1.displayName = "Button";

const TooltipProvider = TooltipPrimitive__namespace.Provider;
const Tooltip = TooltipPrimitive__namespace.Root;
const TooltipTrigger = TooltipPrimitive__namespace.Trigger;
const TooltipContent = React__namespace.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(TooltipPrimitive__namespace.Portal, { children: /* @__PURE__ */ jsxRuntime.jsx(
  TooltipPrimitive__namespace.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = TooltipPrimitive__namespace.Content.displayName;

const TooltipIconButton = React.forwardRef(
  ({ children, tooltip, side = "bottom", className, ...rest }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntime.jsxs(Tooltip, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsxs(Button$1, { variant: "ghost", size: "icon", ...rest, className: cn("size-6 p-1", className), ref, children: [
        children,
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: tooltip })
      ] }) }),
      /* @__PURE__ */ jsxRuntime.jsx(TooltipContent, { side, children: tooltip })
    ] }) });
  }
);
TooltipIconButton.displayName = "TooltipIconButton";

const Avatar = React__namespace.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  AvatarPrimitive__namespace.Root,
  {
    ref,
    className: cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className),
    ...props
  }
));
Avatar.displayName = AvatarPrimitive__namespace.Root.displayName;
const AvatarImage = React__namespace.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(AvatarPrimitive__namespace.Image, { ref, className: cn("aspect-square h-full w-full", className), ...props }));
AvatarImage.displayName = AvatarPrimitive__namespace.Image.displayName;
const AvatarFallback = React__namespace.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  AvatarPrimitive__namespace.Fallback,
  {
    ref,
    className: cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className),
    ...props
  }
));
AvatarFallback.displayName = AvatarPrimitive__namespace.Fallback.displayName;

const ImageWithFallback = ({ alt, src, ...rest }) => {
  const [error, setError] = React.useState(false);
  React.useEffect(() => {
    setError(false);
  }, [src]);
  return error || !src ? /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        strokeWidth: "1.5",
        stroke: "currentColor",
        width: "150",
        height: "150",
        children: /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs italic text-muted-foreground -mt-[0.625rem] mb-[0.625rem]", children: "Image link is broken" })
  ] }) : /* @__PURE__ */ jsxRuntime.jsx(
    "img",
    {
      src,
      alt,
      ...rest,
      onError: () => {
        setError(true);
      }
    }
  );
};

const SyntaxHighlighter$2 = reactSyntaxHighlighter.makePrismAsyncSyntaxHighlighter({
  style: prism.coldarkDark,
  customStyle: {
    margin: 0,
    backgroundColor: "black"
  }
});
const MarkdownTextImpl = () => {
  return /* @__PURE__ */ jsxRuntime.jsx(reactMarkdown.MarkdownTextPrimitive, { remarkPlugins: [remarkGfm], className: "aui-md", components: defaultComponents });
};
const MarkdownText = React.memo(MarkdownTextImpl);
const CodeHeader = ({ language, code }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard$1();
  const onCopy = () => {
    if (!code || isCopied) return;
    copyToClipboard(code);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      style: {
        background: "hsl(0 0% 100% / 0.06)",
        borderTopRightRadius: "0.5rem",
        borderTopLeftRadius: "0.5rem",
        marginTop: "0.5rem",
        border: "1px solid hsl(0 0% 20.4%)",
        borderBottom: "none"
      },
      className: "flex items-center justify-between gap-4 px-4 py-2 text-sm font-semibold text-white",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "lowercase [&>span]:text-xs", children: language }),
        /* @__PURE__ */ jsxRuntime.jsx(TooltipIconButton, { tooltip: "Copy", onClick: onCopy, children: /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "grid", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "span",
            {
              style: {
                gridArea: "1/1"
              },
              className: cn("transition-transform", isCopied ? "scale-100" : "scale-0"),
              children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CheckIcon, { size: 14 })
            },
            "checkmark"
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            "span",
            {
              style: {
                gridArea: "1/1"
              },
              className: cn("transition-transform", isCopied ? "scale-0" : "scale-100"),
              children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CopyIcon, { size: 14 })
            },
            "copy"
          )
        ] }) })
      ]
    }
  );
};
const useCopyToClipboard$1 = ({
  copiedDuration = 1500
} = {}) => {
  const [isCopied, setIsCopied] = React.useState(false);
  const copyToClipboard = (value) => {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), copiedDuration);
    });
  };
  return { isCopied, copyToClipboard };
};
const defaultComponents = reactMarkdown.unstable_memoizeMarkdownComponents({
  h1: ({ className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx(
    "h1",
    {
      className: cn("mb-8 scroll-m-20 text-4xl font-extrabold tracking-tight last:mb-0", className),
      ...props,
      style: {
        marginBottom: "2rem"
      }
    }
  ),
  h2: ({ className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx(
    "h2",
    {
      className: cn("mb-4 mt-8 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 last:mb-0", className),
      ...props,
      style: {
        marginBottom: "1rem",
        marginTop: "2rem"
      }
    }
  ),
  h3: ({ className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx(
    "h3",
    {
      className: cn("scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 last:mb-0", className),
      ...props,
      style: {
        marginBottom: "1rem",
        marginTop: "1.5rem"
      }
    }
  ),
  h4: ({ className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx(
    "h4",
    {
      className: cn("scroll-m-20 text-xl font-semibold tracking-tight first:mt-0 last:mb-0", className),
      ...props,
      style: {
        marginBottom: "1rem",
        marginTop: "1.5rem"
      }
    }
  ),
  h5: ({ className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx(
    "h5",
    {
      className: cn("font-semibold first:mt-0 last:mb-0", className),
      ...props,
      style: {
        marginBottom: "1rem",
        marginTop: "1rem"
      }
    }
  ),
  h6: ({ className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx(
    "h6",
    {
      className: cn("font-semibold first:mt-0 last:mb-0", className),
      ...props,
      style: {
        marginBottom: "1rem",
        marginTop: "1rem"
      }
    }
  ),
  p: ({ className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("p", { className: cn("leading-7 first:mt-0 last:mb-0", className), ...props }),
  a: ({ className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("a", { className: cn("text-primary font-medium underline underline-offset-4", className), ...props }),
  blockquote: ({ className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("blockquote", { className: cn("border-l-2 pl-6 italic", className), ...props }),
  ul: ({ className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("ul", { className: cn("my-5 ml-6 list-disc [&>li]:mt-2", className), ...props }),
  ol: ({ className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("ol", { className: cn("my-5 ml-6 list-decimal [&>li]:mt-2", className), ...props }),
  hr: ({ className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("hr", { className: cn("my-5 border-b", className), ...props }),
  table: ({ className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("table", { className: cn("my-5 w-full border-separate border-spacing-0 overflow-y-auto", className), ...props }),
  th: ({ className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx(
    "th",
    {
      className: cn(
        "bg-muted px-4 py-2 text-left font-bold first:rounded-tl-lg last:rounded-tr-lg [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      ),
      ...props
    }
  ),
  td: ({ className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx(
    "td",
    {
      className: cn(
        "border-b border-l px-4 py-2 text-left last:border-r [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      ),
      ...props
    }
  ),
  tr: ({ className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx(
    "tr",
    {
      className: cn(
        "m-0 border-b p-0 first:border-t [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg",
        className
      ),
      ...props
    }
  ),
  sup: ({ className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("sup", { className: cn("[&>a]:text-xs [&>a]:no-underline", className), ...props }),
  pre: ({ className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx(
    "pre",
    {
      ...props,
      style: {
        borderBottomRightRadius: "0.5rem",
        borderBottomLeftRadius: "0.5rem",
        background: "transparent",
        fontSize: "0.875rem",
        marginBottom: "0.5rem",
        border: "1px solid hsl(0 0% 20.4%)"
      },
      className: cn("overflow-x-auto p-4 text-white", className)
    }
  ),
  code: function Code({ className, ...props }) {
    const isCodeBlock = reactMarkdown.useIsMarkdownCodeBlock();
    return /* @__PURE__ */ jsxRuntime.jsxs(
      "pre",
      {
        style: {
          fontSize: "0.875rem",
          display: "inline"
        },
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "code",
            {
              className: cn(!isCodeBlock && "bg-muted rounded border font-semibold", className),
              ...props,
              style: {
                fontWeight: "400",
                paddingBlock: !isCodeBlock ? "0.1em" : 0,
                paddingInline: !isCodeBlock ? "0.3em" : 0
              }
            }
          ),
          " "
        ]
      }
    );
  },
  CodeHeader,
  SyntaxHighlighter: SyntaxHighlighter$2,
  img: ImageWithFallback
});

const sizes = {
  sm: "[&>svg]:h-icon-sm [&>svg]:w-icon-sm",
  default: "[&>svg]:h-icon-default [&>svg]:w-icon-default",
  lg: "[&>svg]:h-icon-lg [&>svg]:w-icon-lg"
};
const Icon = ({ children, className, size = "default", ...props }) => {
  return /* @__PURE__ */ jsxRuntime.jsx("span", { className: clsx("block", sizes[size], className), ...props, children });
};

const variantClasses$2 = {
  default: "text-icon3",
  success: "text-accent1",
  error: "text-accent2",
  info: "text-accent3"
};
const Badge$1 = ({ icon, variant = "default", className, children, ...props }) => {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: clsx(
        "bg-surface4 text-ui-sm gap-md h-badge-default inline-flex items-center rounded-md",
        icon ? "pl-md pr-1.5" : "px-1.5",
        icon || variant === "default" ? "text-icon5" : variantClasses$2[variant],
        className
      ),
      ...props,
      children: [
        icon && /* @__PURE__ */ jsxRuntime.jsx("span", { className: variantClasses$2[variant], children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: icon }) }),
        children
      ]
    }
  );
};

const AgentIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M8.5 15C10.3565 15 12.137 14.2625 13.4497 12.9497C14.7625 11.637 15.5 9.85652 15.5 8C15.5 6.14348 14.7625 4.36301 13.4497 3.05025C12.137 1.7375 10.3565 1 8.5 1C6.64348 1 4.86301 1.7375 3.55025 3.05025C2.2375 4.36301 1.5 6.14348 1.5 8C1.5 9.85652 2.2375 11.637 3.55025 12.9497C4.86301 14.2625 6.64348 15 8.5 15ZM5.621 10.879L4.611 11.889C3.84179 11.1198 3.31794 10.1398 3.1057 9.07291C2.89346 8.00601 3.00236 6.90013 3.41864 5.89512C3.83491 4.89012 4.53986 4.03112 5.44434 3.42676C6.34881 2.8224 7.41219 2.49983 8.5 2.49983C9.58781 2.49983 10.6512 2.8224 11.5557 3.42676C12.4601 4.03112 13.1651 4.89012 13.5814 5.89512C13.9976 6.90013 14.1065 8.00601 13.8943 9.07291C13.6821 10.1398 13.1582 11.1198 12.389 11.889L11.379 10.879C11.1004 10.6003 10.7696 10.3792 10.4055 10.2284C10.0414 10.0776 9.6511 9.99995 9.257 10H7.743C7.3489 9.99995 6.95865 10.0776 6.59455 10.2284C6.23045 10.3792 5.89963 10.6003 5.621 10.879Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M8.5 4C7.96957 4 7.46086 4.21071 7.08579 4.58579C6.71071 4.96086 6.5 5.46957 6.5 6V6.5C6.5 7.03043 6.71071 7.53914 7.08579 7.91421C7.46086 8.28929 7.96957 8.5 8.5 8.5C9.03043 8.5 9.53914 8.28929 9.91421 7.91421C10.2893 7.53914 10.5 7.03043 10.5 6.5V6C10.5 5.46957 10.2893 4.96086 9.91421 4.58579C9.53914 4.21071 9.03043 4 8.5 4Z",
      fill: "currentColor"
    }
  )
] });

const AgentCoinIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "126", height: "85", viewBox: "0 0 126 85", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M63.0002 0.968262C28.5152 0.968262 0.55957 15.6484 0.55957 33.7573V51.2428C0.55957 69.3517 28.5152 84.0319 63.0002 84.0319C97.4853 84.0319 125.441 69.3517 125.441 51.2428V33.7573C125.441 15.6484 97.4853 0.968262 63.0002 0.968262Z",
      stroke: "#707070"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M119.322 35.1636C119.322 50.3595 94.1055 62.6782 62.9998 62.6782C31.894 62.6782 6.67773 50.3595 6.67773 35.1636V49.8363C6.67773 65.0322 31.894 77.351 62.9998 77.351C94.1055 77.351 119.322 65.0322 119.322 49.8363V35.1636Z",
      fill: "#2E2E2E",
      fillOpacity: "0.9"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M119.322 35.1636C119.322 50.3595 94.1055 62.6782 62.9998 62.6782C31.894 62.6782 6.67773 50.3595 6.67773 35.1636M119.322 35.1636C119.322 19.9677 94.1055 7.64893 62.9998 7.64893C31.894 7.64893 6.67773 19.9677 6.67773 35.1636M119.322 35.1636V49.8363C119.322 65.0322 94.1055 77.351 62.9998 77.351C31.894 77.351 6.67773 65.0322 6.67773 49.8363V35.1636",
      stroke: "#424242"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsxs("g", { clipPath: "url(#clip0_21421_19519)", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        fillRule: "evenodd",
        clipRule: "evenodd",
        d: "M38.5383 47.0955C45.0714 50.3122 53.9322 52.1193 63.1714 52.1193C72.4106 52.1193 81.2714 50.3122 87.8045 47.0955C94.3376 43.8787 98.0078 39.5159 98.0078 34.9668C98.0078 30.4177 94.3376 26.0549 87.8045 22.8381C81.2714 19.6214 72.4106 17.8143 63.1714 17.8143C53.9322 17.8143 45.0714 19.6214 38.5383 22.8381C32.0052 26.0549 28.3349 30.4177 28.3349 34.9668C28.3349 39.5159 32.0052 43.8787 38.5383 47.0955ZM42.9089 34.9668L35.8005 34.9668C35.8004 32.3013 37.4056 29.6956 40.4132 27.4793C43.4207 25.263 47.6956 23.5355 52.6971 22.5154C57.6986 21.4954 63.2022 21.2285 68.5118 21.7485C73.8214 22.2685 78.6986 23.552 82.5266 25.4368C86.3546 27.3216 88.9615 29.723 90.0176 32.3373C91.0737 34.9517 90.5316 37.6614 88.4599 40.1241C86.3881 42.5867 82.8797 44.6915 78.3784 46.1723C73.8771 47.6532 68.585 48.4435 63.1714 48.4435V44.9435C63.1717 43.9778 62.7855 43.0215 62.035 42.1293C61.2845 41.2372 60.1843 40.4265 58.7973 39.7438L53.4695 37.1205C52.0828 36.4376 50.4364 35.8959 48.6244 35.5263C46.8124 35.1568 44.8702 34.9667 42.9089 34.9668Z",
        fill: "#A9A9A9"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        d: "M77.2474 28.0361C75.3808 27.1171 72.8492 26.6007 70.2094 26.6007C67.5696 26.6007 65.038 27.1171 63.1714 28.0361L61.4119 28.9025C59.5453 29.8215 58.4966 31.068 58.4966 32.3678C58.4966 33.6676 59.5453 34.9141 61.4119 35.8331C63.2785 36.7522 65.8101 37.2685 68.4499 37.2685C71.0897 37.2685 73.6213 36.7522 75.4879 35.8331L77.2474 34.9668C79.114 34.0477 80.1627 32.8012 80.1627 31.5015C80.1627 30.2017 79.114 28.9552 77.2474 28.0361Z",
        fill: "#A9A9A9"
      }
    )
  ] }),
  /* @__PURE__ */ jsxRuntime.jsx("defs", { children: /* @__PURE__ */ jsxRuntime.jsx("clipPath", { id: "clip0_21421_19519", children: /* @__PURE__ */ jsxRuntime.jsx(
    "rect",
    {
      width: "62.7591",
      height: "62.7591",
      fill: "white",
      transform: "matrix(0.897148 0.441731 -0.897148 0.441731 63.1714 7.24365)"
    }
  ) }) })
] });

const AiIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M4.31445 3.16083C3.78402 3.16083 3.27531 3.37154 2.90024 3.74661C2.52517 4.12169 2.31445 4.63039 2.31445 5.16083V5.66083C2.31445 6.19126 2.52517 6.69997 2.90024 7.07504C3.27531 7.45011 3.78402 7.66083 4.31445 7.66083C4.84489 7.66083 5.35359 7.45011 5.72867 7.07504C6.10374 6.69997 6.31445 6.19126 6.31445 5.66083V5.16083C6.31445 4.63039 6.10374 4.12169 5.72867 3.74661C5.35359 3.37154 4.84489 3.16083 4.31445 3.16083Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M6.76666 9.50235C6.57678 9.28532 6.30244 9.16083 6.01407 9.16083H4.50201C4.10791 9.16078 3.71766 9.23838 3.35356 9.38921C3.11733 9.48706 2.8951 9.6145 2.69205 9.76806C2.48056 9.928 2.38001 10.1888 2.38001 10.454V13.0642C2.38001 13.6165 2.82773 14.0642 3.38001 14.0642H8.55436C9.4135 14.0642 9.87269 13.0523 9.30695 12.4057L6.76666 9.50235Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M12.0686 2.26107C12.0686 2.17635 11.9999 2.10767 11.9152 2.10767H10.9948C10.91 2.10767 10.8414 2.17635 10.8414 2.26107V3.85184C10.8414 3.95606 10.7397 4.02994 10.6406 3.99773L9.12775 3.50619C9.04718 3.48001 8.96063 3.52411 8.93445 3.60468L8.65003 4.48004C8.62385 4.56062 8.66795 4.64716 8.74852 4.67334L10.2611 5.1648C10.3602 5.19701 10.399 5.31655 10.3378 5.40086L9.40289 6.68765C9.35309 6.75619 9.36829 6.85212 9.43683 6.90192L10.1815 7.44292C10.25 7.49272 10.3459 7.47752 10.3957 7.40898L11.3309 6.12181C11.3922 6.03749 11.5179 6.03749 11.5791 6.12181L12.5143 7.40904C12.5641 7.47758 12.6601 7.49278 12.7286 7.44298L13.4732 6.90198C13.5418 6.85218 13.557 6.75625 13.5072 6.68771L12.5723 5.40091C12.511 5.3166 12.5499 5.19705 12.649 5.16485L14.1615 4.67338C14.2421 4.6472 14.2862 4.56066 14.26 4.48009L13.9756 3.60473C13.9494 3.52415 13.8629 3.48006 13.7823 3.50624L12.2694 3.99782C12.1703 4.03003 12.0686 3.95615 12.0686 3.85193V2.26107Z",
      fill: "currentColor"
    }
  )
] });

const ApiIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M11.0313 7.97578C11.0313 9.34436 9.92183 10.4538 8.55324 10.4538C7.18466 10.4538 6.0752 9.34436 6.0752 7.97578C6.0752 6.60719 7.18466 5.49773 8.55324 5.49773C9.92183 5.49773 11.0313 6.60719 11.0313 7.97578ZM11.0313 7.97578H14.573",
      stroke: "currentColor",
      strokeWidth: "1.33333",
      strokeLinecap: "round"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M12.967 4.46154C11.9273 3.14431 10.3165 2.29883 8.50814 2.29883C5.37277 2.29883 2.83105 4.84055 2.83105 7.97591C2.83105 11.1113 5.37277 13.653 8.50814 13.653C10.3165 13.653 11.9273 12.8075 12.967 11.4903",
      stroke: "currentColor",
      strokeWidth: "1.33333",
      strokeLinecap: "round"
    }
  )
] });

const BranchIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "8.57129", cy: "8.08496", r: "2.27832", stroke: "currentColor" }),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M5.89692 8.08203H2.45312", stroke: "currentColor" }),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M14.5454 8.08203H11.1016", stroke: "currentColor" })
] });

const CheckIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M5.99982 2.0625C3.8252 2.0625 2.06232 3.82538 2.06232 6C2.06232 8.17462 3.8252 9.9375 5.99982 9.9375C8.17444 9.9375 9.93732 8.17462 9.93732 6C9.93732 3.82538 8.17444 2.0625 5.99982 2.0625ZM0.937317 6C0.937317 3.20406 3.20388 0.9375 5.99982 0.9375C8.79576 0.9375 11.0623 3.20406 11.0623 6C11.0623 8.79594 8.79576 11.0625 5.99982 11.0625C3.20388 11.0625 0.937317 8.79594 0.937317 6Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M7.97865 4.57004C8.22604 4.75795 8.27426 5.11082 8.08635 5.35821L6.05486 8.03279C5.94873 8.17251 5.78348 8.25471 5.60803 8.25505C5.43257 8.2554 5.267 8.17385 5.16032 8.03454L3.80937 6.27034C3.6205 6.02369 3.66733 5.67063 3.91398 5.48176C4.16063 5.29288 4.51369 5.33972 4.70257 5.58637L5.6051 6.76498L7.19048 4.67774C7.37839 4.43036 7.73126 4.38213 7.97865 4.57004Z",
      fill: "currentColor"
    }
  )
] });

const ChevronIcon = (props) => /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: /* @__PURE__ */ jsxRuntime.jsx(
  "path",
  {
    d: "M4.60059 6.30005L8.00098 9.70005L11.3996 6.30142",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  }
) });

const CommitIcon = (props) => /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "12", height: "13", viewBox: "0 0 12 13", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: /* @__PURE__ */ jsxRuntime.jsx(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M1.46484 7.18262H3.29529C3.55505 8.46829 4.69121 9.43628 6.05347 9.43628C7.41572 9.43628 8.55188 8.46829 8.81165 7.18262L10.534 7.18262C10.8447 7.18262 11.0965 6.93078 11.0965 6.62012C11.0965 6.30946 10.8447 6.05762 10.534 6.05762L8.81075 6.05762C8.54929 4.77414 7.41417 3.80835 6.05347 3.80835C4.69277 3.80835 3.55764 4.77414 3.29618 6.05762H1.46484C1.15418 6.05762 0.902344 6.30946 0.902344 6.62012C0.902344 6.93078 1.15418 7.18262 1.46484 7.18262ZM6.05347 4.93335C5.12068 4.93335 4.3645 5.68952 4.3645 6.62231C4.3645 7.5551 5.12068 8.31128 6.05347 8.31128C6.98626 8.31128 7.74243 7.5551 7.74243 6.62231C7.74243 5.68952 6.98626 4.93335 6.05347 4.93335Z",
    fill: "currentColor"
  }
) });

const CrossIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M5.99982 2.0625C3.8252 2.0625 2.06232 3.82538 2.06232 6C2.06232 8.17462 3.8252 9.9375 5.99982 9.9375C8.17444 9.9375 9.93732 8.17462 9.93732 6C9.93732 3.82538 8.17444 2.0625 5.99982 2.0625ZM0.937317 6C0.937317 3.20406 3.20388 0.9375 5.99982 0.9375C8.79576 0.9375 11.0623 3.20406 11.0623 6C11.0623 8.79594 8.79576 11.0625 5.99982 11.0625C3.20388 11.0625 0.937317 8.79594 0.937317 6Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M7.89741 4.10293C8.11707 4.32261 8.11706 4.67877 7.89738 4.89843L6.79517 6.00058L7.8962 7.10155C8.11588 7.32122 8.11589 7.67737 7.89623 7.89705C7.67656 8.11673 7.32041 8.11674 7.10073 7.89707L5.99965 6.79605L4.89856 7.89707C4.67889 8.11673 4.32273 8.11672 4.10307 7.89704C3.88341 7.67737 3.88342 7.32121 4.10309 7.10155L5.20413 6.00058L4.10191 4.89843C3.88224 4.67877 3.88223 4.32262 4.10189 4.10294C4.32155 3.88326 4.67771 3.88325 4.89738 4.10292L5.99965 5.20511L7.10191 4.10291C7.32159 3.88325 7.67774 3.88326 7.89741 4.10293Z",
      fill: "currentColor"
    }
  )
] });

const DbIcon = (props) => /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "13", height: "14", viewBox: "0 0 13 14", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: /* @__PURE__ */ jsxRuntime.jsx(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M0.941406 2.831V3.75745C0.941406 4.27885 1.35491 4.76002 2.05273 5.14711C2.10389 5.17549 2.15658 5.20337 2.21074 5.23071C3.23028 5.74546 4.77322 6.07356 6.50007 6.07356C8.31866 6.07356 9.93328 5.70967 10.9474 5.14711C11.6453 4.76002 12.0587 4.27886 12.0587 3.75745V2.831C12.0587 1.55185 9.57003 0.514893 6.50007 0.514893C3.4301 0.514893 0.941406 1.55185 0.941406 2.831ZM1.02052 6.14518C0.968505 6.27247 0.941406 6.40331 0.941406 6.53678V7.46322C0.941406 7.98463 1.35491 8.46579 2.05273 8.85289C3.06686 9.41542 4.68148 9.77933 6.50007 9.77933C8.22692 9.77933 9.76986 9.45128 10.7894 8.93645C10.8436 8.90912 10.8962 8.88124 10.9474 8.85289C11.6453 8.46579 12.0587 7.98462 12.0587 7.46322V6.53678C12.0587 6.40331 12.0316 6.27248 11.9796 6.14519C11.664 6.35469 11.3187 6.53063 10.9652 6.67795C9.75207 7.18337 8.17267 7.46322 6.50007 7.46322C4.82747 7.46322 3.24803 7.18337 2.03502 6.67795C1.68142 6.53063 1.3362 6.35469 1.02052 6.14518ZM1.02052 9.85095C0.968505 9.97824 0.941406 10.1091 0.941406 10.2426V11.169C0.941406 12.4481 3.4301 13.4851 6.50007 13.4851C9.57003 13.4851 12.0587 12.4481 12.0587 11.169V10.2426C12.0587 10.1091 12.0316 9.97824 11.9796 9.85095C11.664 10.0605 11.3187 10.2364 10.9652 10.3837C9.75207 10.8891 8.17267 11.169 6.50007 11.169C4.82747 11.169 3.24803 10.8891 2.03502 10.3837C1.68142 10.2364 1.3362 10.0605 1.02052 9.85095Z",
    fill: "currentColor"
  }
) });

const DebugIcon = (props) => /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: /* @__PURE__ */ jsxRuntime.jsx(
  "path",
  {
    d: "M6.14934 2.26085C5.88284 2.57794 5.92385 3.05104 6.24094 3.31754L7.05702 4.00343C6.51911 4.24774 6.05679 4.62747 5.72304 5.10093L4.31451 3.91711C3.99742 3.65061 3.52432 3.69162 3.25781 4.00871C2.99131 4.3258 3.03232 4.7989 3.34941 5.06541L5.1711 6.59647C5.16257 6.69009 5.1582 6.78504 5.1582 6.88115V8.02254H3.36523C2.95102 8.02254 2.61523 8.35833 2.61523 8.77254C2.61523 9.18675 2.95102 9.52254 3.36523 9.52254H5.1582V11.0692L3.38248 12.7049C3.07782 12.9856 3.05836 13.4601 3.339 13.7647C3.61965 14.0694 4.09412 14.0888 4.39877 13.8082L10.2843 8.38652V10.5302C10.2843 11.4231 9.5099 12.2129 8.47123 12.2129C8.28703 12.2129 8.11062 12.1876 7.94518 12.1411C7.54642 12.029 7.13229 12.2614 7.02021 12.6601C6.90812 13.0589 7.14051 13.473 7.53927 13.5851C7.83596 13.6685 8.14892 13.7129 8.47123 13.7129C9.71498 13.7129 10.8279 13.0443 11.3927 12.0355L13.0897 13.4618C13.4068 13.7283 13.8799 13.6873 14.1464 13.3702C14.4129 13.0531 14.3719 12.58 14.0548 12.3135L11.7843 10.4052V9.52254H13.634C14.0482 9.52254 14.384 9.18675 14.384 8.77254C14.384 8.35833 14.0482 8.02254 13.634 8.02254H11.7843V7.00473L13.9182 5.039C14.2228 4.75836 14.2423 4.28389 13.9616 3.97923C13.681 3.67458 13.2065 3.65512 12.9019 3.93576L6.6582 9.68737V6.88115C6.6582 5.98821 7.43256 5.19844 8.47123 5.19844L8.4789 5.19846L8.50782 5.22276L8.53124 5.19934C8.72739 5.20523 8.91424 5.23987 9.08781 5.29818C9.48045 5.43009 9.90569 5.21873 10.0376 4.82608C10.146 4.50351 10.0227 4.15895 9.75749 3.97309L10.4258 3.30474C10.7187 3.01185 10.7187 2.53698 10.4258 2.24408C10.1329 1.95119 9.65807 1.95119 9.36518 2.24408L8.41985 3.18941L7.20604 2.16925C6.88895 1.90274 6.41585 1.94375 6.14934 2.26085Z",
    fill: "currentColor"
  }
) });

const DeploymentIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "13", height: "14", viewBox: "0 0 13 14", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M6.83531 7.0062C6.64515 7.35069 6.15 7.35069 5.95984 7.0062L2.99029 1.62664C2.7855 1.25565 3.10614 0.814077 3.5223 0.893977L6.30195 1.42765C6.36421 1.43961 6.42818 1.43961 6.49044 1.42766L9.27301 0.893806C9.68915 0.813965 10.0097 1.25552 9.80495 1.62648L6.83531 7.0062Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M4.77553 6.93249C4.70399 6.80288 4.52254 6.79459 4.4558 6.92674C4.30167 7.23196 4.21484 7.57697 4.21484 7.94226C4.21484 9.18814 5.22483 10.1981 6.4707 10.1981C7.71658 10.1981 8.72656 9.18814 8.72656 7.94226C8.72656 7.51818 8.60954 7.12143 8.40603 6.78254C8.33262 6.66031 8.15949 6.67411 8.09059 6.79894L7.70941 7.48947C7.13892 8.52294 5.65347 8.52293 5.08299 7.48947L4.77553 6.93249ZM5.56313 5.8764C5.46196 5.92091 5.42707 6.04354 5.48048 6.1403L5.95846 7.0062C6.14862 7.35069 6.64377 7.35069 6.83393 7.0062L7.33905 6.09115C7.39467 5.99039 7.35417 5.86275 7.2461 5.8232C7.00431 5.7347 6.74315 5.6864 6.4707 5.6864C6.14785 5.6864 5.84083 5.75423 5.56313 5.8764Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M4.01974 3.49407C4.17993 3.78426 4.54405 3.88541 4.85312 3.76562C5.35484 3.57118 5.90031 3.46453 6.4707 3.46453C7.0005 3.46453 7.50881 3.55654 7.98052 3.72545C8.28711 3.83523 8.64168 3.73133 8.79906 3.44623C8.96234 3.15043 8.85109 2.77497 8.5364 2.652C7.89621 2.40184 7.19949 2.26453 6.4707 2.26453C5.69013 2.26453 4.94634 2.42205 4.2694 2.70703C3.96395 2.83562 3.85958 3.20392 4.01974 3.49407ZM9.9461 4.47216C9.81565 4.70848 9.85645 4.99948 10.0211 5.21339C10.6026 5.96887 10.9484 6.91518 10.9484 7.94226C10.9484 10.4152 8.94369 12.42 6.4707 12.42C3.99772 12.42 1.99297 10.4152 1.99297 7.94226C1.99297 6.96004 2.30923 6.05168 2.84547 5.31345C3.0006 5.09989 3.03605 4.81591 2.90848 4.58482C2.70986 4.22501 2.22216 4.15342 1.97124 4.47893C1.2324 5.43738 0.792968 6.6385 0.792968 7.94226C0.792969 11.078 3.33498 13.62 6.4707 13.62C9.60643 13.62 12.1484 11.078 12.1484 7.94226C12.1484 6.58193 11.67 5.33333 10.8723 4.35553C10.6173 4.04298 10.141 4.11901 9.9461 4.47216Z",
      fill: "currentColor"
    }
  )
] });

const DividerIcon = (props) => /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M8.5 3V13", stroke: "currentColor", strokeWidth: "0.5" }) });

const DocsIcon = (props) => /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: /* @__PURE__ */ jsxRuntime.jsx(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M5.1747 3.18598L7.02554 1.95209C7.11557 1.89207 7.31087 1.87106 7.41016 1.90924L12.4139 3.83377C12.4683 3.85467 12.546 3.96798 12.546 4.03118V13.0167C12.546 13.265 12.7473 13.4663 12.9956 13.4663C13.2439 13.4663 13.4452 13.265 13.4452 13.0167V4.03118C13.4452 3.59605 13.1384 3.14906 12.7367 2.99456L7.73293 1.07004C7.36225 0.927472 6.86056 0.981451 6.52679 1.20396L4.20445 2.75219L3.90419 2.95236L3.90647 2.95824C3.69329 3.05449 3.55469 3.27599 3.55469 3.57581V11.7119C3.55469 12.2084 3.93067 12.7499 4.39251 12.9206L9.89804 14.955C10.3608 15.126 10.7359 14.8596 10.7359 14.3659V5.83295C10.7359 5.33662 10.3498 4.81289 9.88389 4.66643L5.1747 3.18598Z",
    fill: "currentColor"
  }
) });

const EnvIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "2.74902", y: "1.89307", width: "11.8252", height: "11.8252", rx: "1.5", stroke: "currentColor" }),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M5.74512 5.43539L8.13964 7.83011L5.86867 10.1011M9.32711 10.1753H11.7465",
      stroke: "currentColor",
      strokeLinecap: "round"
    }
  )
] });

const EvaluatorCoinIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "126", height: "85", viewBox: "0 0 126 85", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M119.322 35.1636C119.322 50.3595 94.1055 62.6782 62.9998 62.6782C31.894 62.6782 6.67773 50.3595 6.67773 35.1636V49.8363C6.67773 65.0322 31.894 77.351 62.9998 77.351C94.1055 77.351 119.322 65.0322 119.322 49.8363V35.1636Z",
      fill: "#2E2E2E",
      fillOpacity: "0.9"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M119.322 35.1636C119.322 50.3595 94.1055 62.6782 62.9998 62.6782C31.894 62.6782 6.67773 50.3595 6.67773 35.1636M119.322 35.1636C119.322 19.9677 94.1055 7.64893 62.9998 7.64893C31.894 7.64893 6.67773 19.9677 6.67773 35.1636M119.322 35.1636V49.8363C119.322 65.0322 94.1055 77.351 62.9998 77.351C31.894 77.351 6.67773 65.0322 6.67773 49.8363V35.1636",
      stroke: "#424242"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M63.0002 0.968262C28.5152 0.968262 0.55957 15.6484 0.55957 33.7573V51.2428C0.55957 69.3517 28.5152 84.0319 63.0002 84.0319C97.4853 84.0319 125.441 69.3517 125.441 51.2428V33.7573C125.441 15.6484 97.4853 0.968262 63.0002 0.968262Z",
      stroke: "#707070"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M29.7417 32.3666L33.2608 30.6339C34.6607 29.9446 36.5594 29.5574 38.5393 29.5574C40.5191 29.5574 42.4178 29.9446 43.8178 30.6339C45.2177 31.3232 46.0042 32.2581 46.0042 33.2329C46.0042 34.2077 45.2177 35.1426 43.8178 35.8319L40.2988 37.5646C38.8988 38.2539 37.0001 38.6411 35.0203 38.6411C33.0404 38.6411 31.1417 38.2539 29.7417 37.5646C28.3418 36.8753 27.5553 35.9404 27.5553 34.9656C27.5553 33.9908 28.3418 33.0559 29.7417 32.3666ZM43.8178 39.2972L56.1343 33.2329C57.5343 32.5436 59.433 32.1564 61.4129 32.1564C63.3927 32.1564 65.2914 32.5436 66.6914 33.2329C68.0913 33.9222 68.8778 34.8571 68.8778 35.8319C68.8778 36.8067 68.0913 37.7416 66.6914 38.4309L54.3748 44.4952C52.9749 45.1845 51.0761 45.5718 49.0963 45.5718C47.1165 45.5718 45.2177 45.1845 43.8178 44.4952C42.4178 43.8059 41.6314 42.8711 41.6314 41.8962C41.6314 40.9214 42.4178 39.9865 43.8178 39.2972ZM57.8938 46.2279L86.0459 32.3666C87.4459 31.6773 89.3446 31.29 91.3245 31.29C93.3043 31.29 95.203 31.6773 96.603 32.3666C98.0029 33.0559 98.7894 33.9908 98.7894 34.9656C98.7894 35.9404 98.0029 36.8753 96.603 37.5646L68.4509 51.4259C67.0509 52.1152 65.1522 52.5024 63.1724 52.5024C61.1925 52.5024 59.2938 52.1152 57.8938 51.4259C56.4939 50.7366 55.7074 49.8017 55.7074 48.8269C55.7074 47.8521 56.4939 46.9172 57.8938 46.2279Z",
      fill: "#A9A9A9"
    }
  )
] });

const FiltersIcon = (props) => /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: /* @__PURE__ */ jsxRuntime.jsx(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M6.00001 12.5C6.00001 11.948 6.44401 11.5 7.00001 11.5H10C10.552 11.5 11 11.944 11 12.5C11 13.052 10.556 13.5 10 13.5H7.00001C6.44801 13.5 6.00001 13.056 6.00001 12.5ZM4.00001 8.5C4.00001 7.948 4.44601 7.5 4.99801 7.5H12.002C12.553 7.5 13 7.944 13 8.5C13 9.052 12.554 9.5 12.002 9.5H4.99801C4.86671 9.50026 4.73665 9.47457 4.61531 9.42438C4.49398 9.37419 4.38377 9.30051 4.29102 9.20757C4.19827 9.11464 4.12481 9.00428 4.07486 8.88284C4.02492 8.76141 3.99948 8.6313 4.00001 8.5ZM1.50001 4C1.50001 3.172 2.17501 2.5 2.99801 2.5H14.002C14.829 2.5 15.5 3.166 15.5 4C15.5 4.828 14.825 5.5 14.002 5.5H2.99801C2.80101 5.5004 2.60587 5.46185 2.42382 5.38659C2.24176 5.31132 2.07638 5.20082 1.93717 5.06142C1.79796 4.92203 1.68768 4.7565 1.61265 4.57434C1.53763 4.39219 1.49935 4.197 1.50001 4Z",
    fill: "currentColor"
  }
) });

const GithubCoinIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "127", height: "86", viewBox: "0 0 127 86", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M63.9116 1.87891C29.4266 1.87891 1.47095 16.5591 1.47095 34.668V52.1534C1.47095 70.2623 29.4266 84.9425 63.9116 84.9425C98.3967 84.9425 126.352 70.2623 126.352 52.1534V34.668C126.352 16.5591 98.3967 1.87891 63.9116 1.87891Z",
      stroke: "#707070"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M120.233 36.0742C120.233 51.2701 95.0169 63.5889 63.9111 63.5889C32.8053 63.5889 7.58911 51.2701 7.58911 36.0742V50.7469C7.58911 65.9429 32.8053 78.2616 63.9111 78.2616C95.0169 78.2616 120.233 65.9429 120.233 50.7469V36.0742Z",
      fill: "#2E2E2E",
      fillOpacity: "0.9"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M120.233 36.0742C120.233 51.2701 95.0169 63.5889 63.9111 63.5889C32.8053 63.5889 7.58911 51.2701 7.58911 36.0742M120.233 36.0742C120.233 20.8783 95.0169 8.55957 63.9111 8.55957C32.8053 8.55957 7.58911 20.8783 7.58911 36.0742M120.233 36.0742V50.7469C120.233 65.9429 95.0169 78.2616 63.9111 78.2616C32.8053 78.2616 7.58911 65.9429 7.58911 50.7469V36.0742",
      stroke: "#424242"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx("g", { clipPath: "url(#clip0_21999_20545)", children: /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M86.4812 24.847C73.5239 18.4672 52.5342 18.4672 39.5769 24.847C29.1993 29.9566 27.1473 37.5778 33.3621 43.6978C34.3295 44.3762 35.4728 44.2463 36.0884 43.9432C36.6454 43.6689 38.4629 42.7452 40.4271 41.7781C33.45 39.4109 34.4468 37.419 35.2969 36.5385C35.7073 36.0766 36.6454 34.4889 36.2057 33.7239C35.8246 33.1032 35.7366 31.9918 37.7301 32.9445C39.6062 33.8394 39.1958 35.3405 38.932 35.9034C37.4955 38.6892 41.8635 39.8584 43.8276 40.2192C45.5572 39.5697 47.1989 39.3676 48.4594 39.4109C43.8276 36.553 40.3977 32.8723 49.3682 28.4555C51.9186 27.1997 54.9381 26.6079 58.0748 26.5358C58.4266 26.1316 60.0096 24.5439 64.5241 23.5912C64.5241 23.5912 67.1039 24.2552 68.5696 27.9503C70.9735 28.6143 73.2307 29.4659 75.2242 30.4474C77.2176 31.4289 78.9472 32.5403 80.2957 33.7239C87.8297 34.4312 89.1489 35.7158 89.1489 35.7158C87.2141 37.9386 83.9894 38.7181 83.1686 38.8913C83.022 40.4357 81.8494 41.908 79.2697 43.1782C70.2699 47.6094 62.7945 45.8918 56.9901 43.6112C57.1074 44.3906 56.4331 45.4443 54.2345 46.5269C51.0978 48.0713 48.5474 49.2982 47.7558 49.6879C47.1402 49.991 46.8471 50.5684 48.2542 51.0303C54.4816 52.5487 61.5193 53.0674 68.3768 52.5133C75.2342 51.9592 81.5661 50.3602 86.4812 47.9414C99.4385 41.5616 99.4385 31.2268 86.4812 24.847Z",
      fill: "#A9A9A9"
    }
  ) }),
  /* @__PURE__ */ jsxRuntime.jsx("defs", { children: /* @__PURE__ */ jsxRuntime.jsx("clipPath", { id: "clip0_21999_20545", children: /* @__PURE__ */ jsxRuntime.jsx(
    "rect",
    {
      width: "62.7591",
      height: "62.7591",
      fill: "white",
      transform: "matrix(0.897148 0.441731 -0.897148 0.441731 64.0828 8.1543)"
    }
  ) }) })
] });

const GithubIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx("g", { clipPath: "url(#clip0_21999_22095)", children: /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M7.5 0.75C3.6325 0.75 0.5 3.8825 0.5 7.75C0.5 10.8475 2.50375 13.4637 5.28625 14.3912C5.63625 14.4525 5.7675 14.2425 5.7675 14.0587C5.7675 13.8925 5.75875 13.3412 5.75875 12.755C4 13.0787 3.545 12.3262 3.405 11.9325C3.32625 11.7312 2.985 11.11 2.6875 10.9437C2.4425 10.8125 2.0925 10.4887 2.67875 10.48C3.23 10.4712 3.62375 10.9875 3.755 11.1975C4.385 12.2562 5.39125 11.9587 5.79375 11.775C5.855 11.32 6.03875 11.0137 6.24 10.8387C4.6825 10.6637 3.055 10.06 3.055 7.3825C3.055 6.62125 3.32625 5.99125 3.7725 5.50125C3.7025 5.32625 3.4575 4.60875 3.8425 3.64625C3.8425 3.64625 4.42875 3.4625 5.7675 4.36375C6.3275 4.20625 6.9225 4.1275 7.5175 4.1275C8.1125 4.1275 8.7075 4.20625 9.2675 4.36375C10.6062 3.45375 11.1925 3.64625 11.1925 3.64625C11.5775 4.60875 11.3325 5.32625 11.2625 5.50125C11.7087 5.99125 11.98 6.6125 11.98 7.3825C11.98 10.0687 10.3438 10.6637 8.78625 10.8387C9.04 11.0575 9.25875 11.4775 9.25875 12.1337C9.25875 13.07 9.25 13.8225 9.25 14.0587C9.25 14.2425 9.38125 14.4612 9.73125 14.3912C11.1209 13.9221 12.3284 13.029 13.1839 11.8377C14.0393 10.6463 14.4996 9.21668 14.5 7.75C14.5 3.8825 11.3675 0.75 7.5 0.75Z",
      fill: "currentColor"
    }
  ) }),
  /* @__PURE__ */ jsxRuntime.jsx("defs", { children: /* @__PURE__ */ jsxRuntime.jsx("clipPath", { id: "clip0_21999_22095", children: /* @__PURE__ */ jsxRuntime.jsx("rect", { width: "14", height: "14", fill: "currentColor", transform: "translate(0.5 0.75)" }) }) })
] });

const GoogleIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsxs("g", { clipPath: "url(#clip0_21999_20513)", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        d: "M13.5037 7.54867C13.5037 7.1144 13.4648 6.69683 13.3924 6.29596H7.62436V8.66776H10.9204C10.7756 9.43052 10.3413 10.0764 9.68994 10.5106V12.0529H11.6776C12.8356 10.9839 13.5037 9.41382 13.5037 7.54867Z",
        fill: "white"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        d: "M7.62415 13.5339C9.27773 13.5339 10.6643 12.9882 11.6776 12.0529L9.68994 10.5106C9.14431 10.8781 8.44816 11.1009 7.62415 11.1009C6.03182 11.1009 4.67889 10.0263 4.19451 8.57877H2.15677V10.16C3.1645 12.1587 5.23008 13.5339 7.62415 13.5339Z",
        fill: "white"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        d: "M4.19472 8.57315C4.07223 8.20569 3.99985 7.81595 3.99985 7.40952C3.99985 7.00308 4.07223 6.61335 4.19472 6.24589V4.66469H2.15698C1.73941 5.4887 1.5 6.41849 1.5 7.40952C1.5 8.40055 1.73941 9.33034 2.15698 10.1543L3.74374 8.91834L4.19472 8.57315Z",
        fill: "white"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        d: "M7.62415 3.72376C8.5261 3.72376 9.32783 4.03555 9.96811 4.63685L11.7219 2.88306C10.6585 1.89202 9.27773 1.28516 7.62415 1.28516C5.23008 1.28516 3.16471 2.66036 2.15698 4.66469L4.19472 6.24589C4.6791 4.79832 6.03182 3.72376 7.62415 3.72376Z",
        fill: "white"
      }
    )
  ] }),
  /* @__PURE__ */ jsxRuntime.jsx("defs", { children: /* @__PURE__ */ jsxRuntime.jsx("clipPath", { id: "clip0_21999_20513", children: /* @__PURE__ */ jsxRuntime.jsx("rect", { width: "12.2487", height: "12.2487", fill: "white", transform: "translate(1.375 1.28516)" }) }) })
] });

const RepoIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "21", height: "21", viewBox: "0 0 21 21", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M6.15562 2.79004C4.56136 2.78745 3.26758 4.07913 3.26758 5.6734V13.8135C3.26758 15.4058 4.55831 16.6967 6.15062 16.6968L6.16797 16.6968V14.8218L6.15082 14.8218C5.59397 14.8218 5.14258 14.3703 5.14258 13.8135V13.4325C5.14258 12.8756 5.59415 12.4241 6.15112 12.4242L15.0001 12.4258L15.0056 14.8228L12.6035 14.8226V16.6976L16.8849 16.698L16.8713 10.7717V2.80745L6.15562 2.79004ZM14.9963 10.5508V4.67941L6.15257 4.66504C5.59503 4.66413 5.14258 5.11586 5.14258 5.6734V10.7304C5.4566 10.6132 5.79655 10.5491 6.15147 10.5492L14.9963 10.5508Z",
      fill: "#939393"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M7.55469 13.6982H11.2655V18.6897L9.41007 17.1997L7.55469 18.6897V13.6982Z", fill: "#939393" })
] });

const HomeIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "13", height: "14", viewBox: "0 0 13 14", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M3.84766 10.1444H9.11328", stroke: "currentColor", strokeWidth: "1.33333", strokeLinecap: "round" }),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M11.1395 12.9536L1.82388 12.9535C1.4557 12.9535 1.15723 12.655 1.15723 12.2868V5.69147C1.15723 5.49041 1.24796 5.30009 1.40417 5.17351L6.07746 1.38658C6.32202 1.18841 6.67185 1.18829 6.91654 1.38629L11.5589 5.14286C11.7153 5.26944 11.8062 5.45989 11.8062 5.66111V12.287C11.8062 12.6552 11.5077 12.9536 11.1395 12.9536Z",
      stroke: "currentColor",
      strokeWidth: "1.33333",
      strokeLinecap: "round"
    }
  )
] });

const InfoIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M7.07303 7.39921C6.65882 7.39921 6.32303 7.735 6.32303 8.14921C6.32303 8.56343 6.65882 8.89921 7.07303 8.89921H7.75V10.6187C7.75 11.0329 8.08579 11.3687 8.5 11.3687C8.91421 11.3687 9.25 11.0329 9.25 10.6187V8.14921C9.25 7.735 8.91421 7.39921 8.5 7.39921H7.07303Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M8.50309 4.72995C7.9971 4.72995 7.58691 5.14014 7.58691 5.64613C7.58691 6.15212 7.9971 6.56231 8.50309 6.56231C9.00908 6.56231 9.41927 6.15212 9.41927 5.64613C9.41927 5.14014 9.00908 4.72995 8.50309 4.72995Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M8.5 1.75293C5.04984 1.75293 2.25293 4.54984 2.25293 8C2.25293 11.4502 5.04984 14.2471 8.5 14.2471C11.9502 14.2471 14.7471 11.4502 14.7471 8C14.7471 4.54984 11.9502 1.75293 8.5 1.75293ZM3.75293 8C3.75293 5.37827 5.87827 3.25293 8.5 3.25293C11.1218 3.25293 13.2471 5.37826 13.2471 8C13.2471 10.6218 11.1218 12.7471 8.5 12.7471C5.87826 12.7471 3.75293 10.6218 3.75293 8Z",
      fill: "currentColor"
    }
  )
] });

const JudgeIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M4.31445 3.16083C3.78402 3.16083 3.27531 3.37154 2.90024 3.74661C2.52517 4.12169 2.31445 4.63039 2.31445 5.16083V5.66083C2.31445 6.19126 2.52517 6.69997 2.90024 7.07504C3.27531 7.45011 3.78402 7.66083 4.31445 7.66083C4.84489 7.66083 5.35359 7.45011 5.72867 7.07504C6.10374 6.69997 6.31445 6.19126 6.31445 5.66083V5.16083C6.31445 4.63039 6.10374 4.12169 5.72867 3.74661C5.35359 3.37154 4.84489 3.16083 4.31445 3.16083Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M6.76666 9.50235C6.57678 9.28532 6.30244 9.16083 6.01407 9.16083H4.50201C4.10791 9.16078 3.71766 9.23838 3.35356 9.38921C3.11733 9.48706 2.8951 9.6145 2.69205 9.76806C2.48056 9.928 2.38001 10.1888 2.38001 10.454V13.0642C2.38001 13.6165 2.82773 14.0642 3.38001 14.0642H8.55436C9.4135 14.0642 9.87269 13.0523 9.30695 12.4057L6.76666 9.50235Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "7.92188", y: "6.46759", width: "1.41089", height: "1.56773", rx: "0.705445", fill: "currentColor" }),
  /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "10.4258", y: "4.35107", width: "1.41089", height: "3.72998", rx: "0.705445", fill: "currentColor" }),
  /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "12.9287", y: "2.23419", width: "1.41089", height: "5.75781", rx: "0.705445", fill: "currentColor" })
] });

const LogsIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M3.46094 8.01825L13.6348 8.01825", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M3.46094 3.49384L13.6348 3.49384", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M3.46094 12.5427L13.6348 12.5427", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
] });

const MemoryIcon = (props) => /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: /* @__PURE__ */ jsxRuntime.jsx(
  "path",
  {
    d: "M3.8674 9.19968L4.14554 10.8649C4.23965 11.4283 4.75254 11.8237 5.32137 11.7713L5.58252 11.7472C6.56555 11.6567 7.43309 12.3868 7.51181 13.3708L7.59308 14.3867C7.60422 14.5259 7.71868 14.6342 7.85825 14.6376L9.91053 14.6876C10.1066 14.6924 10.2434 14.4948 10.17 14.3129L8.90452 11.1782C8.80956 10.9429 8.65085 10.7389 8.44626 10.5889L7.90134 10.1895C7.70604 10.0464 7.55223 9.85411 7.45759 9.63124C7.15011 8.90712 6.6579 7.71234 6.37054 6.88944C6.19204 6.3783 5.79931 6.29158 5.45492 6.21553C4.98179 6.11106 4.5999 6.02673 4.99001 4.88985C5.66408 2.92541 8.06015 2.07904 10.6601 3.33088C12.6488 4.2884 13.1187 6.35416 13.0328 7.58237C13.0297 7.62768 13.0214 7.67186 13.0094 7.71566C12.8829 8.17534 12.368 8.40491 11.9415 8.19169L10.3022 7.37201C10.2069 7.32439 10.0927 7.33657 10.0096 7.40322L8.64809 8.49559C8.55405 8.57104 8.52072 8.69931 8.56615 8.811L10.8995 14.5478C10.9404 14.6483 11.0369 14.715 11.1454 14.7177L12.0572 14.7399C12.2581 14.7448 12.3951 14.5382 12.3124 14.3551L11.8681 13.3706C11.4211 12.3803 11.6047 11.2192 12.3354 10.4151L13.4616 9.17575C13.7473 8.86125 13.9224 8.46187 13.9599 8.03858L13.9763 7.85359C14.2866 4.35298 11.377 1.41272 7.87336 1.68639C6.03919 1.82965 4.45399 3.02228 3.80807 4.74492L3.70275 5.02579C3.5828 5.34571 3.62741 5.70411 3.82213 5.98485L3.88946 6.08192C4.12183 6.41695 4.0958 6.86726 3.82637 7.17328L3.06705 8.03572C2.96261 8.15435 2.98058 8.33664 3.10617 8.43259L3.66059 8.85617C3.77064 8.94026 3.84458 9.06307 3.8674 9.19968Z",
    fill: "currentColor"
  }
) });

const OpenAIIcon = (props) => /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "12", height: "13", viewBox: "0 0 12 13", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: /* @__PURE__ */ jsxRuntime.jsx(
  "path",
  {
    d: "M10.1266 5.67745C10.3409 5.0225 10.2695 4.2961 9.92413 3.70069C9.40017 2.78376 8.34034 2.31934 7.30433 2.53369C6.85182 2.02164 6.18496 1.73584 5.49428 1.73584C4.43445 1.73584 3.50561 2.41461 3.17218 3.4149C2.49342 3.55779 1.90992 3.97458 1.56458 4.5819C1.04062 5.49883 1.1597 6.64202 1.86228 7.42796C1.64793 8.09482 1.73129 8.80931 2.07663 9.40472C2.60059 10.3217 3.66042 10.798 4.69643 10.5717C5.16085 11.0838 5.8158 11.3815 6.50648 11.3815C7.56631 11.3815 8.49515 10.7027 8.82858 9.70243C9.50735 9.55953 10.0908 9.14274 10.4362 8.53542C10.9601 7.61849 10.8411 6.46339 10.1266 5.67745ZM6.50648 10.7503C6.07778 10.7503 5.67291 10.6074 5.35138 10.3336C5.36329 10.3217 5.39902 10.3097 5.41093 10.2978L7.32815 9.19037C7.42341 9.13083 7.48295 9.03557 7.48295 8.91648V6.21332L8.29271 6.67774C8.30462 6.67774 8.30462 6.68965 8.30462 6.70156V8.9403C8.31653 9.94059 7.50677 10.7503 6.50648 10.7503ZM2.62441 9.09511C2.41006 8.72595 2.33861 8.29726 2.41006 7.88047C2.42197 7.89238 2.44578 7.90429 2.4696 7.91619L4.38682 9.02366C4.48209 9.0832 4.60117 9.0832 4.69643 9.02366L7.04235 7.66612V8.60687C7.04235 8.61878 7.04235 8.63069 7.03044 8.63069L5.0894 9.75006C4.23201 10.2502 3.12455 9.9525 2.62441 9.09511ZM2.12426 4.90342C2.33861 4.53427 2.67204 4.26038 3.06501 4.10557V6.39195C3.06501 6.49912 3.12455 6.60629 3.21982 6.66583L5.56573 8.02337L4.75597 8.48779C4.74407 8.48779 4.73216 8.4997 4.73216 8.48779L2.79112 7.36842C1.90992 6.86827 1.62412 5.76081 2.12426 4.90342ZM8.79285 6.45149L6.44694 5.09395L7.2567 4.62953C7.2686 4.62953 7.28051 4.61762 7.28051 4.62953L9.22155 5.7489C10.0908 6.24905 10.3766 7.35651 9.8765 8.2139C9.66215 8.58305 9.32872 8.85694 8.93575 8.99984V6.72538C8.94766 6.6182 8.88812 6.51103 8.79285 6.45149ZM9.5907 5.23685C9.5788 5.22494 9.55498 5.21303 9.53116 5.20113L7.61394 4.09366C7.51868 4.03412 7.39959 4.03412 7.30433 4.09366L4.95841 5.4512V4.51045C4.95841 4.49854 4.95841 4.48663 4.97032 4.48663L6.91136 3.36726C7.78066 2.86712 8.87621 3.16482 9.37636 4.03412C9.5907 4.39137 9.66215 4.82006 9.5907 5.23685ZM4.51781 6.904L3.70805 6.43958C3.69615 6.43958 3.69615 6.42767 3.69615 6.41576V4.17702C3.69615 3.17673 4.5059 2.36697 5.50619 2.36697C5.93489 2.36697 6.33977 2.50987 6.66129 2.78376C6.64938 2.79567 6.62556 2.80758 6.60175 2.81949L4.68453 3.92695C4.58926 3.98649 4.52972 4.08176 4.52972 4.20084V6.904H4.51781ZM4.95841 5.95134L6.00634 5.34402L7.05426 5.95134V7.15407L6.00634 7.76139L4.95841 7.15407V5.95134Z",
    fill: "currentColor"
  }
) });

const PromptIcon = (props) => /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: /* @__PURE__ */ jsxRuntime.jsx(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M8.8341 11.2099H12.4915C13.598 11.2099 14.5 10.3156 14.5 9.21251V4.20729C14.5 3.10576 13.6007 2.2099 12.4915 2.2099H4.50853C3.40195 2.2099 2.5 3.10416 2.5 4.20729V9.21251C2.5 10.3112 3.39464 11.2053 4.5 11.2099V13.2005C4.5 13.7665 4.87069 13.9533 5.32796 13.6368L8.8341 11.2099Z",
    fill: "currentColor"
  }
) });

const ScoreIcon = (props) => /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: /* @__PURE__ */ jsxRuntime.jsx(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M3 12V11C3 10.6022 3.15804 10.2206 3.43934 9.93934C3.72064 9.65804 4.10218 9.5 4.5 9.5C4.89782 9.5 5.27936 9.65804 5.56066 9.93934C5.84196 10.2206 6 10.6022 6 11V12C6 12.3978 5.84196 12.7794 5.56066 13.0607C5.27936 13.342 4.89782 13.5 4.5 13.5C4.10218 13.5 3.72064 13.342 3.43934 13.0607C3.15804 12.7794 3 12.3978 3 12ZM7 12V8.5C7 8.10218 7.15804 7.72064 7.43934 7.43934C7.72064 7.15804 8.10218 7 8.5 7C8.89782 7 9.27936 7.15804 9.56066 7.43934C9.84196 7.72064 10 8.10218 10 8.5V12C10 12.3978 9.84196 12.7794 9.56066 13.0607C9.27936 13.342 8.89782 13.5 8.5 13.5C8.10218 13.5 7.72064 13.342 7.43934 13.0607C7.15804 12.7794 7 12.3978 7 12ZM11 12V4C11 3.60218 11.158 3.22064 11.4393 2.93934C11.7206 2.65804 12.1022 2.5 12.5 2.5C12.8978 2.5 13.2794 2.65804 13.5607 2.93934C13.842 3.22064 14 3.60218 14 4V12C14 12.3978 13.842 12.7794 13.5607 13.0607C13.2794 13.342 12.8978 13.5 12.5 13.5C12.1022 13.5 11.7206 13.342 11.4393 13.0607C11.158 12.7794 11 12.3978 11 12Z",
    fill: "currentColor"
  }
) });

const SettingsIcon = (props) => /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "17", height: "18", viewBox: "0 0 17 18", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: /* @__PURE__ */ jsxRuntime.jsx(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M8.40864 11.9983C7.58064 11.9733 6.84164 11.6153 6.31564 11.0563C6.31464 11.0563 6.31464 11.0553 6.31464 11.0553C5.78864 10.4963 5.47564 9.73633 5.50064 8.90833C5.52564 8.08033 5.88464 7.34133 6.44364 6.81533C7.00264 6.28833 7.76264 5.97633 8.59064 6.00133C9.41864 6.02633 10.1576 6.38433 10.6836 6.94333H10.6846C11.2106 7.50333 11.5236 8.26233 11.4986 9.09033C11.4726 9.91833 11.1146 10.6583 10.5556 11.1843C9.99664 11.7103 9.23664 12.0233 8.40864 11.9983ZM16.1266 8.15033L14.3606 7.74033C14.2316 7.14133 14.0146 6.57633 13.7216 6.05733L14.7726 4.57933C14.9116 4.38533 14.8926 4.12033 14.7296 3.94633L13.9206 3.08733C13.7576 2.91333 13.4946 2.87933 13.2916 3.00533L11.7526 3.96533C11.2526 3.64133 10.7016 3.39033 10.1116 3.22633L9.80964 1.43833C9.76964 1.20333 9.56964 1.02833 9.33164 1.02133L8.15264 0.985326C7.91364 0.978326 7.70364 1.14033 7.64964 1.37233L7.24064 3.13933C6.64164 3.26733 6.07664 3.48433 5.55664 3.77733L4.07864 2.72633C3.88464 2.58833 3.61964 2.60633 3.44664 2.76933L2.58664 3.57833C2.41364 3.74133 2.37964 4.00533 2.50564 4.20733L3.46564 5.74633C3.14164 6.24633 2.89064 6.79833 2.72564 7.38833L0.937635 7.68933C0.702635 7.72933 0.528635 7.92933 0.520635 8.16733L0.485635 9.34733C0.477635 9.58533 0.639635 9.79533 0.872635 9.84933L2.63864 10.2583C2.76764 10.8573 2.98464 11.4233 3.27764 11.9423L2.22564 13.4203C2.08764 13.6143 2.10564 13.8793 2.26964 14.0523L3.07864 14.9123C3.24164 15.0853 3.50464 15.1203 3.70664 14.9933L5.24564 14.0333C5.74663 14.3583 6.29764 14.6093 6.88764 14.7733L7.18964 16.5613C7.22864 16.7963 7.42864 16.9713 7.66764 16.9783L8.84663 17.0143C9.08564 17.0213 9.29564 16.8593 9.34964 16.6273L9.75864 14.8603C10.3576 14.7323 10.9226 14.5153 11.4416 14.2213L12.9206 15.2733C13.1146 15.4113 13.3786 15.3933 13.5526 15.2293L14.4116 14.4213C14.5856 14.2573 14.6196 13.9943 14.4936 13.7923L13.5336 12.2533C13.8576 11.7523 14.1086 11.2013 14.2726 10.6113L16.0616 10.3103C16.2966 10.2703 16.4706 10.0703 16.4776 9.83233L16.5136 8.65233C16.5206 8.41433 16.3586 8.20433 16.1266 8.15033Z",
    fill: "currentColor"
  }
) });

const SlashIcon = (props) => /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M5.25684 12.6387L10.4003 3.36133H11.7432L6.5997 12.6387H5.25684Z", fill: "currentColor" }) });

const ToolsIcon = (props) => /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: /* @__PURE__ */ jsxRuntime.jsx(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M7.5605 1.42351C8.0791 0.904904 8.92215 0.906157 9.4395 1.42351L10.6922 2.67617C11.2108 3.19477 11.2095 4.03782 10.6922 4.55517L9.4395 5.80783C8.9209 6.32643 8.07785 6.32518 7.5605 5.80783L6.30784 4.55517C5.78923 4.03656 5.79049 3.19352 6.30784 2.67617L7.5605 1.42351ZM3.17618 5.80783C3.69478 5.28923 4.53782 5.29048 5.05517 5.80783L6.30784 7.0605C6.82644 7.5791 6.82519 8.42214 6.30784 8.93949L5.05517 10.1922C4.53657 10.7108 3.69353 10.7095 3.17618 10.1922L1.92351 8.93949C1.40491 8.42089 1.40616 7.57785 1.92351 7.0605L3.17618 5.80783ZM11.9448 5.80783C12.4634 5.28923 13.3065 5.29048 13.8238 5.80783L15.0765 7.0605C15.5951 7.5791 15.5938 8.42214 15.0765 8.93949L13.8238 10.1922C13.3052 10.7108 12.4622 10.7095 11.9448 10.1922L10.6922 8.93949C10.1736 8.42089 10.1748 7.57785 10.6922 7.0605L11.9448 5.80783ZM7.5605 10.1922C8.0791 9.67355 8.92215 9.67481 9.4395 10.1922L10.6922 11.4448C11.2108 11.9634 11.2095 12.8065 10.6922 13.3238L9.4395 14.5765C8.9209 15.0951 8.07785 15.0938 7.5605 14.5765L6.30784 13.3238C5.78923 12.8052 5.79049 11.9622 6.30784 11.4448L7.5605 10.1922Z",
    fill: "currentColor"
  }
) });

const TraceIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M3.0498 3.17139V7.95137M6.91346 12.8737L4.04984 12.8738C3.49754 12.8738 3.0498 12.4261 3.0498 11.8738V7.95137M3.0498 7.95137L6.85968 7.95125",
      stroke: "currentColor",
      strokeLinecap: "round"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M6.59668 3.12631L13.9507 3.12631", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M10.293 7.95099L13.8072 7.95099", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M10.293 12.8025L13.8072 12.8025", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
] });

const TsIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "2.74902", y: "1.89307", width: "11.8252", height: "11.8252", rx: "1.5", stroke: "currentColor" }),
  /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M5.64062 7.98265V7.29806H8.86605V7.98265H7.66371V11.2253H6.84297V7.98265H5.64062Z", fill: "currentColor" }),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M11.5277 8.42754C11.5124 8.27285 11.4465 8.15268 11.3302 8.06703C11.2138 7.98137 11.056 7.93855 10.8565 7.93855C10.721 7.93855 10.6066 7.95772 10.5133 7.99607C10.42 8.03315 10.3484 8.08492 10.2985 8.1514C10.2499 8.21788 10.2256 8.2933 10.2256 8.37768C10.2231 8.44799 10.2378 8.50936 10.2697 8.56177C10.303 8.61418 10.3484 8.65957 10.4059 8.69792C10.4634 8.73499 10.5299 8.76759 10.6053 8.79572C10.6808 8.82257 10.7613 8.84558 10.8469 8.86475L11.1998 8.94913C11.3711 8.98748 11.5283 9.03862 11.6715 9.10254C11.8147 9.16646 11.9387 9.24508 12.0435 9.3384C12.1484 9.43173 12.2295 9.54167 12.2871 9.66823C12.3459 9.7948 12.3759 9.9399 12.3772 10.1035C12.3759 10.3439 12.3146 10.5523 12.1931 10.7287C12.0729 10.9038 11.8991 11.04 11.6715 11.1371C11.4452 11.233 11.1723 11.2809 10.8527 11.2809C10.5357 11.2809 10.2595 11.2324 10.0243 11.1352C9.79034 11.038 9.60753 10.8942 9.47585 10.7037C9.34545 10.512 9.27706 10.2748 9.27067 9.99231H10.0741C10.0831 10.124 10.1208 10.2339 10.1873 10.3221C10.255 10.4091 10.3452 10.4749 10.4577 10.5197C10.5714 10.5631 10.6999 10.5849 10.8431 10.5849C10.9837 10.5849 11.1058 10.5644 11.2094 10.5235C11.3142 10.4826 11.3954 10.4257 11.4529 10.3528C11.5104 10.28 11.5392 10.1962 11.5392 10.1016C11.5392 10.0134 11.513 9.93926 11.4606 9.87917C11.4094 9.81909 11.334 9.76795 11.2343 9.72576C11.1359 9.68357 11.0151 9.64522 10.8719 9.6107L10.4442 9.50332C10.1131 9.42278 9.8517 9.29686 9.65994 9.12555C9.46818 8.95424 9.37294 8.72349 9.37422 8.43329C9.37294 8.19551 9.43622 7.98776 9.56406 7.81007C9.69318 7.63237 9.87024 7.49366 10.0952 7.39394C10.3202 7.29423 10.5759 7.24437 10.8623 7.24437C11.1538 7.24437 11.4082 7.29423 11.6255 7.39394C11.8441 7.49366 12.0141 7.63237 12.1356 7.81007C12.257 7.98776 12.3197 8.19359 12.3235 8.42754H11.5277Z",
      fill: "currentColor"
    }
  )
] });

const VariablesIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M15.4997 7.97482V8.6501C15.0469 8.6501 14.7307 8.75585 14.5512 8.96735C14.3717 9.17885 14.2819 9.52631 14.2819 10.0097V11.315C14.2819 11.7773 14.235 12.1655 14.1413 12.4797C14.0502 12.797 13.9095 13.0508 13.7193 13.2411C13.529 13.4315 13.2879 13.5689 12.9958 13.6535C12.7038 13.7381 12.3594 13.7804 11.9629 13.7804V12.7063C12.2737 12.7063 12.5162 12.6535 12.6904 12.5477C12.8645 12.445 12.9851 12.2848 13.0521 12.0673C13.1217 11.8528 13.1566 11.5794 13.1566 11.247V9.59731C13.1566 9.36467 13.1874 9.15015 13.249 8.95376C13.3106 8.75434 13.4245 8.58212 13.5906 8.4371C13.7568 8.28905 13.9939 8.17575 14.302 8.09719C14.6102 8.01561 15.0094 7.97482 15.4997 7.97482ZM11.9629 2.21906C12.3594 2.21906 12.7038 2.26135 12.9958 2.34595C13.2879 2.43055 13.529 2.56803 13.7193 2.75837C13.9095 2.94872 14.0502 3.20252 14.1413 3.51977C14.235 3.83399 14.2819 4.22224 14.2819 4.68452V5.98523C14.2819 6.47168 14.3717 6.82065 14.5512 7.03214C14.7307 7.24062 15.0469 7.34486 15.4997 7.34486V8.02467C15.0094 8.02467 14.6102 7.98389 14.302 7.90231C13.9939 7.82073 13.7568 7.70743 13.5906 7.5624C13.4245 7.41737 13.3106 7.24666 13.249 7.05027C13.1874 6.85086 13.1566 6.63483 13.1566 6.40218V4.7525C13.1566 4.41712 13.1217 4.14218 13.0521 3.92766C12.9851 3.71012 12.8645 3.54998 12.6904 3.44725C12.5162 3.34453 12.2737 3.29316 11.9629 3.29316V2.21906ZM15.4997 7.34486V8.6501H14.3864V7.34486H15.4997Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M7.14024 4.97928L8.50273 7.33122L9.87728 4.97928H11.1915L9.26637 7.99983L11.2076 11.0204H9.89335L8.50273 8.76283L7.11613 11.0204H5.79785L7.719 7.99983L5.82197 4.97928H7.14024Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M1.5 8.02467V7.34486C1.95282 7.34486 2.269 7.24062 2.44852 7.03214C2.62804 6.82065 2.7178 6.47168 2.7178 5.98523V4.68452C2.7178 4.22224 2.76335 3.83399 2.85445 3.51977C2.94823 3.20252 3.09024 2.94872 3.28048 2.75837C3.47072 2.56803 3.71187 2.43055 4.00392 2.34595C4.29598 2.26135 4.64029 2.21906 5.03684 2.21906V3.29316C4.72603 3.29316 4.48354 3.34453 4.30938 3.44725C4.13522 3.54998 4.0133 3.71012 3.94364 3.92766C3.87665 4.14218 3.84316 4.41712 3.84316 4.7525V6.40218C3.84316 6.63483 3.81234 6.85086 3.75072 7.05027C3.68909 7.24666 3.57522 7.41737 3.40909 7.5624C3.24297 7.70743 3.00584 7.82073 2.6977 7.90231C2.38957 7.98389 1.99033 8.02467 1.5 8.02467ZM5.03684 13.7804C4.64029 13.7804 4.29598 13.7381 4.00392 13.6535C3.71187 13.5689 3.47072 13.4315 3.28048 13.2411C3.09024 13.0508 2.94823 12.797 2.85445 12.4797C2.76335 12.1655 2.7178 11.7773 2.7178 11.315V10.0097C2.7178 9.52631 2.62804 9.17885 2.44852 8.96735C2.269 8.75585 1.95282 8.6501 1.5 8.6501V7.97482C1.99033 7.97482 2.38957 8.01561 2.6977 8.09719C3.00584 8.17575 3.24297 8.28905 3.40909 8.4371C3.57522 8.58212 3.68909 8.75434 3.75072 8.95376C3.81234 9.15015 3.84316 9.36467 3.84316 9.59731V11.247C3.84316 11.5794 3.87665 11.8528 3.94364 12.0673C4.0133 12.2848 4.13522 12.445 4.30938 12.5477C4.48354 12.6535 4.72603 12.7063 5.03684 12.7063V13.7804ZM1.5 8.6501V7.34486H2.6133V8.6501H1.5Z",
      fill: "currentColor"
    }
  )
] });

const WorkflowIcon = (props) => /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "17", height: "16", viewBox: "0 0 17 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: /* @__PURE__ */ jsxRuntime.jsx(
  "path",
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M6.24388 2.4018C6.24388 2.0394 6.53767 1.74561 6.90008 1.74561H10.0991C10.4614 1.74561 10.7553 2.0394 10.7553 2.4018V4.57546C10.7553 4.93787 10.4614 5.23166 10.0991 5.23166H9.31982V7.35469L10.0033 9.22664C9.90442 9.20146 9.80035 9.1761 9.6915 9.14986L9.62652 9.13422C9.30473 9.05687 8.92256 8.96501 8.61993 8.84491C8.5819 8.82981 8.54147 8.81292 8.49957 8.79391C8.45767 8.81292 8.41724 8.82981 8.3792 8.84491C8.07657 8.96501 7.6944 9.05687 7.37261 9.13422L7.30763 9.14986C7.19879 9.1761 7.09471 9.20146 6.99577 9.22664L7.67932 7.35469V5.23166H6.90008C6.53767 5.23166 6.24388 4.93787 6.24388 4.57546V2.4018ZM6.99577 9.22664C6.99577 9.22664 6.99578 9.22664 6.99577 9.22664L6.43283 10.7683H6.81806C7.18047 10.7683 7.47426 11.0622 7.47426 11.4245V13.5982C7.47426 13.9606 7.18047 14.2544 6.81806 14.2544H3.61909C3.25668 14.2544 2.96289 13.9606 2.96289 13.5982V11.4245C2.96289 11.0622 3.25668 10.7683 3.61909 10.7683H4.26617C4.2921 10.4663 4.32783 10.1494 4.37744 9.85171C4.43762 9.49063 4.52982 9.08135 4.68998 8.76102C4.93975 8.2615 5.44743 8.01751 5.7771 7.88788C6.14684 7.74249 6.57537 7.63889 6.92317 7.55505C7.24707 7.47696 7.49576 7.41679 7.67932 7.35469L6.99577 9.22664ZM6.43283 10.7683L6.99577 9.22664C6.75846 9.28705 6.55067 9.34646 6.37745 9.41458C6.22784 9.47341 6.1623 9.51712 6.14023 9.53254C6.09752 9.63631 6.04409 9.83055 5.99562 10.1214C5.96201 10.3231 5.93498 10.5439 5.91341 10.7683H6.43283ZM10.0033 9.22664L9.31982 7.35469C9.50338 7.41679 9.75206 7.47696 10.076 7.55505C10.4238 7.63889 10.8523 7.74249 11.2221 7.88788C11.5517 8.01751 12.0594 8.2615 12.3091 8.76102C12.4693 9.08135 12.5615 9.49063 12.6217 9.85171C12.6713 10.1494 12.707 10.4663 12.733 10.7683H13.38C13.7424 10.7683 14.0362 11.0622 14.0362 11.4245V13.5982C14.0362 13.9606 13.7424 14.2544 13.38 14.2544H10.1811C9.81867 14.2544 9.52488 13.9606 9.52488 13.5982V11.4245C9.52488 11.0622 9.81867 10.7683 10.1811 10.7683H10.5663L10.0033 9.22664ZM10.0033 9.22664L10.5663 10.7683H11.0857C11.0642 10.5439 11.0372 10.3231 11.0035 10.1214C10.9551 9.83055 10.9016 9.63631 10.8589 9.53254C10.8369 9.51712 10.7713 9.47341 10.6217 9.41458C10.4485 9.34646 10.2407 9.28705 10.0033 9.22664Z",
    fill: "currentColor"
  }
) });

const WorkflowCoinIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "126", height: "85", viewBox: "0 0 126 85", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M119.322 35.1636C119.322 50.3595 94.1055 62.6782 62.9998 62.6782C31.894 62.6782 6.67773 50.3595 6.67773 35.1636V49.8363C6.67773 65.0322 31.894 77.351 62.9998 77.351C94.1055 77.351 119.322 65.0322 119.322 49.8363V35.1636Z",
      fill: "#2E2E2E",
      fillOpacity: "0.9"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M119.322 35.1636C119.322 50.3595 94.1055 62.6782 62.9998 62.6782C31.894 62.6782 6.67773 50.3595 6.67773 35.1636M119.322 35.1636C119.322 19.9677 94.1055 7.64893 62.9998 7.64893C31.894 7.64893 6.67773 19.9677 6.67773 35.1636M119.322 35.1636V49.8363C119.322 65.0322 94.1055 77.351 62.9998 77.351C31.894 77.351 6.67773 65.0322 6.67773 49.8363V35.1636",
      stroke: "#424242"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M63.0002 0.968262C28.5152 0.968262 0.55957 15.6484 0.55957 33.7573V51.2428C0.55957 69.3517 28.5152 84.0319 63.0002 84.0319C97.4853 84.0319 125.441 69.3517 125.441 51.2428V33.7573C125.441 15.6484 97.4853 0.968262 63.0002 0.968262Z",
      stroke: "#707070"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M74.9374 21.357C76.2127 20.7291 78.2804 20.7291 79.5557 21.357L90.8129 26.8997C92.0882 27.5276 92.0882 28.5458 90.8129 29.1737L83.1638 32.9399C81.8885 33.5678 79.8207 33.5678 78.5454 32.9399L75.8033 31.5898L68.3324 35.2682L64.1502 39.696C63.8908 39.481 63.6138 39.2568 63.3231 39.0227L63.1495 38.883C62.2893 38.1914 61.2677 37.3701 60.6254 36.6376C60.5446 36.5456 60.4618 36.4463 60.3812 36.3407C60.1669 36.3011 59.9652 36.2603 59.7782 36.2205C58.2906 35.9043 56.6225 35.4013 55.2179 34.9777L54.9342 34.8922C54.4589 34.7491 54.0034 34.6127 53.5666 34.4849L62.5594 32.4258L70.0304 28.7473L67.2882 27.3972C66.0129 26.7692 66.0129 25.7512 67.2882 25.1232L74.9374 21.357ZM53.5666 34.4849C53.5666 34.4849 53.5666 34.4849 53.5666 34.4849L46.1603 36.1808L47.516 36.8483C48.7913 37.4762 48.7912 38.4943 47.516 39.1222L39.8668 42.8884C38.5916 43.5163 36.5238 43.5164 35.2485 42.8884L23.9913 37.3457C22.7159 36.7177 22.716 35.6996 23.9913 35.0717L31.6404 31.3055C32.9156 30.6776 34.9834 30.6776 36.2587 31.3055L38.5358 32.4267C39.6899 31.9483 40.9309 31.4611 42.153 31.0313C43.6354 30.5099 45.4001 29.9605 47.091 29.683C49.7278 29.2502 52.3729 29.7072 53.9892 30.0537C55.8019 30.4425 57.6745 31.0055 59.1934 31.4628C60.6081 31.8887 61.6949 32.2154 62.5594 32.4258L53.5666 34.4849ZM46.1603 36.1808L53.5666 34.4849C52.5189 34.1784 51.5786 33.9213 50.7293 33.7392C49.9958 33.5819 49.6114 33.5441 49.4794 33.5326C48.964 33.6384 48.0924 33.8823 46.8983 34.3023C46.0703 34.5936 45.1981 34.9293 44.3325 35.2808L46.1603 36.1808ZM64.1502 39.696L68.3324 35.2682C68.7598 35.6939 69.4232 36.229 70.2883 36.9256C71.2171 37.6735 72.3605 38.5954 73.15 39.488C73.8539 40.2838 74.7818 41.5862 73.9029 42.8844C73.3394 43.717 72.2235 44.5859 71.1648 45.3159C70.2916 45.9175 69.3021 46.5286 68.3305 47.0968L70.6077 48.218C71.8829 48.8459 71.8829 49.864 70.6077 50.4919L62.9585 54.2582C61.6833 54.8861 59.6154 54.8861 58.3402 54.2582L47.083 48.7154C45.8077 48.0875 45.8077 47.0694 47.083 46.4415L54.7321 42.6752C56.0074 42.0474 58.0751 42.0473 59.3505 42.6752L60.7062 43.3428L64.1502 39.696ZM64.1502 39.696L60.7062 43.3428L62.5339 44.2427C63.2478 43.8165 63.9298 43.3871 64.5213 42.9794C65.3742 42.3914 65.8695 41.9622 66.0846 41.7085C66.0613 41.6436 65.9844 41.4543 65.6649 41.0931C65.295 40.6749 64.773 40.212 64.1502 39.696Z",
      fill: "#A9A9A9"
    }
  )
] });

const LatencyIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M2.0625 5.99976C2.0625 3.82513 3.82538 2.06226 6 2.06226C6.58712 2.06226 7.14423 2.19076 7.64473 2.42117V1.21042C7.12905 1.03337 6.57575 0.937256 6 0.937256C3.20406 0.937256 0.9375 3.20381 0.9375 5.99976C0.9375 8.7957 3.20406 11.0623 6 11.0623C8.79594 11.0623 11.0625 8.7957 11.0625 5.99976H9.9375C9.9375 8.17438 8.17462 9.93726 6 9.93726C3.82538 9.93726 2.0625 8.17438 2.0625 5.99976Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M9.28577 4.3986C9.08709 4.3986 8.92603 4.23753 8.92603 4.03885V0.978563C8.92603 0.681899 9.16652 0.441406 9.46318 0.441406C9.75985 0.441406 10.0003 0.6819 10.0003 0.978564V3.25858C10.0003 3.33638 10.0634 3.39944 10.1412 3.39944H11.2091C11.485 3.39944 11.7087 3.62311 11.7087 3.89902C11.7087 4.17493 11.485 4.3986 11.2091 4.3986H9.28577Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M6.57568 3.69244C6.57568 3.38178 6.32384 3.12994 6.01318 3.12994C5.70252 3.12994 5.45068 3.38178 5.45068 3.69244V6.22272L6.7242 7.88675C6.91301 8.13346 7.26606 8.18039 7.51276 7.99159C7.75946 7.80278 7.8064 7.44973 7.61759 7.20303L6.57568 5.84162V3.69244Z",
      fill: "currentColor"
    }
  )
] });

const McpServerIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M6.53918 9.32122C6.34324 9.51508 6.02724 9.51338 5.83338 9.31744C5.63952 9.1215 5.6412 8.80551 5.83713 8.61164L10.1958 4.29931C10.7996 3.70186 10.8017 2.72852 10.2041 2.12839L10.1899 2.11428C9.58767 1.52481 8.62251 1.53208 8.0292 2.13052L2.29396 7.91536C2.0999 8.1111 1.78388 8.11246 1.58813 7.9184C1.39239 7.72433 1.39103 7.40831 1.58509 7.21257L7.32036 1.42774C8.30005 0.439581 9.89369 0.427613 10.8881 1.40094L10.9116 1.42425C11.4942 2.00929 11.7316 2.80913 11.6232 3.56922C12.389 3.44866 13.1999 3.67918 13.7961 4.26273C14.804 5.24929 14.8147 6.86824 13.82 7.86808L8.5531 13.1619C8.50045 13.2148 8.50024 13.3002 8.55263 13.3534L9.65448 14.4717C9.84794 14.668 9.8456 14.984 9.64925 15.1775C9.45291 15.3709 9.13691 15.3686 8.94345 15.1723L7.84163 14.054C7.40505 13.6109 7.40677 12.8988 7.8455 12.4579L13.1124 7.16405C13.7161 6.55727 13.7095 5.57478 13.0979 4.97606C12.4925 4.38347 11.4942 4.40725 10.8978 5.00886L6.53918 9.32122Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M8.84622 2.75411C9.04697 2.56188 9.36555 2.56381 9.56395 2.76076C9.76234 2.95771 9.76658 3.27625 9.57582 3.4784L9.56661 3.48794L5.25912 7.82701C4.67023 8.42022 4.672 9.37798 5.26305 9.96904C5.85624 10.5622 6.81818 10.5615 7.41052 9.9675L11.6299 5.73599L11.6395 5.72671C11.8406 5.53493 12.1592 5.53756 12.3572 5.73496C12.5583 5.93548 12.5587 6.26104 12.3582 6.46214L8.13877 10.6937C7.14498 11.6903 5.53105 11.6915 4.53584 10.6963C3.5442 9.70461 3.54127 8.09774 4.52928 7.10248L8.83677 2.76342L8.84622 2.75411Z",
      fill: "currentColor"
    }
  )
] });

const FolderIcon = (props) => /* @__PURE__ */ jsxRuntime.jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: /* @__PURE__ */ jsxRuntime.jsx(
  "path",
  {
    d: "M1.5 8.5V8C1.5 7.60218 1.65804 7.22064 1.93934 6.93934C2.22064 6.65804 2.60218 6.5 3 6.5H13C13.3978 6.5 13.7794 6.65804 14.0607 6.93934C14.342 7.22064 14.5 7.60218 14.5 8V8.5M8.70667 4.20667L7.29333 2.79333C7.20048 2.70037 7.09022 2.62661 6.96886 2.57628C6.84749 2.52595 6.71739 2.50003 6.586 2.5H3C2.60218 2.5 2.22064 2.65804 1.93934 2.93934C1.65804 3.22064 1.5 3.60218 1.5 4V12C1.5 12.3978 1.65804 12.7794 1.93934 13.0607C2.22064 13.342 2.60218 13.5 3 13.5H13C13.3978 13.5 13.7794 13.342 14.0607 13.0607C14.342 12.7794 14.5 12.3978 14.5 12V6C14.5 5.60218 14.342 5.22064 14.0607 4.93934C13.7794 4.65804 13.3978 4.5 13 4.5H9.414C9.14887 4.49977 8.89402 4.39426 8.70667 4.20667Z",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }
) });

const McpCoinIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "126", height: "85", viewBox: "0 0 126 85", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M119.322 35.1641C119.322 50.36 94.1055 62.6787 62.9998 62.6787C31.894 62.6787 6.67773 50.36 6.67773 35.1641V49.8368C6.67773 65.0327 31.894 77.3514 62.9998 77.3514C94.1055 77.3514 119.322 65.0327 119.322 49.8368V35.1641Z",
      fill: "#2E2E2E",
      fillOpacity: "0.9"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M119.322 35.1641C119.322 50.36 94.1055 62.6787 62.9998 62.6787C31.894 62.6787 6.67773 50.36 6.67773 35.1641M119.322 35.1641C119.322 19.9681 94.1055 7.64941 62.9998 7.64941C31.894 7.64941 6.67773 19.9681 6.67773 35.1641M119.322 35.1641V49.8368C119.322 65.0327 94.1055 77.3514 62.9998 77.3514C31.894 77.3514 6.67773 65.0327 6.67773 49.8368V35.1641",
      stroke: "#424242"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M63.0002 0.96875C28.5152 0.96875 0.55957 15.6489 0.55957 33.7578V51.2433C0.55957 69.3522 28.5152 84.0323 63.0002 84.0323C97.4853 84.0323 125.441 69.3522 125.441 51.2433V33.7578C125.441 15.6489 97.4853 0.96875 63.0002 0.96875Z",
      stroke: "#707070"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M51.5215 39.9726C50.5464 40.4477 48.9738 40.4435 48.009 39.9634C47.0442 39.4833 47.0526 38.709 48.0277 38.2339L69.7191 27.6672C72.7243 26.2032 72.7347 23.8181 69.7605 22.3476L69.6898 22.313C66.6927 20.8686 61.8895 20.8864 58.9368 22.3528L30.3946 36.5278C29.4288 37.0074 27.8561 37.0107 26.882 36.5352C25.9078 36.0597 25.901 35.2853 26.8668 34.8057L55.4092 20.6308C60.2847 18.2094 68.2157 18.1801 73.1645 20.5651L73.2814 20.6222C76.1808 22.0558 77.3624 24.0157 76.8227 25.8782C80.6339 25.5828 84.6694 26.1476 87.6364 27.5775C92.6525 29.9949 92.7059 33.962 87.7554 36.4119L61.5441 49.3836C61.282 49.5133 61.281 49.7227 61.5417 49.853L67.0252 52.5932C67.988 53.0743 67.9763 53.8486 66.9992 54.3226C66.0221 54.7966 64.4495 54.7909 63.4867 54.3098L58.0033 51.5695C55.8306 50.4838 55.8392 48.7391 58.0226 47.6585L84.2339 34.6868C87.2382 33.2 87.2058 30.7925 84.1617 29.3254C81.1488 27.8734 76.1811 27.9317 73.2127 29.4058L51.5215 39.9726Z",
      fill: "#A9A9A9"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M63.0028 23.8809C64.0019 23.4098 65.5873 23.4146 66.5747 23.8972C67.562 24.3798 67.5831 25.1603 66.6338 25.6556L66.5879 25.679L45.1511 36.3113C42.2204 37.7649 42.2292 40.1117 45.1707 41.56C48.1228 43.0135 52.91 43.0118 55.8578 41.5563L76.8564 31.1875L76.9037 31.1648C77.9049 30.6949 79.4903 30.7013 80.4755 31.185C81.4763 31.6764 81.4785 32.4741 80.4806 32.9669L59.4821 43.3356C54.5363 45.7777 46.5044 45.7806 41.5516 43.342C36.6166 40.9121 36.602 36.9747 41.519 34.5359L62.9558 23.9037L63.0028 23.8809Z",
      fill: "#A9A9A9"
    }
  )
] });

const ToolCoinIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "126", height: "85", viewBox: "0 0 126 85", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M119.322 35.1641C119.322 50.36 94.1055 62.6787 62.9998 62.6787C31.894 62.6787 6.67773 50.36 6.67773 35.1641V49.8368C6.67773 65.0327 31.894 77.3514 62.9998 77.3514C94.1055 77.3514 119.322 65.0327 119.322 49.8368V35.1641Z",
      fill: "#2E2E2E",
      fillOpacity: "0.9"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M119.322 35.1641C119.322 50.36 94.1055 62.6787 62.9998 62.6787C31.894 62.6787 6.67773 50.36 6.67773 35.1641M119.322 35.1641C119.322 19.9681 94.1055 7.64941 62.9998 7.64941C31.894 7.64941 6.67773 19.9681 6.67773 35.1641M119.322 35.1641V49.8368C119.322 65.0327 94.1055 77.3514 62.9998 77.3514C31.894 77.3514 6.67773 65.0327 6.67773 49.8368V35.1641",
      stroke: "#424242"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M63.0002 0.96875C28.5152 0.96875 0.55957 15.6489 0.55957 33.7578V51.2433C0.55957 69.3522 28.5152 84.0323 63.0002 84.0323C97.4853 84.0323 125.441 69.3522 125.441 51.2433V33.7578C125.441 15.6489 97.4853 0.96875 63.0002 0.96875Z",
      stroke: "#707070"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M95.8997 32.6647C98.4806 33.9355 98.4744 36.0012 95.8997 37.2689L89.6657 40.3384C87.0848 41.6091 82.8892 41.6061 80.3146 40.3384L74.0805 37.2689C71.4996 35.9981 71.5059 33.9324 74.0805 32.6647L80.3146 29.5952C82.8955 28.3244 87.091 28.3275 89.6657 29.5952L95.8997 32.6647ZM74.0805 21.9215C76.6614 23.1923 76.6552 25.258 74.0805 26.5257L67.8465 29.5952C65.2656 30.866 61.0701 30.8629 58.4954 29.5952L52.2613 26.5257C49.6804 25.255 49.6867 23.1892 52.2613 21.9215L58.4954 18.852C61.0763 17.5813 65.2718 17.5843 67.8465 18.852L74.0805 21.9215ZM74.0805 43.4079C76.6614 44.6786 76.6552 46.7444 74.0805 48.0121L67.8465 51.0816C65.2656 52.3523 61.0701 52.3493 58.4954 51.0816L52.2613 48.0121C49.6804 46.7413 49.6867 44.6756 52.2613 43.4079L58.4954 40.3384C61.0763 39.0676 65.2718 39.0707 67.8465 40.3384L74.0805 43.4079ZM52.2613 32.6647C54.8422 33.9355 54.836 36.0012 52.2613 37.2689L46.0273 40.3384C43.4464 41.6091 39.2509 41.6061 36.6762 40.3384L30.4422 37.2689C27.8613 35.9981 27.8675 33.9324 30.4422 32.6647L36.6762 29.5952C39.2571 28.3244 43.4526 28.3275 46.0273 29.5952L52.2613 32.6647Z",
      fill: "#A9A9A9"
    }
  )
] });

const AgentNetworkCoinIcon = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "126", height: "85", viewBox: "0 0 126 85", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M119.322 35.1641C119.322 50.36 94.1055 62.6787 62.9998 62.6787C31.894 62.6787 6.67773 50.36 6.67773 35.1641V49.8368C6.67773 65.0327 31.894 77.3514 62.9998 77.3514C94.1055 77.3514 119.322 65.0327 119.322 49.8368V35.1641Z",
      fill: "#2E2E2E",
      fillOpacity: "0.9"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M119.322 35.1641C119.322 50.36 94.1055 62.6787 62.9998 62.6787C31.894 62.6787 6.67773 50.36 6.67773 35.1641M119.322 35.1641C119.322 19.9681 94.1055 7.64941 62.9998 7.64941C31.894 7.64941 6.67773 19.9681 6.67773 35.1641M119.322 35.1641V49.8368C119.322 65.0327 94.1055 77.3514 62.9998 77.3514C31.894 77.3514 6.67773 65.0327 6.67773 49.8368V35.1641",
      stroke: "#424242"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      d: "M63.0002 0.96875C28.5152 0.96875 0.55957 15.6489 0.55957 33.7578V51.2433C0.55957 69.3522 28.5152 84.0323 63.0002 84.0323C97.4853 84.0323 125.441 69.3522 125.441 51.2433V33.7578C125.441 15.6489 97.4853 0.96875 63.0002 0.96875Z",
      stroke: "#707070"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx("g", { clipPath: "url(#clip0_23333_14744)", children: /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M79.2946 17.9539C83.0143 19.7854 83.016 22.7559 79.2979 24.5879C77.0214 25.7087 73.8794 26.1385 70.9301 25.8878L67.5296 30.2202C68.0944 30.3987 68.6321 30.6075 69.1262 30.8507C71.0847 31.815 72.0009 33.0948 71.8979 34.3581L77.2504 35.1977C77.6452 34.8727 78.1174 34.5635 78.6856 34.2835C82.4066 32.4514 88.4403 32.4485 92.1623 34.2803C95.8842 36.1128 95.8805 39.0851 92.159 40.9175C88.4373 42.7488 82.4002 42.7513 78.679 40.9191C76.7415 39.9647 75.8248 38.7009 75.9073 37.4506L70.5219 36.6045C70.1354 36.9168 69.6777 37.2145 69.1295 37.4846C68.345 37.8708 67.4527 38.1705 66.5059 38.3939L67.9312 41.984C70.1507 42.0573 72.3276 42.5087 74.0244 43.3438C77.7444 45.1754 77.7467 48.1458 74.0277 49.9778C70.3071 51.8092 64.2712 51.8095 60.551 49.9778C56.8323 48.1459 56.8351 45.1755 60.5543 43.3438C61.3581 42.9482 62.2741 42.6414 63.247 42.4167L61.8282 38.8428C59.5803 38.7777 57.3696 38.3299 55.6527 37.4846C54.1264 36.7327 53.2395 35.7882 52.9666 34.8103L43.924 34.0469C43.4596 34.6259 42.7547 35.1702 41.8041 35.6385C38.0834 37.4696 32.0473 37.4701 28.3273 35.6385C24.6089 33.8068 24.6123 30.8363 28.3306 29.0046C32.0508 27.1737 38.0806 27.1737 41.8008 29.0046C43.3459 29.7653 44.2412 30.7224 44.5033 31.7129L53.5098 32.4747C53.9742 31.8832 54.6868 31.3279 55.656 30.8507C57.6687 29.8601 60.357 29.4079 62.9902 29.4892L66.5783 24.9218C66.3174 24.8179 66.0637 24.7073 65.8212 24.5879C62.1022 22.7559 62.1045 19.7856 65.8245 17.9539C69.5447 16.1235 75.5747 16.1232 79.2946 17.9539ZM38.4299 30.6643C36.5715 29.75 33.5599 29.75 31.7015 30.6643C29.8447 31.5793 29.8414 33.0638 31.6982 33.9788C33.5565 34.8938 36.5742 34.8933 38.4332 33.9788C40.2906 33.0635 40.2883 31.5793 38.4299 30.6643ZM70.6536 45.0035C68.7951 44.0893 65.7836 44.0893 63.9251 45.0035C62.0676 45.9185 62.0647 47.4029 63.9218 48.318C65.7804 49.2332 68.7979 49.2329 70.6569 48.3181C72.5142 47.4027 72.5119 45.9185 70.6536 45.0035ZM65.7553 32.5104C63.8969 31.5961 60.8853 31.5961 59.0269 32.5104C57.1685 33.4254 57.1662 34.9096 59.0236 35.8249C60.8824 36.7402 63.8998 36.7402 65.7586 35.8249C67.616 34.9096 67.6137 33.4254 65.7553 32.5104ZM88.7915 35.94C86.9338 35.0261 83.9184 35.0264 82.0564 35.9432C80.1965 36.8601 80.1945 38.3451 82.0498 39.2594C83.9067 40.1736 86.9255 40.1738 88.7882 39.2578C90.6507 38.3407 90.649 36.8546 88.7915 35.94ZM75.9238 19.6136C74.0656 18.6995 71.0538 18.6998 69.1953 19.6136C67.3369 20.5286 67.3347 22.0129 69.192 22.9282C71.0509 23.8434 74.0682 23.8434 75.9271 22.9282C77.7836 22.0128 77.7818 20.5285 75.9238 19.6136Z",
      fill: "#A9A9A9"
    }
  ) }),
  /* @__PURE__ */ jsxRuntime.jsx("defs", { children: /* @__PURE__ */ jsxRuntime.jsx("clipPath", { id: "clip0_23333_14744", children: /* @__PURE__ */ jsxRuntime.jsx(
    "rect",
    {
      width: "59.3185",
      height: "59.3185",
      fill: "white",
      transform: "matrix(0.897148 0.441731 -0.897148 0.441731 65.3042 6.51953)"
    }
  ) }) })
] });

function useCopyToClipboard({ text, copyMessage = "Copied to clipboard!" }) {
  const [isCopied, setIsCopied] = React.useState(false);
  const timeoutRef = React.useRef(null);
  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      sonner.toast.success(copyMessage);
      setIsCopied(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 2e3);
    }).catch(() => {
      sonner.toast.error("Failed to copy to clipboard.");
    });
  }, [text, copyMessage]);
  return { isCopied, handleCopy };
}

function CopyButton({ content, copyMessage, className }) {
  const { isCopied, handleCopy } = useCopyToClipboard({
    text: content,
    copyMessage
  });
  return /* @__PURE__ */ jsxRuntime.jsxs(
    Button$1,
    {
      variant: "ghost",
      size: "icon",
      className: cn("relative h-6 w-6", className),
      "aria-label": "Copy to clipboard",
      onClick: handleCopy,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { className: cn("h-4 w-4 transition-transform ease-in-out", isCopied ? "scale-100" : "scale-0") }) }),
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { className: cn("h-4 w-4 transition-transform ease-in-out", isCopied ? "scale-0" : "scale-100") })
      ]
    }
  );
}

const useCodemirrorTheme$1 = () => {
  return React.useMemo(
    () => codemirrorThemeDracula.draculaInit({
      settings: {
        fontFamily: "var(--geist-mono)",
        fontSize: "0.8rem",
        lineHighlight: "transparent",
        gutterBackground: "transparent",
        background: "transparent",
        gutterForeground: "#939393"
      },
      styles: [{ tag: [highlight$1.tags.className, highlight$1.tags.propertyName] }]
    }),
    []
  );
};
const SyntaxHighlighter$1 = ({ data, className }) => {
  const formattedCode = JSON.stringify(data, null, 2);
  const theme = useCodemirrorTheme$1();
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: clsx("rounded-md bg-surface4 p-1 font-mono relative", className), children: [
    /* @__PURE__ */ jsxRuntime.jsx(CopyButton, { content: formattedCode, className: "absolute top-2 right-2" }),
    /* @__PURE__ */ jsxRuntime.jsx(CodeMirror, { value: formattedCode, theme, extensions: [langJson.jsonLanguage] })
  ] });
};
async function highlight(code, language) {
  const { codeToTokens, bundledLanguages } = await import('shiki');
  if (!(language in bundledLanguages)) return null;
  const { tokens } = await codeToTokens(code, {
    lang: language,
    defaultColor: false,
    themes: {
      light: "github-light",
      dark: "github-dark"
    }
  });
  return tokens;
}

const ToolFallback$1 = ({ toolName, argsText, result }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  let argSlot;
  try {
    const parsedArgs = JSON.parse(argsText);
    argSlot = /* @__PURE__ */ jsxRuntime.jsx(SyntaxHighlighter$1, { data: parsedArgs });
  } catch {
    argSlot = /* @__PURE__ */ jsxRuntime.jsx("pre", { className: "whitespace-pre-wrap", children: argsText });
  }
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsxs("button", { onClick: () => setIsCollapsed((s) => !s), className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronUpIcon, { className: cn("transition-all", isCollapsed ? "rotate-90" : "rotate-180") }) }),
      /* @__PURE__ */ jsxRuntime.jsx(Badge$1, { icon: /* @__PURE__ */ jsxRuntime.jsx(ToolsIcon, { className: "text-[#ECB047]" }), children: toolName })
    ] }),
    !isCollapsed && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "border-sm border-border1 rounded-lg bg-surface4", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-4 border-b-sm border-border1 py-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "font-medium pb-2", children: "Tool arguments" }),
        argSlot
      ] }),
      result !== void 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-4 py-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx("p", { className: "font-medium pb-2", children: "Tool result" }),
        typeof result === "string" ? /* @__PURE__ */ jsxRuntime.jsx("pre", { className: "whitespace-pre-wrap", children: result }) : /* @__PURE__ */ jsxRuntime.jsx(SyntaxHighlighter$1, { data: result })
      ] })
    ] }) })
  ] });
};

const AssistantMessage = ({
  ToolFallback: ToolFallbackCustom
}) => {
  const data = react.useMessage();
  const isSolelyToolCall = data.content.length === 1 && data.content[0].type === "tool-call";
  return /* @__PURE__ */ jsxRuntime.jsxs(react.MessagePrimitive.Root, { className: "max-w-full", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-icon6 text-ui-lg leading-ui-lg", children: /* @__PURE__ */ jsxRuntime.jsx(
      react.MessagePrimitive.Content,
      {
        components: {
          Text: MarkdownText,
          tools: { Fallback: ToolFallbackCustom || ToolFallback$1 }
        }
      }
    ) }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-6 pt-1", children: !isSolelyToolCall && /* @__PURE__ */ jsxRuntime.jsx(AssistantActionBar, {}) })
  ] });
};
const AssistantActionBar = () => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    react.ActionBarPrimitive.Root,
    {
      hideWhenRunning: true,
      autohide: "always",
      autohideFloat: "single-branch",
      className: "flex gap-1 items-center transition-all relative",
      children: /* @__PURE__ */ jsxRuntime.jsx(react.ActionBarPrimitive.Copy, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsxs(TooltipIconButton, { tooltip: "Copy", className: "bg-transparent text-icon3 hover:text-icon6", children: [
        /* @__PURE__ */ jsxRuntime.jsx(react.MessagePrimitive.If, { copied: true, children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CheckIcon, {}) }),
        /* @__PURE__ */ jsxRuntime.jsx(react.MessagePrimitive.If, { copied: false, children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CopyIcon, {}) })
      ] }) })
    }
  );
};

const Dialog = DialogPrimitive__namespace.Root;
const DialogTrigger = DialogPrimitive__namespace.Trigger;
const DialogPortal = DialogPrimitive__namespace.Portal;
const DialogOverlay = React__namespace.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  DialogPrimitive__namespace.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive__namespace.Overlay.displayName;
const DialogContent = React__namespace.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsxRuntime.jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxRuntime.jsxs(
    DialogPrimitive__namespace.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntime.jsxs(DialogPrimitive__namespace.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive__namespace.Content.displayName;
const DialogTitle = React__namespace.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  DialogPrimitive__namespace.Title,
  {
    ref,
    className: clsx("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive__namespace.Title.displayName;
const DialogDescription = React__namespace.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(DialogPrimitive__namespace.Description, { ref, className: cn("text-sm text-muted-foreground", className), ...props }));
DialogDescription.displayName = DialogPrimitive__namespace.Description.displayName;

const useHasAttachments = () => {
  const composer = react.useComposerRuntime();
  const [hasAttachments, setHasAttachments] = React.useState(false);
  React.useEffect(() => {
    composer.subscribe(() => {
      const attachments = composer.getState().attachments;
      setHasAttachments(attachments.length > 0);
    });
  }, [composer]);
  return hasAttachments;
};

const useFileSrc = (file) => {
  const [src, setSrc] = React.useState(void 0);
  React.useEffect(() => {
    if (!file) {
      setSrc(void 0);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setSrc(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);
  return src;
};
const useAttachmentSrc = () => {
  const { file, src } = react.useAttachment(
    shallow.useShallow((a) => {
      if (a.type !== "image") return {};
      if (a.file) return { file: a.file };
      const src2 = a.content?.filter((c) => c.type === "image")[0]?.image;
      if (!src2) return {};
      return { src: src2 };
    })
  );
  return useFileSrc(file) ?? src;
};
const AttachmentPreview = ({ src }) => {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "overflow-hidden w-full", children: /* @__PURE__ */ jsxRuntime.jsx("img", { src, className: "object-contain aspect-ratio h-full w-full", alt: "Preview" }) });
};
const AttachmentPreviewDialog = ({ children }) => {
  const src = useAttachmentSrc();
  if (!src) return children;
  return /* @__PURE__ */ jsxRuntime.jsxs(Dialog, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(DialogTrigger, { className: "hover:bg-accent/50 cursor-pointer transition-colors", asChild: true, children }),
    /* @__PURE__ */ jsxRuntime.jsxs(DialogPortal, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(DialogOverlay, {}),
      /* @__PURE__ */ jsxRuntime.jsxs(DialogContent, { className: "max-w-5xl w-full max-h-[80%]", children: [
        /* @__PURE__ */ jsxRuntime.jsx(DialogTitle, { className: "aui-sr-only", children: "Image Attachment Preview" }),
        /* @__PURE__ */ jsxRuntime.jsx(AttachmentPreview, { src })
      ] })
    ] })
  ] });
};
const AttachmentThumbnail = () => {
  const isImage = react.useAttachment((a) => a.type === "image");
  const document = react.useAttachment((a) => a.type === "document" ? a : void 0);
  const src = useAttachmentSrc();
  const canRemove = react.useAttachment((a) => a.source !== "message");
  return /* @__PURE__ */ jsxRuntime.jsx(TooltipPrimitive.TooltipProvider, { children: /* @__PURE__ */ jsxRuntime.jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(react.AttachmentPrimitive.Root, { className: "relative", children: [
      /* @__PURE__ */ jsxRuntime.jsx(AttachmentPreviewDialog, { children: /* @__PURE__ */ jsxRuntime.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-full w-full aspect-ratio overflow-hidden rounded-lg", children: isImage ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "rounded-lg border-sm border-border1 overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx("img", { src, className: "object-cover aspect-ratio size-16", alt: "Preview", height: 64, width: 64 }) }) : document?.contentType === "application/pdf" ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "rounded-lg border-sm border-border1 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.FileText, { className: "text-accent2" }) }) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "rounded-lg border-sm border-border1 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.FileIcon, { className: "text-icon3" }) }) }) }) }),
      canRemove && /* @__PURE__ */ jsxRuntime.jsx(AttachmentRemove, {})
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(TooltipContent, { side: "top", children: /* @__PURE__ */ jsxRuntime.jsx(react.AttachmentPrimitive.Name, {}) })
  ] }) });
};
const AttachmentRemove = () => {
  return /* @__PURE__ */ jsxRuntime.jsx(react.AttachmentPrimitive.Remove, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
    TooltipIconButton,
    {
      tooltip: "Remove file",
      className: "absolute -right-3 -top-3 hover:bg-transparent rounded-full bg-surface1 rounded-full p-1",
      side: "top",
      children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CircleXIcon, {}) })
    }
  ) });
};
const UserMessageAttachments = () => {
  return /* @__PURE__ */ jsxRuntime.jsx(react.MessagePrimitive.Attachments, { components: { Attachment: InMessageAttachment } });
};
const InMessageAttachment = () => {
  const isImage = react.useAttachment((a) => a.type === "image");
  const document = react.useAttachment((a) => a.type === "document" ? a : void 0);
  const src = useAttachmentSrc();
  return /* @__PURE__ */ jsxRuntime.jsx(TooltipPrimitive.TooltipProvider, { children: /* @__PURE__ */ jsxRuntime.jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(react.AttachmentPrimitive.Root, { className: "relative pt-4", children: /* @__PURE__ */ jsxRuntime.jsx(AttachmentPreviewDialog, { children: /* @__PURE__ */ jsxRuntime.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-full w-full aspect-ratio overflow-hidden rounded-lg", children: isImage ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "rounded-lg border-sm border-border1 overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx("img", { src, className: "object-cover aspect-ratio max-h-[140px] max-w-[320px]", alt: "Preview" }) }) : document?.contentType === "application/pdf" ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "rounded-lg border-sm border-border1 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.FileText, { className: "text-accent2" }) }) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "rounded-lg border-sm border-border1 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.FileIcon, { className: "text-icon3" }) }) }) }) }) }),
    /* @__PURE__ */ jsxRuntime.jsx(TooltipContent, { side: "top", children: /* @__PURE__ */ jsxRuntime.jsx(react.AttachmentPrimitive.Name, {}) })
  ] }) });
};
const ComposerAttachments = () => {
  const hasAttachments = useHasAttachments();
  if (!hasAttachments) return null;
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex w-full flex-row items-center gap-4 h-24", children: /* @__PURE__ */ jsxRuntime.jsx(react.ComposerPrimitive.Attachments, { components: { Attachment: AttachmentThumbnail } }) });
};

const UserMessage = () => {
  return /* @__PURE__ */ jsxRuntime.jsxs(react.MessagePrimitive.Root, { className: "w-full flex items-end pb-4 flex-col", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "max-w-[366px] px-5 py-3 text-icon6 text-ui-lg leading-ui-lg rounded-lg bg-surface3", children: /* @__PURE__ */ jsxRuntime.jsx(react.MessagePrimitive.Content, {}) }),
    /* @__PURE__ */ jsxRuntime.jsx(UserMessageAttachments, {})
  ] });
};

const useAutoscroll = (ref, { enabled = true }) => {
  const shouldScrollRef = React.useRef(enabled);
  React.useEffect(() => {
    if (!enabled) return;
    if (!ref?.current) return;
    const area = ref.current;
    const observer = new MutationObserver(() => {
      if (shouldScrollRef.current) {
        area.scrollTo({ top: area.scrollHeight, behavior: "smooth" });
      }
    });
    observer.observe(area, {
      childList: true,
      // observe direct children changes
      subtree: true,
      // observe all descendants
      characterData: true
      // observe text content changes
    });
    const handleScroll = (e) => {
      const scrollElement = e.target;
      const currentPosition = scrollElement.scrollTop + scrollElement.clientHeight;
      const totalHeight = scrollElement.scrollHeight;
      const isAtEnd = currentPosition >= totalHeight - 1;
      if (isAtEnd) {
        shouldScrollRef.current = true;
      } else {
        shouldScrollRef.current = false;
      }
    };
    area.addEventListener("scroll", handleScroll);
    return () => {
      area.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, [enabled, ref]);
};

const variants = {
  "header-md": "text-header-md leading-header-md",
  "ui-lg": "text-ui-lg leading-ui-lg",
  "ui-md": "text-ui-md leading-ui-md",
  "ui-sm": "text-ui-sm leading-ui-sm",
  "ui-xs": "text-ui-xs leading-ui-xs"
};
const fonts = {
  mono: "font-mono"
};
const Txt = ({ as: Root = "p", className, variant = "ui-md", font, ...props }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(Root, { className: clsx(variants[variant], font && fonts[font], className), ...props });
};

const useSpeechRecognition = ({ language = "en-US" } = {}) => {
  const speechRecognitionRef = React.useRef(null);
  const [state, setState] = React.useState({
    isListening: false,
    transcript: "",
    error: null
  });
  const start = () => {
    if (!speechRecognitionRef.current) return;
    speechRecognitionRef.current.start();
  };
  const stop = () => {
    if (!speechRecognitionRef.current) return;
    speechRecognitionRef.current.stop();
  };
  React.useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setState((prev) => ({ ...prev, error: "Speech Recognition not supported in this browser" }));
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    speechRecognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.lang = language;
    recognition.onstart = () => {
      setState((prev) => ({ ...prev, isListening: true }));
    };
    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        }
      }
      setState((prev) => ({ ...prev, transcript: finalTranscript }));
    };
    recognition.onerror = (event) => {
      setState((prev) => ({ ...prev, error: `Error: ${event.error}` }));
    };
    recognition.onend = () => setState((prev) => ({ ...prev, isListening: false }));
  }, [language]);
  return {
    ...state,
    start,
    stop
  };
};

const Thread = ({ ToolFallback, agentName, hasMemory, showFileSupport }) => {
  const areaRef = React.useRef(null);
  useAutoscroll(areaRef, { enabled: true });
  const WrappedAssistantMessage = (props) => {
    return /* @__PURE__ */ jsxRuntime.jsx(AssistantMessage, { ...props, ToolFallback });
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(ThreadWrapper, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(react.ThreadPrimitive.Viewport, { ref: areaRef, autoScroll: false, className: "overflow-y-scroll scroll-smooth h-full", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ThreadWelcome, { agentName }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "max-w-[568px] w-full mx-auto px-4 pb-7", children: /* @__PURE__ */ jsxRuntime.jsx(
        react.ThreadPrimitive.Messages,
        {
          components: {
            UserMessage,
            EditComposer,
            AssistantMessage: WrappedAssistantMessage
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntime.jsx(react.ThreadPrimitive.If, { empty: false, children: /* @__PURE__ */ jsxRuntime.jsx("div", {}) })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(Composer, { hasMemory, showFileSupport })
  ] });
};
const ThreadWrapper = ({ children }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(react.ThreadPrimitive.Root, { className: "grid grid-rows-[1fr_auto] h-full overflow-y-auto", children });
};
const ThreadWelcome = ({ agentName }) => {
  const safeAgentName = agentName ?? "";
  const words = safeAgentName.split(" ") ?? [];
  let initials = "A";
  if (words.length === 2) {
    initials = `${words[0][0]}${words[1][0]}`;
  } else if (safeAgentName.length > 0) {
    initials = `${safeAgentName[0]}`;
  } else {
    initials = "A";
  }
  return /* @__PURE__ */ jsxRuntime.jsx(react.ThreadPrimitive.Empty, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex w-full flex-grow flex-col items-center justify-center", children: [
    /* @__PURE__ */ jsxRuntime.jsx(Avatar, { children: /* @__PURE__ */ jsxRuntime.jsx(AvatarFallback, { children: initials }) }),
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "mt-4 font-medium", children: "How can I help you today?" })
  ] }) });
};
const Composer = ({ hasMemory, showFileSupport }) => {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mx-4", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(react.ComposerPrimitive.Root, { children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "max-w-[568px] w-full mx-auto px-2 py-3", children: /* @__PURE__ */ jsxRuntime.jsx(ComposerAttachments, {}) }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-surface3 rounded-lg border-sm border-border1 py-4 mt-auto max-w-[568px] w-full mx-auto px-4", children: [
        /* @__PURE__ */ jsxRuntime.jsx(react.ComposerPrimitive.Input, { asChild: true, className: "w-full", children: /* @__PURE__ */ jsxRuntime.jsx(
          "textarea",
          {
            className: "text-ui-lg leading-ui-lg placeholder:text-icon3 text-icon6 bg-transparent focus:outline-none resize-none",
            autoFocus: true,
            placeholder: "Enter your message...",
            name: "",
            id: ""
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(SpeechInput, {}),
          /* @__PURE__ */ jsxRuntime.jsx(ComposerAction, { showFileSupport })
        ] })
      ] })
    ] }),
    !hasMemory && /* @__PURE__ */ jsxRuntime.jsxs(Txt, { variant: "ui-sm", className: "text-icon3 flex gap-2 pt-1 max-w-[568px] w-full mx-auto border-t items-start", children: [
      /* @__PURE__ */ jsxRuntime.jsx(Icon, { className: "transform translate-y-[0.1rem]", children: /* @__PURE__ */ jsxRuntime.jsx(InfoIcon, {}) }),
      "Memory is not enabled. The conversation will not be persisted."
    ] })
  ] });
};
const SpeechInput = () => {
  const composerRuntime = react.useComposerRuntime();
  const { start, stop, isListening, transcript } = useSpeechRecognition();
  React.useEffect(() => {
    if (!transcript) return;
    composerRuntime.setText(transcript);
  }, [composerRuntime, transcript]);
  return /* @__PURE__ */ jsxRuntime.jsx(
    TooltipIconButton,
    {
      type: "button",
      tooltip: isListening ? "Stop dictation" : "Start dictation",
      variant: "ghost",
      className: "rounded-full",
      onClick: () => isListening ? stop() : start(),
      children: isListening ? /* @__PURE__ */ jsxRuntime.jsx(CircleStopIcon, {}) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Mic, { className: "h-6 w-6 text-[#898989] hover:text-[#fff]" })
    }
  );
};
const ComposerAction = ({ showFileSupport }) => {
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    showFileSupport && /* @__PURE__ */ jsxRuntime.jsx(react.ComposerPrimitive.AddAttachment, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(TooltipIconButton, { tooltip: "Add attachment", variant: "ghost", className: "rounded-full", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.PlusIcon, { className: "h-6 w-6 text-[#898989] hover:text-[#fff]" }) }) }),
    /* @__PURE__ */ jsxRuntime.jsx(react.ThreadPrimitive.If, { running: false, children: /* @__PURE__ */ jsxRuntime.jsx(react.ComposerPrimitive.Send, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
      TooltipIconButton,
      {
        tooltip: "Send",
        variant: "default",
        className: "rounded-full border-sm border-[#363636] bg-[#292929]",
        children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ArrowUp, { className: "h-6 w-6 text-[#898989] hover:text-[#fff]" })
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntime.jsx(react.ThreadPrimitive.If, { running: true, children: /* @__PURE__ */ jsxRuntime.jsx(react.ComposerPrimitive.Cancel, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(TooltipIconButton, { tooltip: "Cancel", variant: "default", children: /* @__PURE__ */ jsxRuntime.jsx(CircleStopIcon, {}) }) }) })
  ] });
};
const EditComposer = () => {
  return /* @__PURE__ */ jsxRuntime.jsxs(react.ComposerPrimitive.Root, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(react.ComposerPrimitive.Input, {}),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx(react.ComposerPrimitive.Cancel, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(Button$1, { variant: "ghost", children: "Cancel" }) }),
      /* @__PURE__ */ jsxRuntime.jsx(react.ComposerPrimitive.Send, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(Button$1, { children: "Send" }) })
    ] })
  ] });
};
const CircleStopIcon = () => {
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 16 16", fill: "currentColor", width: "16", height: "16", children: /* @__PURE__ */ jsxRuntime.jsx("rect", { width: "10", height: "10", x: "3", y: "3", rx: "2" }) });
};

const fileToBase64 = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Failed to convert file to base64."));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

class PDFAttachmentAdapter {
  accept = "application/pdf";
  async add({ file }) {
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("PDF size exceeds 20MB limit");
    }
    return {
      id: crypto.randomUUID(),
      type: "document",
      name: file.name,
      file,
      status: {
        type: "running",
        reason: "uploading",
        progress: 0
      },
      contentType: "application/pdf"
    };
  }
  async send(attachment) {
    const base64Data = await this.fileToBase64(attachment.file);
    return {
      id: attachment.id,
      type: "document",
      name: attachment.name,
      content: [
        {
          type: "text",
          text: base64Data
        }
      ],
      status: { type: "complete" },
      contentType: "application/pdf"
    };
  }
  async remove(attachment) {
  }
  async fileToBase64(file) {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }
  // Optional: Extract text from PDF using a library like pdf.js
  async extractTextFromPDF(file) {
    return "Extracted PDF text content";
  }
}

const convertMessage$1 = (message) => {
  return message;
};
const convertToAIAttachments = async (attachments) => {
  const promises = attachments.filter((attachment) => attachment.type === "image" || attachment.type === "document").map(async (attachment) => {
    if (attachment.type === "document") {
      if (attachment.contentType === "application/pdf") {
        return {
          role: "user",
          content: [
            {
              type: "file",
              // @ts-expect-error - TODO: fix this type issue somehow
              data: attachment.content?.[0]?.text || "",
              mimeType: attachment.contentType,
              filename: attachment.name
            }
          ]
        };
      }
      return {
        role: "user",
        // @ts-expect-error - TODO: fix this type issue somehow
        content: attachment.content[0]?.text || ""
      };
    }
    return {
      role: "user",
      content: [
        {
          type: "image",
          image: await fileToBase64(attachment.file),
          mimeType: attachment.file.type
        }
      ]
    };
  });
  return Promise.all(promises);
};
function MastraRuntimeProvider({
  children,
  agentId,
  initialMessages,
  agentName,
  memory,
  threadId,
  refreshThreadList,
  modelSettings = {},
  chatWithGenerate,
  runtimeContext
}) {
  const [isRunning, setIsRunning] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [currentThreadId, setCurrentThreadId] = React.useState(threadId);
  const { frequencyPenalty, presencePenalty, maxRetries, maxSteps, maxTokens, temperature, topK, topP, instructions } = modelSettings;
  const runtimeContextInstance = new di.RuntimeContext();
  Object.entries(runtimeContext ?? {}).forEach(([key, value]) => {
    runtimeContextInstance.set(key, value);
  });
  React.useEffect(() => {
    const hasNewInitialMessages = initialMessages && initialMessages?.length > messages?.length;
    if (messages.length === 0 || currentThreadId !== threadId || hasNewInitialMessages && currentThreadId === threadId) {
      if (initialMessages && threadId && memory) {
        const convertedMessages = initialMessages?.map((message) => {
          const toolInvocationsAsContentParts = (message.toolInvocations || []).map((toolInvocation) => ({
            type: "tool-call",
            toolCallId: toolInvocation?.toolCallId,
            toolName: toolInvocation?.toolName,
            args: toolInvocation?.args,
            result: toolInvocation?.result
          }));
          const attachmentsAsContentParts = (message.experimental_attachments || []).map((image) => ({
            type: image.contentType.startsWith(`image/`) ? "image" : image.contentType.startsWith(`audio/`) ? "audio" : "file",
            mimeType: image.contentType,
            image: image.url
          }));
          return {
            ...message,
            content: [
              ...typeof message.content === "string" ? [{ type: "text", text: message.content }] : [],
              ...toolInvocationsAsContentParts,
              ...attachmentsAsContentParts
            ]
          };
        }).filter(Boolean);
        setMessages(convertedMessages);
        setCurrentThreadId(threadId);
      }
    }
  }, [initialMessages, threadId, memory]);
  const mastra = useMastraClient();
  const agent = mastra.getAgent(agentId);
  const onNew = async (message) => {
    if (message.content[0]?.type !== "text") throw new Error("Only text messages are supported");
    const attachments = await convertToAIAttachments(message.attachments);
    const input = message.content[0].text;
    setMessages((currentConversation) => [
      ...currentConversation,
      { role: "user", content: input, attachments: message.attachments }
    ]);
    setIsRunning(true);
    try {
      if (chatWithGenerate) {
        const generateResponse = await agent.generate({
          messages: [
            {
              role: "user",
              content: input
            },
            ...attachments
          ],
          runId: agentId,
          frequencyPenalty,
          presencePenalty,
          maxRetries,
          maxSteps,
          maxTokens,
          temperature,
          topK,
          topP,
          instructions,
          runtimeContext: runtimeContextInstance,
          ...memory ? { threadId, resourceId: agentId } : {}
        });
        if (generateResponse.response) {
          const latestMessage = generateResponse.response.messages.reduce(
            (acc, message2) => {
              const _content = Array.isArray(acc.content) ? acc.content : [];
              if (typeof message2.content === "string") {
                return {
                  ...acc,
                  content: [
                    ..._content,
                    {
                      type: "text",
                      text: message2.content
                    }
                  ]
                };
              }
              if (message2.role === "assistant") {
                const toolCallContent = Array.isArray(message2.content) ? message2.content.find((content) => content.type === "tool-call") : void 0;
                if (toolCallContent) {
                  const newContent = _content.map((c) => {
                    if (c.type === "tool-call" && c.toolCallId === toolCallContent?.toolCallId) {
                      return { ...c, ...toolCallContent };
                    }
                    return c;
                  });
                  const containsToolCall = newContent.some((c) => c.type === "tool-call");
                  return {
                    ...acc,
                    content: containsToolCall ? newContent : [..._content, toolCallContent]
                  };
                }
                const textContent = Array.isArray(message2.content) ? message2.content.find((content) => content.type === "text" && content.text) : void 0;
                if (textContent) {
                  return {
                    ...acc,
                    content: [..._content, textContent]
                  };
                }
              }
              if (message2.role === "tool") {
                const toolResult = Array.isArray(message2.content) ? message2.content.find((content) => content.type === "tool-result") : void 0;
                if (toolResult) {
                  const newContent = _content.map((c) => {
                    if (c.type === "tool-call" && c.toolCallId === toolResult?.toolCallId) {
                      return { ...c, result: toolResult.result };
                    }
                    return c;
                  });
                  const containsToolCall = newContent.some((c) => c.type === "tool-call");
                  return {
                    ...acc,
                    content: containsToolCall ? newContent : [
                      ..._content,
                      { type: "tool-result", toolCallId: toolResult.toolCallId, result: toolResult.result }
                    ]
                  };
                }
                return {
                  ...acc,
                  content: [..._content, toolResult]
                };
              }
              return acc;
            },
            { role: "assistant", content: [] }
          );
          setMessages((currentConversation) => [...currentConversation, latestMessage]);
        }
      } else {
        let updater = function() {
          setMessages((currentConversation) => {
            const message2 = {
              role: "assistant",
              content: [{ type: "text", text: content }]
            };
            if (!assistantMessageAdded) {
              assistantMessageAdded = true;
              if (assistantToolCallAddedForUpdater) {
                assistantToolCallAddedForUpdater = false;
              }
              return [...currentConversation, message2];
            }
            if (assistantToolCallAddedForUpdater) {
              assistantToolCallAddedForUpdater = false;
              return [...currentConversation, message2];
            }
            return [...currentConversation.slice(0, -1), message2];
          });
        };
        const response = await agent.stream({
          messages: [
            {
              role: "user",
              content: input
            },
            ...attachments
          ],
          runId: agentId,
          frequencyPenalty,
          presencePenalty,
          maxRetries,
          maxSteps,
          maxTokens,
          temperature,
          topK,
          topP,
          instructions,
          runtimeContext: runtimeContextInstance,
          ...memory ? { threadId, resourceId: agentId } : {}
        });
        if (!response.body) {
          throw new Error("No response body");
        }
        let content = "";
        let assistantMessageAdded = false;
        let assistantToolCallAddedForUpdater = false;
        let assistantToolCallAddedForContent = false;
        await response.processDataStream({
          onTextPart(value) {
            if (assistantToolCallAddedForContent) {
              assistantToolCallAddedForContent = false;
              content = value;
            } else {
              content += value;
            }
            updater();
          },
          async onToolCallPart(value) {
            setMessages((currentConversation) => {
              const lastMessage = currentConversation[currentConversation.length - 1];
              if (lastMessage && lastMessage.role === "assistant") {
                const updatedMessage = {
                  ...lastMessage,
                  content: Array.isArray(lastMessage.content) ? [
                    ...lastMessage.content,
                    {
                      type: "tool-call",
                      toolCallId: value.toolCallId,
                      toolName: value.toolName,
                      args: value.args
                    }
                  ] : [
                    ...typeof lastMessage.content === "string" ? [{ type: "text", text: lastMessage.content }] : [],
                    {
                      type: "tool-call",
                      toolCallId: value.toolCallId,
                      toolName: value.toolName,
                      args: value.args
                    }
                  ]
                };
                assistantToolCallAddedForUpdater = true;
                assistantToolCallAddedForContent = true;
                return [...currentConversation.slice(0, -1), updatedMessage];
              }
              const newMessage = {
                role: "assistant",
                content: [
                  { type: "text", text: content },
                  {
                    type: "tool-call",
                    toolCallId: value.toolCallId,
                    toolName: value.toolName,
                    args: value.args
                  }
                ]
              };
              assistantToolCallAddedForUpdater = true;
              assistantToolCallAddedForContent = true;
              return [...currentConversation, newMessage];
            });
          },
          async onToolResultPart(value) {
            setMessages((currentConversation) => {
              const lastMessage = currentConversation[currentConversation.length - 1];
              if (lastMessage && lastMessage.role === "assistant" && Array.isArray(lastMessage.content)) {
                const updatedContent = lastMessage.content.map((part) => {
                  if (typeof part === "object" && part.type === "tool-call" && part.toolCallId === value.toolCallId) {
                    return {
                      ...part,
                      result: value.result
                    };
                  }
                  return part;
                });
                const updatedMessage = {
                  ...lastMessage,
                  content: updatedContent
                };
                return [...currentConversation.slice(0, -1), updatedMessage];
              }
              return currentConversation;
            });
          },
          onErrorPart(error) {
            throw new Error(error);
          }
        });
      }
      setIsRunning(false);
      setTimeout(() => {
        refreshThreadList?.();
      }, 500);
    } catch (error) {
      console.error("Error occurred in MastraRuntimeProvider", error);
      setIsRunning(false);
      setMessages((currentConversation) => [
        ...currentConversation,
        { role: "assistant", content: [{ type: "text", text: `Error: ${error}` }] }
      ]);
    }
  };
  const runtime = react.useExternalStoreRuntime({
    isRunning,
    messages,
    convertMessage: convertMessage$1,
    onNew,
    adapters: {
      attachments: new react.CompositeAttachmentAdapter([
        new react.SimpleImageAttachmentAdapter(),
        new react.SimpleTextAttachmentAdapter(),
        new PDFAttachmentAdapter()
      ])
    }
  });
  return /* @__PURE__ */ jsxRuntime.jsxs(react.AssistantRuntimeProvider, { runtime, children: [
    " ",
    children,
    " "
  ] });
}

const useAgentStore = zustand.create()(
  middleware.persist(
    (set) => ({
      modelSettings: {},
      setModelSettings: (modelSettings) => set((state) => ({ modelSettings: { ...state.modelSettings, ...modelSettings } })),
      chatWithGenerate: {},
      setChatWithGenerate: (chatWithGenerate) => set((state) => ({ chatWithGenerate: { ...state.chatWithGenerate, ...chatWithGenerate } }))
    }),
    {
      name: "mastra-agent-store"
    }
  )
);

const defaultModelSettings$1 = {
  maxRetries: 2,
  maxSteps: 5,
  temperature: 0.5,
  topP: 1
};
const AgentContext = React.createContext({});
function AgentProvider({
  agentId,
  defaultGenerateOptions,
  defaultStreamOptions,
  children
}) {
  const {
    modelSettings: modelSettingsStore,
    setModelSettings: setModelSettingsStore,
    chatWithGenerate: chatWithGenerateStore,
    setChatWithGenerate: setChatWithGenerateStore
  } = useAgentStore();
  const chatWithGenerate = chatWithGenerateStore[agentId] || false;
  const setChatWithGenerate = (chatWithGenerate2) => {
    setChatWithGenerateStore({ [agentId]: chatWithGenerate2 });
  };
  const modelSettings = React.useMemo(() => {
    if (modelSettingsStore[agentId]) return modelSettingsStore[agentId];
    if (chatWithGenerate) {
      return {
        maxRetries: defaultGenerateOptions?.maxRetries ?? defaultModelSettings$1.maxRetries,
        maxSteps: defaultGenerateOptions?.maxSteps ?? defaultModelSettings$1.maxSteps,
        temperature: defaultGenerateOptions?.temperature ?? defaultModelSettings$1.temperature,
        topP: defaultGenerateOptions?.topP ?? defaultModelSettings$1.topP,
        ...defaultGenerateOptions
      };
    } else {
      return {
        maxRetries: defaultStreamOptions?.maxRetries ?? defaultModelSettings$1.maxRetries,
        maxSteps: defaultStreamOptions?.maxSteps ?? defaultModelSettings$1.maxSteps,
        temperature: defaultStreamOptions?.temperature ?? defaultModelSettings$1.temperature,
        topP: defaultStreamOptions?.topP ?? defaultModelSettings$1.topP,
        ...defaultStreamOptions
      };
    }
  }, [agentId, defaultGenerateOptions, defaultStreamOptions, chatWithGenerate, modelSettingsStore]);
  const setModelSettings = (modelSettings2) => {
    setModelSettingsStore({ [agentId]: modelSettings2 });
  };
  const resetModelSettings = () => {
    setModelSettingsStore({ [agentId]: null });
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    AgentContext.Provider,
    {
      value: {
        modelSettings,
        setModelSettings,
        resetModelSettings,
        chatWithGenerate,
        setChatWithGenerate
      },
      children
    }
  );
}

const usePlaygroundStore = zustand.create()(
  middleware.persist(
    (set) => ({
      runtimeContext: {},
      setRuntimeContext: (runtimeContext) => set({ runtimeContext })
    }),
    {
      name: "mastra-playground-store"
    }
  )
);

const AgentChat = ({
  agentId,
  agentName,
  threadId,
  initialMessages,
  memory,
  refreshThreadList,
  showFileSupport
}) => {
  const { modelSettings, chatWithGenerate } = React.useContext(AgentContext);
  const { runtimeContext } = usePlaygroundStore();
  return /* @__PURE__ */ jsxRuntime.jsx(
    MastraRuntimeProvider,
    {
      agentId,
      agentName,
      threadId,
      initialMessages,
      memory,
      refreshThreadList,
      modelSettings,
      chatWithGenerate,
      runtimeContext,
      children: /* @__PURE__ */ jsxRuntime.jsx(Thread, { agentName: agentName ?? "", hasMemory: memory, showFileSupport })
    }
  );
};

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}

function CopyableContent({ content, label, multiline = false }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "group relative flex items-start gap-2", children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: cn("text-sm text-mastra-el-4", multiline ? "whitespace-pre-wrap" : "truncate"), children: content }),
    /* @__PURE__ */ jsxRuntime.jsx(
      Button$1,
      {
        variant: "ghost",
        size: "sm",
        className: "opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mt-1",
        onClick: (e) => {
          e.stopPropagation();
          handleCopy();
        },
        "aria-label": `Copy ${label}`,
        children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Copy, { className: "h-3 w-3" })
      }
    )
  ] });
}

function FormattedDate({ date }) {
  const formattedDate = {
    relativeTime: dateFns.formatDistanceToNow(new Date(date), { addSuffix: true }),
    fullDate: dateFns.format(new Date(date), "PPpp")
  };
  return /* @__PURE__ */ jsxRuntime.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntime.jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(TooltipTrigger, { className: "text-left text-sm text-mastra-el-4", children: formattedDate.relativeTime }),
    /* @__PURE__ */ jsxRuntime.jsx(TooltipContent, { className: "bg-mastra-bg-1 text-mastra-el-1", children: /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm", children: formattedDate.fullDate }) })
  ] }) });
}

const inputVariants = cva(
  "flex w-full text-icon6 rounded-lg border bg-transparent shadow-sm focus-visible:ring-ring transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-sm border-border1 placeholder:text-icon3",
        filled: "border-sm bg-inputFill border-border1 placeholder:text-icon3",
        unstyled: "border-0 bg-transparent placeholder:text-icon3 focus-visible:ring-transparent focus-visible:outline-none"
      },
      customSize: {
        default: "px-[13px] text-[calc(13_/_16_*_1rem)] h-8",
        sm: "h-[30px] px-[13px] text-xs",
        lg: "h-10 px-[17px] text-[calc(13_/_16_*_1rem)]"
      }
    },
    defaultVariants: {
      variant: "default",
      customSize: "default"
    }
  }
);
const Input = React__namespace.forwardRef(
  ({ className, customSize, testId, variant, type, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      "input",
      {
        type,
        className: clsx(className, inputVariants({ variant, customSize, className })),
        "data-testid": testId,
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";

function ScoreIndicator({ score }) {
  return /* @__PURE__ */ jsxRuntime.jsx(Badge, { variant: "secondary", children: score.toFixed(2) });
}

const Table$1 = React__namespace.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx("table", { ref, className: cn("w-full caption-bottom text-sm border-spacing-0", className), ...props })
);
Table$1.displayName = "Table";
const TableHeader = React__namespace.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx("thead", { ref, className: cn("[&_tr]:border-b-[0.5px]", className), ...props })
);
TableHeader.displayName = "TableHeader";
const TableBody = React__namespace.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx("tbody", { ref, className: cn("[&_tr:last-child]:border-0", className), ...props })
);
TableBody.displayName = "TableBody";
const TableFooter = React__namespace.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx("tfoot", { ref, className: cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className), ...props })
);
TableFooter.displayName = "TableFooter";
const TableRow = React__namespace.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
    "tr",
    {
      ref,
      className: cn(
        "border-b-[0.5px] border-mastra-border-1 transition-colors hover:bg-muted/50 data-[state=selected]:bg-mastra-bg-4/70",
        className
      ),
      ...props
    }
  )
);
TableRow.displayName = "TableRow";
const TableHead = React__namespace.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
    "th",
    {
      ref,
      className: cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      ),
      ...props
    }
  )
);
TableHead.displayName = "TableHead";
const TableCell = React__namespace.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx("td", { ref, className: cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className), ...props })
);
TableCell.displayName = "TableCell";
const TableCaption = React__namespace.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx("caption", { ref, className: cn("mt-4 text-sm text-muted-foreground", className), ...props })
);
TableCaption.displayName = "TableCaption";

const Tabs = TabsPrimitive__namespace.Root;
const TabsList = React__namespace.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(TabsPrimitive__namespace.List, { ref, className: cn(className), ...props }));
TabsList.displayName = TabsPrimitive__namespace.List.displayName;
const TabsTrigger = React__namespace.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(TabsPrimitive__namespace.Trigger, { ref, className: cn(className), ...props }));
TabsTrigger.displayName = TabsPrimitive__namespace.Trigger.displayName;
const TabsContent = React__namespace.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  TabsPrimitive__namespace.Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = TabsPrimitive__namespace.Content.displayName;

const scrollableContentClass = cn(
  "relative overflow-y-auto overflow-x-hidden invisible hover:visible focus:visible",
  "[&::-webkit-scrollbar]:w-1",
  "[&::-webkit-scrollbar-track]:bg-transparent",
  "[&::-webkit-scrollbar-thumb]:rounded-full",
  "[&::-webkit-scrollbar-thumb]:bg-mastra-border/20",
  "[&>*]:visible"
);
const tabIndicatorClass = cn(
  "px-4 py-2 text-sm transition-all border-b-2 border-transparent",
  "data-[state=active]:border-white data-[state=active]:text-white font-medium",
  "data-[state=inactive]:text-mastra-el-4 hover:data-[state=inactive]:text-mastra-el-2",
  "focus-visible:outline-none"
);
const tabContentClass = cn("data-[state=inactive]:mt-0 min-h-0 h-full grid grid-rows-[1fr]");
function AgentEvals({ liveEvals, ciEvals, onRefetchLiveEvals, onRefetchCiEvals }) {
  const [activeTab, setActiveTab] = React.useState("live");
  function handleRefresh() {
    if (activeTab === "live") return onRefetchLiveEvals();
    return onRefetchCiEvals();
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    Tabs,
    {
      value: activeTab,
      onValueChange: (value) => setActiveTab(value),
      className: "grid grid-rows-[auto_1fr] h-full min-h-0 pb-2",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-b border-mastra-border/10", children: /* @__PURE__ */ jsxRuntime.jsxs(TabsList, { className: "bg-transparent border-0 h-auto mx-4", children: [
          /* @__PURE__ */ jsxRuntime.jsx(TabsTrigger, { value: "live", className: tabIndicatorClass, children: "Live" }),
          /* @__PURE__ */ jsxRuntime.jsx(TabsTrigger, { value: "ci", className: tabIndicatorClass, children: "CI" })
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsx(TabsContent, { value: "live", className: tabContentClass, children: /* @__PURE__ */ jsxRuntime.jsx(EvalTable, { evals: liveEvals, isCIMode: false, onRefresh: handleRefresh }) }),
        /* @__PURE__ */ jsxRuntime.jsx(TabsContent, { value: "ci", className: tabContentClass, children: /* @__PURE__ */ jsxRuntime.jsx(EvalTable, { evals: ciEvals, isCIMode: true, onRefresh: handleRefresh }) })
      ]
    }
  );
}
function EvalTable({ evals, isCIMode = false, onRefresh }) {
  const [expandedMetrics, setExpandedMetrics] = React.useState(/* @__PURE__ */ new Set());
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortConfig, setSortConfig] = React.useState({ field: "metricName", direction: "asc" });
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "min-h-0 grid grid-rows-[auto_1fr]", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-4 p-4 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-mastra-el-3" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          Input,
          {
            id: "search-input",
            placeholder: "Search metrics, inputs, or outputs...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            className: "pl-10"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(Badge, { variant: "secondary", className: "text-xs", children: [
        evals.length,
        " Total Evaluations"
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(Button$1, { variant: "ghost", size: "icon", onClick: onRefresh, className: "h-9 w-9", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.RefreshCcwIcon, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "overflow-auto", children: /* @__PURE__ */ jsxRuntime.jsxs(Table$1, { className: "w-full", children: [
      /* @__PURE__ */ jsxRuntime.jsx(TableHeader, { className: "bg-mastra-bg-2 h-[var(--table-header-height)] sticky top-0 z-10", children: /* @__PURE__ */ jsxRuntime.jsxs(TableRow, { className: "border-gray-6 border-b-[0.1px] text-[0.8125rem]", children: [
        /* @__PURE__ */ jsxRuntime.jsx(TableHead, { className: "w-12 h-12" }),
        /* @__PURE__ */ jsxRuntime.jsx(
          TableHead,
          {
            className: "min-w-[200px] max-w-[30%] text-mastra-el-3 cursor-pointer",
            onClick: () => toggleSort("metricName"),
            children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center", children: [
              "Metric ",
              getSortIcon("metricName")
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(TableHead, { className: "flex-1 text-mastra-el-3" }),
        /* @__PURE__ */ jsxRuntime.jsx(TableHead, { className: "w-48 text-mastra-el-3 cursor-pointer", onClick: () => toggleSort("averageScore"), children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center", children: [
          "Average Score ",
          getSortIcon("averageScore")
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsx(TableHead, { className: "w-48 text-mastra-el-3", children: "Evaluations" })
      ] }) }),
      /* @__PURE__ */ jsxRuntime.jsx(TableBody, { className: "border-b border-gray-6 relative", children: /* @__PURE__ */ jsxRuntime.jsx(react$1.AnimatePresence, { mode: "wait", presenceAffectsLayout: false, children: groupEvals(evals).length === 0 ? /* @__PURE__ */ jsxRuntime.jsxs(TableRow, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(TableCell, { className: "h-12 w-16" }),
        /* @__PURE__ */ jsxRuntime.jsx(TableCell, { colSpan: 4, className: "h-32 px-4 text-center text-mastra-el-3", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Search, { className: "size-5" }),
          /* @__PURE__ */ jsxRuntime.jsx("p", { children: "No evaluations found" }),
          searchTerm && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm", children: "Try adjusting your search terms" })
        ] }) })
      ] }) : groupEvals(evals).map((group) => /* @__PURE__ */ jsxRuntime.jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          TableRow,
          {
            className: "border-b-gray-6 border-b-[0.1px] text-[0.8125rem] cursor-pointer hover:bg-mastra-bg-3",
            onClick: () => toggleMetric(group.metricName),
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(TableCell, { className: "w-12", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-8 w-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(
                "div",
                {
                  className: cn(
                    "transform transition-transform duration-200",
                    expandedMetrics.has(group.metricName) ? "rotate-90" : ""
                  ),
                  children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronRight, { className: "h-4 w-4 text-mastra-el-5" })
                }
              ) }) }),
              /* @__PURE__ */ jsxRuntime.jsx(TableCell, { className: "min-w-[200px] max-w-[30%] font-medium text-mastra-el-5", children: group.metricName }),
              /* @__PURE__ */ jsxRuntime.jsx(TableCell, { className: "flex-1 text-mastra-el-5" }),
              /* @__PURE__ */ jsxRuntime.jsx(TableCell, { className: "w-48 text-mastra-el-5", children: /* @__PURE__ */ jsxRuntime.jsx(ScoreIndicator, { score: group.averageScore }) }),
              /* @__PURE__ */ jsxRuntime.jsx(TableCell, { className: "w-48 text-mastra-el-5", children: /* @__PURE__ */ jsxRuntime.jsx(Badge, { variant: "secondary", children: group.evals.length }) })
            ]
          }
        ),
        expandedMetrics.has(group.metricName) && /* @__PURE__ */ jsxRuntime.jsx(TableRow, { children: /* @__PURE__ */ jsxRuntime.jsx(
          TableCell,
          {
            colSpan: 5 + (getHasReasons(group.evals) ? 1 : 0) + (isCIMode ? 1 : 0),
            className: "p-0",
            children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "bg-mastra-bg-3 rounded-lg m-2", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxRuntime.jsxs(Table$1, { className: "w-full", children: [
              /* @__PURE__ */ jsxRuntime.jsx(TableHeader, { children: /* @__PURE__ */ jsxRuntime.jsxs(TableRow, { className: "text-[0.7rem] text-mastra-el-3 hover:bg-transparent", children: [
                /* @__PURE__ */ jsxRuntime.jsx(TableHead, { className: "pl-12 w-[120px]", children: "Timestamp" }),
                /* @__PURE__ */ jsxRuntime.jsx(TableHead, { className: "w-[300px]", children: "Instructions" }),
                /* @__PURE__ */ jsxRuntime.jsx(TableHead, { className: "w-[300px]", children: "Input" }),
                /* @__PURE__ */ jsxRuntime.jsx(TableHead, { className: "w-[300px]", children: "Output" }),
                /* @__PURE__ */ jsxRuntime.jsx(TableHead, { className: "w-[80px]", children: "Score" }),
                getHasReasons(group.evals) && /* @__PURE__ */ jsxRuntime.jsx(TableHead, { className: "w-[250px]", children: "Reason" }),
                isCIMode && /* @__PURE__ */ jsxRuntime.jsx(TableHead, { className: "w-[120px]", children: "Test Name" })
              ] }) }),
              /* @__PURE__ */ jsxRuntime.jsx(TableBody, { children: group.evals.map((evaluation, index) => /* @__PURE__ */ jsxRuntime.jsxs(
                TableRow,
                {
                  className: "text-[0.8125rem] hover:bg-mastra-bg-2/50",
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx(TableCell, { className: "pl-12 text-mastra-el-4 align-top py-4", children: /* @__PURE__ */ jsxRuntime.jsx(FormattedDate, { date: evaluation.createdAt }) }),
                    /* @__PURE__ */ jsxRuntime.jsx(TableCell, { className: "text-mastra-el-4 align-top py-4", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("max-w-[300px] max-h-[200px]", scrollableContentClass), children: /* @__PURE__ */ jsxRuntime.jsx(
                      CopyableContent,
                      {
                        content: evaluation.instructions,
                        label: "instructions",
                        multiline: true
                      }
                    ) }) }),
                    /* @__PURE__ */ jsxRuntime.jsx(TableCell, { className: "text-mastra-el-4 align-top py-4", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("max-w-[300px] max-h-[200px]", scrollableContentClass), children: /* @__PURE__ */ jsxRuntime.jsx(CopyableContent, { content: evaluation.input, label: "input", multiline: true }) }) }),
                    /* @__PURE__ */ jsxRuntime.jsx(TableCell, { className: "text-mastra-el-4 align-top py-4", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("max-w-[300px] max-h-[200px]", scrollableContentClass), children: /* @__PURE__ */ jsxRuntime.jsx(CopyableContent, { content: evaluation.output, label: "output", multiline: true }) }) }),
                    /* @__PURE__ */ jsxRuntime.jsx(TableCell, { className: "text-mastra-el-4 align-top py-4", children: /* @__PURE__ */ jsxRuntime.jsx(ScoreIndicator, { score: evaluation.result.score }) }),
                    getHasReasons(group.evals) && /* @__PURE__ */ jsxRuntime.jsx(TableCell, { className: "text-mastra-el-4 align-top py-4", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("max-w-[300px] max-h-[200px]", scrollableContentClass), children: /* @__PURE__ */ jsxRuntime.jsx(
                      CopyableContent,
                      {
                        content: evaluation.result.info?.reason || "",
                        label: "reason",
                        multiline: true
                      }
                    ) }) }),
                    isCIMode && /* @__PURE__ */ jsxRuntime.jsx(TableCell, { className: "text-mastra-el-4 align-top py-4", children: evaluation.testInfo?.testName && /* @__PURE__ */ jsxRuntime.jsx(Badge, { variant: "secondary", className: "text-xs", children: evaluation.testInfo.testName }) })
                  ]
                },
                `${group.metricName}-${index}`
              )) })
            ] }) }) })
          }
        ) })
      ] }, group.metricName)) }) })
    ] }) })
  ] });
  function getHasReasons(groupEvals2) {
    return groupEvals2.some((eval_) => eval_.result.info?.reason);
  }
  function toggleMetric(metricName) {
    const newExpanded = new Set(expandedMetrics);
    if (newExpanded.has(metricName)) {
      newExpanded.delete(metricName);
    } else {
      newExpanded.add(metricName);
    }
    setExpandedMetrics(newExpanded);
  }
  function toggleSort(field) {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc"
    }));
  }
  function getSortIcon(field) {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === "asc" ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.SortAsc, { className: "h-4 w-4 ml-1" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.SortDesc, { className: "h-4 w-4 ml-1" });
  }
  function groupEvals(evaluations) {
    let groups = evaluations.reduce((groups2, evaluation) => {
      const existingGroup = groups2.find((g) => g.metricName === evaluation.metricName);
      if (existingGroup) {
        existingGroup.evals.push(evaluation);
        existingGroup.averageScore = existingGroup.evals.reduce((sum, e) => sum + e.result.score, 0) / existingGroup.evals.length;
      } else {
        groups2.push({
          metricName: evaluation.metricName,
          averageScore: evaluation.result.score,
          evals: [evaluation]
        });
      }
      return groups2;
    }, []);
    if (searchTerm) {
      groups = groups.filter(
        (group) => group.metricName.toLowerCase().includes(searchTerm.toLowerCase()) || group.evals.some(
          (metric) => metric.input?.toLowerCase().includes(searchTerm.toLowerCase()) || metric.output?.toLowerCase().includes(searchTerm.toLowerCase()) || metric.instructions?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    groups.sort((a, b) => {
      const direction = sortConfig.direction === "asc" ? 1 : -1;
      switch (sortConfig.field) {
        case "metricName":
          return direction * a.metricName.localeCompare(b.metricName);
        case "averageScore":
          return direction * (a.averageScore - b.averageScore);
        default:
          return 0;
      }
    });
    return groups;
  }
}

const TraceContext = React.createContext({});
function TraceProvider({
  children,
  initialTraces: traces = []
}) {
  const [open, setOpen] = React.useState(false);
  const [trace, setTrace] = React.useState(null);
  const [currentTraceIndex, setCurrentTraceIndex] = React.useState(0);
  const [span, setSpan] = React.useState(null);
  const nextTrace = () => {
    if (currentTraceIndex < traces.length - 1) {
      const nextIndex = currentTraceIndex + 1;
      setCurrentTraceIndex(nextIndex);
      const nextTrace2 = traces[nextIndex].trace;
      setTrace(nextTrace2);
      const parentSpan = nextTrace2.find((span2) => span2.parentSpanId === null) || nextTrace2[0];
      setSpan(parentSpan);
    }
  };
  const prevTrace = () => {
    if (currentTraceIndex > 0) {
      const prevIndex = currentTraceIndex - 1;
      setCurrentTraceIndex(prevIndex);
      const prevTrace2 = traces[prevIndex].trace;
      setTrace(prevTrace2);
      const parentSpan = prevTrace2.find((span2) => span2.parentSpanId === null) || prevTrace2[0];
      setSpan(parentSpan);
    }
  };
  const clearData = () => {
    setOpen(false);
    setTrace(null);
    setSpan(null);
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    TraceContext.Provider,
    {
      value: {
        isOpen: open,
        setIsOpen: setOpen,
        trace,
        setTrace,
        traces,
        currentTraceIndex,
        setCurrentTraceIndex,
        nextTrace,
        prevTrace,
        span,
        setSpan,
        clearData
      },
      children
    }
  );
}

const rowSize = {
  default: "[&>tbody>tr]:h-table-row",
  small: "[&>tbody>tr]:h-table-row-small"
};
const Table = ({ className, children, size = "default" }) => {
  return /* @__PURE__ */ jsxRuntime.jsx("table", { className: clsx("w-full", rowSize[size], className), children });
};
const Thead = ({ className, children }) => {
  return /* @__PURE__ */ jsxRuntime.jsx("thead", { children: /* @__PURE__ */ jsxRuntime.jsx("tr", { className: clsx("h-table-header border-b-sm border-border1", className), children }) });
};
const Th = ({ className, children, ...props }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "th",
    {
      className: clsx(
        "text-icon3 text-ui-sm h-full text-left font-normal uppercase first:pl-5 last:pr-5 whitespace-nowrap",
        className
      ),
      ...props,
      children
    }
  );
};
const Tbody = ({ className, children }) => {
  return /* @__PURE__ */ jsxRuntime.jsx("tbody", { className: clsx("", className), children });
};
const Row = ({ className, children, selected = false, onClick }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "tr",
    {
      className: clsx(
        "border-b-sm border-border1 hover:bg-surface3",
        selected && "bg-surface4",
        onClick && "cursor-pointer",
        className
      ),
      onClick,
      children
    }
  );
};

const formatDateCell = (date) => {
  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date).toUpperCase();
  const day = date.getDate();
  const formattedDay = `${month} ${day}`;
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
    // Use 24-hour format
  }).format(date);
  return { day: formattedDay, time };
};

const Cell = ({ className, children, ...props }) => {
  return /* @__PURE__ */ jsxRuntime.jsx("td", { className: clsx("text-icon5 first:pl-5 last:pr-5", className), ...props, children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: clsx("flex h-full w-full shrink-0 items-center"), children }) });
};
const TxtCell = ({ className, children }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(Cell, { className, children: /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "span", variant: "ui-md", className: "w-full truncate", children }) });
};
const UnitCell = ({ className, children, unit }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(Cell, { className, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex min-w-0 items-center", children: [
    /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "span", variant: "ui-md", className: "shrink-0", children }),
    /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "span", variant: "ui-sm", className: "text-icon3 w-full truncate", children: unit })
  ] }) });
};
const DateTimeCell = ({ dateTime, ...props }) => {
  const { day, time } = formatDateCell(dateTime);
  return /* @__PURE__ */ jsxRuntime.jsx(Cell, { ...props, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "shrink-0", children: [
    /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "span", variant: "ui-sm", className: "text-icon3", children: day }),
    " ",
    /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "span", variant: "ui-md", children: time })
  ] }) });
};
const EntryCell = ({ name, description, icon, meta, ...props }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(Cell, { ...props, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-[14px]", children: [
    /* @__PURE__ */ jsxRuntime.jsx(Icon, { size: "lg", className: "text-icon5", children: icon }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-0", children: [
      /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "span", variant: "ui-md", className: "text-icon6 font-medium !leading-tight", children: name }),
      description && /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "span", variant: "ui-xs", className: "text-icon3 w-full max-w-[300px] truncate !leading-tight", children: description })
    ] }),
    meta
  ] }) });
};

const useOpenTrace = () => {
  const {
    setTrace,
    isOpen: open,
    setIsOpen: setOpen,
    trace: currentTrace,
    setSpan,
    setCurrentTraceIndex
  } = React.useContext(TraceContext);
  const openTrace = (trace, traceIndex) => {
    setTrace(trace);
    const parentSpan = trace.find((span) => span.parentSpanId === null) || trace[0];
    setSpan(parentSpan);
    setCurrentTraceIndex(traceIndex);
    if (open && currentTrace?.[0]?.id !== trace[0].id) return;
    setOpen((prev) => !prev);
  };
  return { openTrace };
};

const toSigFigs = (num, sigFigs) => {
  return Number(num.toPrecision(sigFigs));
};

const TracesTableEmpty = ({ colsCount }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(Tbody, { children: /* @__PURE__ */ jsxRuntime.jsx(Row, { children: /* @__PURE__ */ jsxRuntime.jsx(Cell, { colSpan: colsCount, className: "text-center py-4", children: /* @__PURE__ */ jsxRuntime.jsx(Txt, { children: "No traces found" }) }) }) });
};
const TracesTableError = ({ error, colsCount }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(Tbody, { children: /* @__PURE__ */ jsxRuntime.jsx(Row, { children: /* @__PURE__ */ jsxRuntime.jsx(Cell, { colSpan: colsCount, className: "text-center py-4", children: /* @__PURE__ */ jsxRuntime.jsx(Txt, { children: error.message }) }) }) });
};
const TraceRow = ({ trace, index, isActive }) => {
  const { openTrace } = useOpenTrace();
  const hasFailure = trace.trace.some((span) => span.status.code !== 0);
  return /* @__PURE__ */ jsxRuntime.jsxs(Row, { className: isActive ? "bg-surface4" : "", onClick: () => openTrace(trace.trace, index), children: [
    /* @__PURE__ */ jsxRuntime.jsx(DateTimeCell, { dateTime: new Date(trace.started / 1e3) }),
    /* @__PURE__ */ jsxRuntime.jsxs(TxtCell, { title: trace.traceId, children: [
      trace.traceId.substring(0, 7),
      "..."
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(UnitCell, { unit: "ms", children: toSigFigs(trace.duration / 1e3, 3) }),
    /* @__PURE__ */ jsxRuntime.jsx(Cell, { children: /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: () => openTrace(trace.trace, index), children: /* @__PURE__ */ jsxRuntime.jsx(Badge$1, { icon: /* @__PURE__ */ jsxRuntime.jsx(TraceIcon, {}), children: trace.trace.length }) }) }),
    /* @__PURE__ */ jsxRuntime.jsx(Cell, { children: hasFailure ? /* @__PURE__ */ jsxRuntime.jsx(Badge$1, { variant: "error", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, {}), children: "Failed" }) : /* @__PURE__ */ jsxRuntime.jsx(Badge$1, { icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, {}), variant: "success", children: "Success" }) })
  ] });
};
const TracesTable = ({ traces, error }) => {
  const hasNoTraces = !traces || traces.length === 0;
  const { currentTraceIndex } = React.useContext(TraceContext);
  const colsCount = 4;
  return /* @__PURE__ */ jsxRuntime.jsxs(Table, { size: "small", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(Thead, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(Th, { width: 120, children: "Time" }),
      /* @__PURE__ */ jsxRuntime.jsx(Th, { width: "auto", children: "Trace Id" }),
      /* @__PURE__ */ jsxRuntime.jsx(Th, { width: 120, children: "Duration" }),
      /* @__PURE__ */ jsxRuntime.jsx(Th, { width: 120, children: "Spans" }),
      /* @__PURE__ */ jsxRuntime.jsx(Th, { width: 120, children: "Status" })
    ] }),
    error ? /* @__PURE__ */ jsxRuntime.jsx(TracesTableError, { error, colsCount }) : hasNoTraces ? /* @__PURE__ */ jsxRuntime.jsx(TracesTableEmpty, { colsCount }) : /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: /* @__PURE__ */ jsxRuntime.jsx(Tbody, { children: traces.map((trace, index) => /* @__PURE__ */ jsxRuntime.jsx(TraceRow, { trace, index, isActive: index === currentTraceIndex }, trace.traceId)) }) })
  ] });
};

const useResizeColumn = ({
  defaultWidth,
  minimumWidth,
  maximumWidth,
  setCurrentWidth
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [sidebarWidth, setSidebarWidth] = React.useState(defaultWidth);
  const containerRef = React.useRef(null);
  const dragStartXRef = React.useRef(0);
  const initialWidthRef = React.useRef(0);
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    initialWidthRef.current = sidebarWidth;
  };
  React.useEffect(() => {
    setSidebarWidth(defaultWidth);
    setCurrentWidth?.(defaultWidth);
  }, [defaultWidth]);
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const deltaX = dragStartXRef.current - e.clientX;
      const deltaPercentage = deltaX / containerWidth * 100;
      const newWidth = Math.min(Math.max(initialWidthRef.current + deltaPercentage, minimumWidth), maximumWidth);
      setSidebarWidth(newWidth);
      setCurrentWidth?.(newWidth);
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);
  return { sidebarWidth, isDragging, handleMouseDown, containerRef };
};

const MastraResizablePanel = ({
  children,
  defaultWidth,
  minimumWidth,
  maximumWidth,
  className,
  disabled = false,
  setCurrentWidth,
  dividerPosition = "left"
}) => {
  const { sidebarWidth, isDragging, handleMouseDown, containerRef } = useResizeColumn({
    defaultWidth: disabled ? 100 : defaultWidth,
    minimumWidth,
    maximumWidth,
    setCurrentWidth
  });
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("w-full h-full relative", className), ref: containerRef, style: { width: `${sidebarWidth}%` }, children: [
    !disabled && dividerPosition === "left" ? /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: `w-px bg-border1 h-full cursor-col-resize hover:w-1.5 hover:bg-mastra-border-2 hover:bg-[#424242] active:bg-mastra-border-3 active:bg-[#3e3e3e] transition-colors absolute inset-y-0 z-10
          ${isDragging ? "bg-border2 w-1.5 cursor- col-resize" : ""}`,
        onMouseDown: handleMouseDown
      }
    ) : null,
    children,
    !disabled && dividerPosition === "right" ? /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: `w-px bg-border1 h-full cursor-col-resize hover:w-1.5 hover:bg-border2 active:bg-border3 transition-colors absolute inset-y-0 z-10
          ${isDragging ? "bg-border2 w-1.5 cursor- col-resize" : ""}`,
        onMouseDown: handleMouseDown
      }
    ) : null
  ] });
};

const sizeClasses = {
  md: "h-button-md gap-md",
  lg: "h-button-lg gap-lg"
};
const variantClasses$1 = {
  default: "bg-surface2 hover:bg-surface4 text-icon3 hover:text-icon6",
  light: "bg-surface3 hover:bg-surface5 text-icon6"
};
const Button = ({ className, as, size = "md", variant = "default", ...props }) => {
  const Component = as || "button";
  return /* @__PURE__ */ jsxRuntime.jsx(
    Component,
    {
      className: clsx(
        "bg-surface2 border-sm border-border1 px-lg text-ui-md inline-flex items-center justify-center rounded-md border",
        variantClasses$1[variant],
        sizeClasses[size],
        className
      ),
      ...props
    }
  );
};

const TraceTree = ({ children }) => {
  return /* @__PURE__ */ jsxRuntime.jsx("ol", { children });
};

const variantClasses = {
  agent: "bg-accent1"
};
const Time = ({ durationMs, tokenCount, variant, progressPercent, offsetPercent }) => {
  const variantClass = variant ? variantClasses[variant] : "bg-accent3";
  const percent = Math.min(100, progressPercent);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "w-[80px] xl:w-[166px] shrink-0", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "bg-surface4 relative h-[6px] w-full rounded-full p-px overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: clsx("absolute h-1 rounded-full", variantClass),
        style: { width: `${percent}%`, left: `${offsetPercent}%` }
      }
    ) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-4 pt-0.5", children: [
      /* @__PURE__ */ jsxRuntime.jsxs(Txt, { variant: "ui-sm", className: "text-icon2 font-medium", children: [
        toSigFigs(durationMs, 3),
        "ms"
      ] }),
      tokenCount && /* @__PURE__ */ jsxRuntime.jsxs(Txt, { variant: "ui-sm", className: "text-icon2 font-medium", children: [
        tokenCount,
        "t"
      ] })
    ] })
  ] });
};

const spanIconMap = {
  tool: ToolsIcon,
  agent: AgentIcon,
  workflow: WorkflowIcon,
  memory: MemoryIcon,
  rag: TraceIcon,
  storage: DbIcon,
  eval: ScoreIcon,
  other: TraceIcon
};
const spanVariantClasses = {
  tool: "text-[#ECB047]",
  agent: "text-accent1",
  workflow: "text-accent3",
  memory: "text-accent2",
  rag: "text-accent2",
  storage: "text-accent2",
  eval: "text-accent4",
  other: "text-icon6"
};
const Span = ({
  children,
  durationMs,
  variant,
  tokenCount,
  spans,
  isRoot,
  onClick,
  isActive,
  offsetMs,
  totalDurationMs
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const VariantIcon = spanIconMap[variant];
  const variantClass = spanVariantClasses[variant];
  const progressPercent = durationMs / totalDurationMs * 100;
  const offsetPercent = offsetMs / totalDurationMs * 100;
  const TextEl = onClick ? "button" : "div";
  return /* @__PURE__ */ jsxRuntime.jsxs("li", { children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: clsx("flex justify-between items-center gap-2 rounded-md pl-2", isActive && "bg-surface4"), children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex h-8 items-center gap-1 min-w-0", children: [
        spans ? /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            "aria-label": isExpanded ? "Collapse span" : "Expand span",
            "aria-expanded": isExpanded,
            className: "text-icon3 flex h-4 w-4",
            onClick: () => setIsExpanded(!isExpanded),
            children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(ChevronIcon, { className: clsx("transition-transform -rotate-90", { "rotate-0": isExpanded }) }) })
          }
        ) : /* @__PURE__ */ jsxRuntime.jsx("div", { "aria-hidden": true, className: "h-full w-4", children: !isRoot && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "ml-[7px] h-full w-px rounded-full" }) }),
        /* @__PURE__ */ jsxRuntime.jsxs(TextEl, { className: "flex items-center gap-2 min-w-0", onClick, children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: clsx("bg-surface4 flex items-center justify-center rounded-md p-[3px]", variantClass), children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(VariantIcon, {}) }) }),
          /* @__PURE__ */ jsxRuntime.jsx(Txt, { variant: "ui-md", className: "text-icon6 truncate", children })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(
        Time,
        {
          durationMs,
          tokenCount,
          variant: variant === "agent" ? "agent" : void 0,
          progressPercent,
          offsetPercent
        }
      )
    ] }),
    isExpanded && spans && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "ml-4", children: spans })
  ] });
};

const Spans = ({ children }) => {
  return /* @__PURE__ */ jsxRuntime.jsx("ol", { children });
};

const Trace = ({
  name,
  spans,
  durationMs,
  tokenCount,
  onClick,
  variant,
  isActive,
  totalDurationMs
}) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    Span,
    {
      isRoot: true,
      durationMs,
      variant,
      spans: /* @__PURE__ */ jsxRuntime.jsx(Spans, { children: spans }),
      onClick,
      isActive,
      offsetMs: 0,
      totalDurationMs,
      children: name
    }
  );
};

const getSpanVariant = (span) => {
  const attributes = Object.keys(span.attributes || {}).map((k) => k.toLowerCase());
  const lowerCaseName = span.name.toLowerCase();
  const isAiSpan = lowerCaseName.startsWith("ai.");
  if (isAiSpan) {
    const isAiAboutTool = lowerCaseName.includes("tool");
    if (isAiAboutTool) return "tool";
    return "other";
  }
  const hasMemoryRelatedAttributes = attributes.some((key) => key.includes("memory") || key.includes("storage"));
  if (hasMemoryRelatedAttributes) return "memory";
  const hasToolRelatedAttributes = attributes.some((key) => key.includes("tool"));
  if (hasToolRelatedAttributes) return "tool";
  const hasAgentRelatedAttributes = attributes.some((key) => key.includes("agent."));
  if (hasAgentRelatedAttributes) return "agent";
  if (lowerCaseName.includes(".insert")) {
    const evalRelatedAttribute = attributes.find((key) => String(span.attributes?.[key])?.includes("mastra_evals"));
    if (evalRelatedAttribute) return "eval";
  }
  return "other";
};

function buildTree(spans, minStartTime, totalDurationMs, parentSpanId = null) {
  return spans.filter((span) => span.parentSpanId === parentSpanId).map((span) => {
    return {
      ...span,
      children: buildTree(spans, minStartTime, totalDurationMs, span.id),
      offset: (span.startTime - minStartTime) / 1e3,
      // ns to ms
      duration: span.duration / 1e3,
      totalDurationMs
    };
  });
}
const createSpanTree = (spans) => {
  if (spans.length === 0) return [];
  let minStartTime;
  let maxEndTime;
  const orderedTree = [];
  const listSize = spans.length;
  for (let i = listSize - 1; i >= 0; i--) {
    const span = spans[i];
    if (!minStartTime || span.startTime < minStartTime) {
      minStartTime = span.startTime;
    }
    if (!maxEndTime || span.endTime > maxEndTime) {
      maxEndTime = span.endTime;
    }
    if (span.name !== ".insert" && span.name !== "mastra.getStorage") {
      orderedTree.push(span);
    }
  }
  if (!minStartTime || !maxEndTime) return [];
  const totalDurationMs = (maxEndTime - minStartTime) / 1e3;
  return buildTree(orderedTree, minStartTime, totalDurationMs);
};

const NestedSpans = ({ spanNodes }) => {
  const { span: activeSpan, setSpan } = React.useContext(TraceContext);
  return /* @__PURE__ */ jsxRuntime.jsx(Spans, { children: spanNodes.map((spanNode) => {
    const isActive = spanNode.id === activeSpan?.id;
    return /* @__PURE__ */ jsxRuntime.jsx(
      Span,
      {
        spans: spanNode.children.length > 0 && /* @__PURE__ */ jsxRuntime.jsx(NestedSpans, { spanNodes: spanNode.children }),
        durationMs: spanNode.duration,
        offsetMs: spanNode.offset,
        variant: getSpanVariant(spanNode),
        isActive,
        onClick: () => setSpan(spanNode),
        totalDurationMs: spanNode.totalDurationMs,
        children: spanNode.name
      },
      spanNode.id
    );
  }) });
};
function SpanView({ trace }) {
  const { span: activeSpan, setSpan } = React.useContext(TraceContext);
  const tree = createSpanTree(trace);
  return /* @__PURE__ */ jsxRuntime.jsx(TraceTree, { children: tree.map((node) => /* @__PURE__ */ jsxRuntime.jsx(
    Trace,
    {
      name: node.name,
      durationMs: node.duration,
      totalDurationMs: node.totalDurationMs,
      spans: /* @__PURE__ */ jsxRuntime.jsx(NestedSpans, { spanNodes: node.children }),
      variant: getSpanVariant(node),
      isActive: node.id === activeSpan?.id,
      onClick: () => setSpan(node)
    }
  )) });
}

const Header = ({ children, border = true }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "header",
    {
      className: clsx("h-header-default z-50 flex w-full items-center gap-[18px] bg-transparent px-5", {
        "border-b-sm border-border1": border
      }),
      children
    }
  );
};
const HeaderTitle = ({ children }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "h1", variant: "ui-lg", className: "font-medium text-white", children });
};
const HeaderAction = ({ children }) => {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "ml-auto", children });
};
const HeaderGroup = ({ children }) => {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "gap-lg flex items-center", children });
};

function TraceDetails() {
  const { trace, currentTraceIndex, prevTrace, nextTrace, traces } = React.useContext(TraceContext);
  const actualTrace = traces[currentTraceIndex];
  if (!actualTrace || !trace) return null;
  const hasFailure = trace.some((span) => span.status.code !== 0);
  return /* @__PURE__ */ jsxRuntime.jsxs("aside", { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(Header, { children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx(Button, { className: "bg-transparent border-none", onClick: prevTrace, disabled: currentTraceIndex === 0, children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronUp, {}) }) }),
        /* @__PURE__ */ jsxRuntime.jsx(
          Button,
          {
            className: "bg-transparent border-none",
            onClick: nextTrace,
            disabled: currentTraceIndex === traces.length - 1,
            children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, {}) })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1 justify-between w-full", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(Txt, { variant: "ui-lg", className: "font-medium text-icon5 shrink-0", children: [
          "Trace ",
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "ml-2 text-icon3", children: actualTrace.traceId.substring(0, 7) })
        ] }),
        hasFailure && /* @__PURE__ */ jsxRuntime.jsx(Badge$1, { variant: "error", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, {}), children: "Failed" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-5", children: /* @__PURE__ */ jsxRuntime.jsx(SpanView, { trace }) })
  ] });
}

const useCodemirrorTheme = () => {
  return React.useMemo(
    () => codemirrorThemeDracula.draculaInit({
      settings: {
        fontFamily: "var(--geist-mono)",
        fontSize: "0.8rem",
        lineHighlight: "transparent",
        gutterBackground: "transparent",
        gutterForeground: colors.Colors.surface3,
        background: "transparent"
      },
      styles: [{ tag: [highlight$1.tags.className, highlight$1.tags.propertyName] }]
    }),
    []
  );
};
const SyntaxHighlighter = ({ data }) => {
  const formattedCode = JSON.stringify(data, null, 2);
  const theme = useCodemirrorTheme();
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "rounded-md bg-[#1a1a1a] p-1 font-mono", children: /* @__PURE__ */ jsxRuntime.jsx(CodeMirror, { value: formattedCode, theme, extensions: [langJson.jsonLanguage] }) });
};

function formatOtelTimestamp(otelTimestamp) {
  const date = new Date(otelTimestamp / 1e3);
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true
  }).format(date);
}
function formatOtelTimestamp2(otelTimestamp) {
  const date = new Date(otelTimestamp / 1e6);
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true
  }).format(date);
}
function transformKey(key) {
  if (key.includes(".argument.")) {
    return `Input`;
  }
  if (key.includes(".result")) {
    return "Output";
  }
  const newKey = key.split(".").join(" ").split("_").join(" ").replaceAll("ai", "AI");
  return newKey.substring(0, 1).toUpperCase() + newKey.substring(1);
}

function SpanDetail() {
  const { span, setSpan, trace, setIsOpen } = React.useContext(TraceContext);
  if (!span || !trace) return null;
  const prevSpan = () => {
    const currentIndex = trace.findIndex((t) => t.id === span.id);
    if (currentIndex !== -1 && currentIndex < trace.length - 1) {
      setSpan(trace[currentIndex + 1]);
    }
  };
  const nextSpan = () => {
    const currentIndex = trace.findIndex((t) => t.id === span.id);
    if (currentIndex !== -1 && currentIndex > 0) {
      setSpan(trace[currentIndex - 1]);
    }
  };
  const SpanIcon = spanIconMap[getSpanVariant(span)];
  const variantClass = spanVariantClasses[getSpanVariant(span)];
  return /* @__PURE__ */ jsxRuntime.jsxs("aside", { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(Header, { children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx(Button, { className: "bg-transparent border-none", onClick: prevSpan, children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronUp, {}) }) }),
        /* @__PURE__ */ jsxRuntime.jsx(Button, { className: "bg-transparent border-none", onClick: nextSpan, children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, {}) }) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsxs(Txt, { variant: "ui-lg", className: "font-medium text-icon5", as: "h2", children: [
        "Span ",
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "ml-2 text-icon3", children: span.id.substring(0, 7) })
      ] }) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "ml-auto flex items-center gap-2", children: /* @__PURE__ */ jsxRuntime.jsx(Button, { className: "bg-transparent border-none", onClick: () => setIsOpen(false), children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, {}) }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-5", children: [
      /* @__PURE__ */ jsxRuntime.jsxs(Txt, { variant: "header-md", as: "h3", className: "text-icon-6 flex items-center gap-4 pb-3", children: [
        /* @__PURE__ */ jsxRuntime.jsx(Icon, { size: "lg", className: "bg-surface4 p-1 rounded-md", children: /* @__PURE__ */ jsxRuntime.jsx(SpanIcon, { className: variantClass }) }),
        span.name
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-row gap-2 items-center", children: span.status.code === 0 ? /* @__PURE__ */ jsxRuntime.jsxs(Badge$1, { icon: /* @__PURE__ */ jsxRuntime.jsx(LatencyIcon, {}), variant: "success", children: [
        toSigFigs(span.duration / 1e3, 3),
        "ms"
      ] }) : /* @__PURE__ */ jsxRuntime.jsxs(Badge$1, { variant: "error", icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, {}), children: [
        "Failed in ",
        toSigFigs(span.duration / 1e3, 3),
        "ms"
      ] }) }),
      /* @__PURE__ */ jsxRuntime.jsx("hr", { className: "border-border1 border-sm my-5" }),
      /* @__PURE__ */ jsxRuntime.jsxs("dl", { className: "grid grid-cols-2 justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx("dt", { className: "font-medium text-ui-md text-icon3", children: "ID" }),
        /* @__PURE__ */ jsxRuntime.jsx("dd", { className: "text-ui-md text-icon6", children: span.id }),
        /* @__PURE__ */ jsxRuntime.jsx("dt", { className: "font-medium text-ui-md text-icon3", children: "Created at" }),
        /* @__PURE__ */ jsxRuntime.jsx("dd", { className: "text-ui-md text-icon6", children: span.startTime ? formatOtelTimestamp(span.startTime) : "" })
      ] }),
      span.attributes && /* @__PURE__ */ jsxRuntime.jsx(Attributes, { attributes: span.attributes }),
      span.events?.length > 0 && /* @__PURE__ */ jsxRuntime.jsx(Events, { span })
    ] })
  ] });
}
function Attributes({ attributes }) {
  if (!attributes) return null;
  const entries = Object.entries(attributes);
  if (entries.length === 0) return null;
  const keysToHide = ["http.request_id", "componentName"];
  return /* @__PURE__ */ jsxRuntime.jsx("div", { children: entries.filter(([key]) => !keysToHide.includes(key)).map(([key, val]) => {
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx("hr", { className: "border-border1 border-sm my-5" }),
      /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "h4", variant: "ui-md", className: "text-icon3 pb-2", children: transformKey(key) }),
      /* @__PURE__ */ jsxRuntime.jsx(AttributeValue, { value: val })
    ] }, key);
  }) });
}
const AttributeValue = ({ value }) => {
  if (!value)
    return /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "p", variant: "ui-md", className: "text-icon6", children: "N/A" });
  if (typeof value === "number" || typeof value === "boolean") {
    return /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "p", variant: "ui-md", className: "text-icon6", children: String(value) });
  }
  if (typeof value === "object") {
    return /* @__PURE__ */ jsxRuntime.jsx(SyntaxHighlighter, { data: value });
  }
  try {
    return /* @__PURE__ */ jsxRuntime.jsx(SyntaxHighlighter, { data: JSON.parse(value) });
  } catch {
    return /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "p", variant: "ui-md", className: "text-icon6", children: String(value) });
  }
};
function Events({ span }) {
  if (!span.events) return null;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsx("hr", { className: "border-border1 border-sm my-5" }),
    /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "p", variant: "ui-md", className: "text-icon6 pb-2", children: "Events" }),
    span.events.map((event) => {
      const isLast = event === span.events[span.events.length - 1];
      return /* @__PURE__ */ jsxRuntime.jsxs(React.Fragment, { children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsxs("dl", { className: "grid grid-cols-2 justify-between gap-2 pb-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("dt", { className: "font-medium text-ui-md text-icon3", children: "Name" }),
            /* @__PURE__ */ jsxRuntime.jsx("dd", { className: "text-ui-md text-icon6", children: event.name }),
            /* @__PURE__ */ jsxRuntime.jsx("dt", { className: "font-medium text-ui-md text-icon3", children: "Time" }),
            /* @__PURE__ */ jsxRuntime.jsx("dd", { className: "text-ui-md text-icon6", children: event.timeUnixNano ? formatOtelTimestamp2(Number(event.timeUnixNano)) : "N/A" })
          ] }),
          event.attributes?.length > 0 ? /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "space-y-2", children: event.attributes.filter((attribute) => attribute !== null).map((attribute) => /* @__PURE__ */ jsxRuntime.jsxs("li", { children: [
            /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "h4", variant: "ui-md", className: "text-icon3 pb-2", children: transformKey(attribute.key) }),
            /* @__PURE__ */ jsxRuntime.jsx(AttributeValue, { value: attribute.value })
          ] }, attribute.key)) }) : null
        ] }, event.name),
        !isLast && /* @__PURE__ */ jsxRuntime.jsx("hr", { className: "border-border1 border-sm my-5" })
      ] }, event.name);
    })
  ] });
}

const TracesSidebar = ({ onResize }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    MastraResizablePanel,
    {
      className: "h-full absolute right-0 inset-y-0 bg-surface2",
      defaultWidth: 80,
      minimumWidth: 50,
      maximumWidth: 80,
      setCurrentWidth: onResize,
      children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "h-full grid grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "overflow-x-scroll w-full h-[calc(100%-40px)]", children: /* @__PURE__ */ jsxRuntime.jsx(TraceDetails, {}) }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-[calc(100%-40px)] overflow-x-scroll w-full border-l border-border1", children: /* @__PURE__ */ jsxRuntime.jsx(SpanDetail, {}) })
      ] })
    }
  );
};

function AgentTraces({ className, traces, error }) {
  return /* @__PURE__ */ jsxRuntime.jsx(TraceProvider, { initialTraces: traces || [], children: /* @__PURE__ */ jsxRuntime.jsx(AgentTracesInner, { className, traces, error }) });
}
function AgentTracesInner({ className, traces, error }) {
  const [sidebarWidth, setSidebarWidth] = React.useState(100);
  const { isOpen: open } = React.useContext(TraceContext);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: clsx("h-full relative overflow-hidden flex", className), children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-full overflow-y-scroll w-full", children: /* @__PURE__ */ jsxRuntime.jsx(TracesTable, { traces, error }) }),
    open && /* @__PURE__ */ jsxRuntime.jsx(TracesSidebar, { width: sidebarWidth, onResize: setSidebarWidth })
  ] });
}

const convertMessage = (message) => {
  return message;
};
function MastraNetworkRuntimeProvider({
  children,
  agentId,
  initialMessages,
  memory,
  threadId,
  refreshThreadList,
  modelSettings = {}
}) {
  const [isRunning, setIsRunning] = React.useState(false);
  const [messages, setMessages] = React.useState(initialMessages || []);
  const [currentThreadId, setCurrentThreadId] = React.useState(threadId);
  const { frequencyPenalty, presencePenalty, maxRetries, maxSteps, maxTokens, temperature, topK, topP, instructions } = modelSettings;
  React.useEffect(() => {
    if (messages.length === 0 || currentThreadId !== threadId) {
      if (initialMessages && threadId && memory) {
        setMessages(initialMessages);
        setCurrentThreadId(threadId);
      }
    }
  }, [initialMessages, threadId, memory, messages]);
  const mastra = useMastraClient();
  const network = mastra.getNetwork(agentId);
  const onNew = async (message) => {
    if (message.content[0]?.type !== "text") throw new Error("Only text messages are supported");
    const input = message.content[0].text;
    setMessages((currentConversation) => [...currentConversation, { role: "user", content: input }]);
    setIsRunning(true);
    try {
      let updater = function() {
        setMessages((currentConversation) => {
          const message2 = {
            role: "assistant",
            content: [{ type: "text", text: content }]
          };
          if (!assistantMessageAdded) {
            assistantMessageAdded = true;
            return [...currentConversation, message2];
          }
          return [...currentConversation.slice(0, -1), message2];
        });
      };
      const response = await network.stream({
        messages: [
          {
            role: "user",
            content: input
          }
        ],
        runId: agentId,
        frequencyPenalty,
        presencePenalty,
        maxRetries,
        maxSteps,
        maxTokens,
        temperature,
        topK,
        topP,
        instructions,
        ...memory ? { threadId, resourceId: agentId } : {}
      });
      if (!response.body) {
        throw new Error("No response body");
      }
      const parts = [];
      let content = "";
      let currentTextPart = null;
      let assistantMessageAdded = false;
      await uiUtils.processDataStream({
        stream: response.body,
        onTextPart(value) {
          if (currentTextPart == null) {
            currentTextPart = {
              type: "text",
              text: value
            };
            parts.push(currentTextPart);
          } else {
            currentTextPart.text += value;
          }
          content += value;
          updater();
        },
        async onToolCallPart(value) {
          console.log("Tool call received:", value);
          setMessages((currentConversation) => {
            const lastMessage = currentConversation[currentConversation.length - 1];
            if (lastMessage && lastMessage.role === "assistant") {
              const updatedMessage = {
                ...lastMessage,
                content: Array.isArray(lastMessage.content) ? [
                  ...lastMessage.content,
                  {
                    type: "tool-call",
                    toolCallId: value.toolCallId,
                    toolName: value.toolName,
                    args: value.args
                  }
                ] : [
                  ...typeof lastMessage.content === "string" ? [{ type: "text", text: lastMessage.content }] : [],
                  {
                    type: "tool-call",
                    toolCallId: value.toolCallId,
                    toolName: value.toolName,
                    args: value.args
                  }
                ]
              };
              return [...currentConversation.slice(0, -1), updatedMessage];
            }
            const newMessage = {
              role: "assistant",
              content: [
                { type: "text", text: content },
                {
                  type: "tool-call",
                  toolCallId: value.toolCallId,
                  toolName: value.toolName,
                  args: value.args
                }
              ]
            };
            return [...currentConversation, newMessage];
          });
        },
        async onToolResultPart(value) {
          console.log("Tool call result received:", value);
          setMessages((currentConversation) => {
            const lastMessage = currentConversation[currentConversation.length - 1];
            if (lastMessage && lastMessage.role === "assistant" && Array.isArray(lastMessage.content)) {
              const updatedContent = lastMessage.content.map((part) => {
                if (typeof part === "object" && part.type === "tool-call" && part.toolCallId === value.toolCallId) {
                  return {
                    ...part,
                    result: value.result
                  };
                }
                return part;
              });
              const updatedMessage = {
                ...lastMessage,
                content: updatedContent
              };
              return [...currentConversation.slice(0, -1), updatedMessage];
            }
            return currentConversation;
          });
        },
        onErrorPart(error) {
          throw new Error(error);
        }
      });
      console.log(messages);
      setIsRunning(false);
    } catch (error) {
      console.error("Error occurred in MastraRuntimeProvider", error);
      setIsRunning(false);
    }
  };
  const runtime = react.useExternalStoreRuntime({
    isRunning,
    messages,
    convertMessage,
    onNew
  });
  return /* @__PURE__ */ jsxRuntime.jsxs(react.AssistantRuntimeProvider, { runtime, children: [
    " ",
    children,
    " "
  ] });
}

function MarkdownRenderer({ children }) {
  const processedText = children.replace(/\\n/g, "\n");
  return /* @__PURE__ */ jsxRuntime.jsx(Markdown, { remarkPlugins: [remarkGfm], components: COMPONENTS, className: "space-y-3", children: processedText });
}
const HighlightedPre = React.memo(({ children, language, ...props }) => {
  const [tokens, setTokens] = React.useState([]);
  React.useEffect(() => {
    highlight(children, language).then((tokens2) => {
      if (tokens2) setTokens(tokens2);
    });
  }, [children, language]);
  if (!tokens.length) {
    return /* @__PURE__ */ jsxRuntime.jsx("pre", { ...props, children });
  }
  return /* @__PURE__ */ jsxRuntime.jsx("pre", { ...props, children: /* @__PURE__ */ jsxRuntime.jsx("code", { children: tokens.map((line, lineIndex) => /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("span", { children: line.map((token, tokenIndex) => {
      const style = typeof token.htmlStyle === "string" ? void 0 : token.htmlStyle;
      return /* @__PURE__ */ jsxRuntime.jsx(
        "span",
        {
          className: "text-shiki-light bg-shiki-light-bg dark:text-shiki-dark dark:bg-shiki-dark-bg",
          style,
          children: token.content
        },
        tokenIndex
      );
    }) }, lineIndex),
    lineIndex !== tokens.length - 1 && "\n"
  ] })) }) });
});
HighlightedPre.displayName = "HighlightedCode";
const CodeBlock = ({ children, className, language, ...restProps }) => {
  const code = typeof children === "string" ? children : childrenTakeAllStringContents(children);
  const preClass = cn(
    "overflow-x-scroll rounded-md border bg-background/50 p-4 font-mono text-sm [scrollbar-width:none]",
    className
  );
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "group/code relative mb-4", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      React.Suspense,
      {
        fallback: /* @__PURE__ */ jsxRuntime.jsx("pre", { className: preClass, ...restProps, children }),
        children: /* @__PURE__ */ jsxRuntime.jsx(HighlightedPre, { language, className: preClass, children: code })
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "invisible absolute right-2 top-2 flex space-x-1 rounded-lg p-1 opacity-0 transition-all duration-200 group-hover/code:visible group-hover/code:opacity-100", children: /* @__PURE__ */ jsxRuntime.jsx(CopyButton, { content: code, copyMessage: "Copied code to clipboard" }) })
  ] });
};
function childrenTakeAllStringContents(element) {
  if (typeof element === "string") {
    return element;
  }
  if (element?.props?.children) {
    let children = element.props.children;
    if (Array.isArray(children)) {
      return children.map((child) => childrenTakeAllStringContents(child)).join("");
    } else {
      return childrenTakeAllStringContents(children);
    }
  }
  return "";
}
const COMPONENTS = {
  h1: ({ children, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("h1", { className: "text-2xl font-semibold", ...props, children }),
  h2: ({ children, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("h2", { className: "font-semibold text-xl", ...props, children }),
  h3: ({ children, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "font-semibold text-lg", ...props, children }),
  h4: ({ children, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("h4", { className: "font-semibold text-base", ...props, children }),
  h5: ({ children, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("h5", { className: "font-medium", ...props, children }),
  strong: ({ children, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("strong", { className: "font-semibold", ...props, children }),
  a: ({ children, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("a", { className: "underline underline-offset-2", ...props, children }),
  blockquote: ({ children, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("blockquote", { className: "border-l-2 border-primary pl-4", ...props, children }),
  code: ({ children, className, ...rest }) => {
    const match = /language-(\w+)/.exec(className || "");
    return match ? /* @__PURE__ */ jsxRuntime.jsx(CodeBlock, { className, language: match[1], ...rest, children }) : /* @__PURE__ */ jsxRuntime.jsx(
      "code",
      {
        className: cn(
          "font-mono [:not(pre)>&]:rounded-md [:not(pre)>&]:bg-background/50 [:not(pre)>&]:px-1 [:not(pre)>&]:py-0.5"
        ),
        ...rest,
        children
      }
    );
  },
  pre: ({ children }) => children,
  ol: ({ children, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("ol", { className: "list-decimal space-y-2 pl-6", ...props, children }),
  ul: ({ children, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "list-disc space-y-2 pl-6", ...props, children }),
  li: ({ children, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("li", { className: "my-1.5", ...props, children }),
  table: ({ children, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("table", { className: "w-full border-collapse overflow-y-auto rounded-md border border-foreground/20", ...props, children }),
  th: ({ children, ...props }) => /* @__PURE__ */ jsxRuntime.jsx(
    "th",
    {
      className: "border border-foreground/20 px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
      ...props,
      children
    }
  ),
  td: ({ children, ...props }) => /* @__PURE__ */ jsxRuntime.jsx(
    "td",
    {
      className: "border border-foreground/20 px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
      ...props,
      children
    }
  ),
  tr: ({ children, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("tr", { className: "m-0 border-t p-0 even:bg-muted", ...props, children }),
  p: ({ children, ...props }) => /* @__PURE__ */ jsxRuntime.jsx("p", { className: "whitespace-pre-wrap leading-relaxed", ...props, children }),
  hr: ({ ...props }) => /* @__PURE__ */ jsxRuntime.jsx("hr", { className: "border-foreground/20", ...props })
};

const purpleClasses = {
  bg: "bg-[rgba(124,80,175,0.25)]",
  text: "text-[rgb(180,140,230)]",
  hover: "hover:text-[rgb(200,160,250)]"};
const ToolFallback = (props) => {
  const { toolCallId, toolName, args, argsText, result, status } = props;
  const [expandedAgents, setExpandedAgents] = React.useState({});
  const actions = args?.actions || [];
  if (actions.length === 0) {
    return null;
  }
  const toggleAgent = (agentId) => {
    setExpandedAgents((prev) => ({
      ...prev,
      [agentId]: !prev[agentId]
    }));
  };
  const extractUrls = (text) => {
    if (typeof text !== "string") return [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mb-4 w-full rounded-lg border border-gray-700 overflow-hidden shadow-md", children: actions.map((action, index) => {
    const agentId = `${toolCallId || "tool"}-${action.agent}-${index}`;
    const isExpanded = expandedAgents[agentId] || false;
    const urls = result ? extractUrls(result) : [];
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `border-b border-gray-700 ${index === actions.length - 1 ? "border-b-0" : ""}`, children: [
      /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          className: "flex items-center justify-between px-4 py-3 bg-gray-900 hover:bg-gray-800 cursor-pointer",
          onClick: () => toggleAgent(agentId),
          children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("flex h-6 w-6 items-center justify-center rounded-full", purpleClasses.bg), children: status?.type === "running" ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.LoaderCircle, { className: cn("h-4 w-4 animate-spin", purpleClasses.text) }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CheckIcon, { className: cn("h-4 w-4", purpleClasses.text) }) }),
              /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx("p", { className: "font-medium text-sm text-gray-100", children: action.agent?.replaceAll("_", " ") }) })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: cn("text-xs px-2 py-1 rounded-full", purpleClasses.bg, purpleClasses.text), children: status?.type === "running" ? "Processing..." : "Complete" }),
              isExpanded ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronUpIcon, { className: "h-4 w-4 text-gray-300" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDownIcon, { className: "h-4 w-4 text-gray-300" })
            ] })
          ]
        }
      ),
      isExpanded && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-4 py-3 bg-[#111]", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs font-semibold text-gray-300 mb-1", children: "Query:" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-2 bg-gray-900 rounded border border-gray-700", children: /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-200 whitespace-pre-wrap", children: action.input }) })
        ] }),
        result && /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs font-semibold text-gray-300 mb-1", children: "Result:" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-2 bg-gray-900 rounded border border-gray-700 max-h-60 overflow-auto", children: typeof result === "string" ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-sm text-gray-200", children: /* @__PURE__ */ jsxRuntime.jsx(MarkdownRenderer, { children: result }) }) : /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm text-gray-200 whitespace-pre-wrap", children: JSON.stringify(result, null, 2) }) }),
          urls.length > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-xs font-semibold text-gray-300 mb-1", children: "Sources:" }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap gap-2", children: [
              urls.slice(0, 3).map((url, i) => /* @__PURE__ */ jsxRuntime.jsxs(
                "a",
                {
                  href: url,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: cn(
                    "inline-flex items-center gap-1 text-xs hover:underline",
                    purpleClasses.text,
                    purpleClasses.hover
                  ),
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
                      "Source ",
                      i + 1
                    ] }),
                    /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ExternalLinkIcon, { className: "h-3 w-3" })
                  ]
                },
                i
              )),
              urls.length > 3 && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-xs text-gray-400", children: [
                "+",
                urls.length - 3,
                " more"
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }, agentId);
  }) });
};

const defaultModelSettings = {
  maxRetries: 2,
  maxSteps: 5,
  temperature: 0.5,
  topP: 1
};
const NetworkContext = React.createContext({});
function NetworkProvider({ children }) {
  const [modelSettings, setModelSettings] = React.useState(defaultModelSettings);
  const resetModelSettings = () => {
    setModelSettings(defaultModelSettings);
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    NetworkContext.Provider,
    {
      value: {
        modelSettings,
        setModelSettings,
        resetModelSettings
      },
      children
    }
  );
}

const NetworkChat = ({ agentId, memory }) => {
  const { modelSettings } = React.useContext(NetworkContext);
  return /* @__PURE__ */ jsxRuntime.jsx(MastraNetworkRuntimeProvider, { agentId, memory, modelSettings, children: /* @__PURE__ */ jsxRuntime.jsx(Thread, { ToolFallback }) });
};

function WorkflowTraces({ traces, error, runId, stepName }) {
  return /* @__PURE__ */ jsxRuntime.jsx(TraceProvider, { initialTraces: traces || [], children: /* @__PURE__ */ jsxRuntime.jsx(WorkflowTracesInner, { traces, error, runId, stepName }) });
}
function WorkflowTracesInner({ traces, error, runId, stepName }) {
  const hasRunRef = React.useRef(false);
  const [sidebarWidth, setSidebarWidth] = React.useState(100);
  const { isOpen: open, setTrace, setIsOpen, setSpan } = React.useContext(TraceContext);
  React.useEffect(() => {
    if (hasRunRef.current) return;
    if (!runId || !stepName) return;
    const matchingTrace = traces.find((trace) => trace.runId === runId);
    if (!matchingTrace) return;
    const matchingSpan = matchingTrace.trace.find((span) => span.name.includes(stepName));
    if (!matchingSpan) return;
    setTrace(matchingTrace.trace);
    setSpan(matchingSpan);
    setIsOpen(true);
    hasRunRef.current = true;
  }, [runId, traces, setTrace]);
  return /* @__PURE__ */ jsxRuntime.jsxs("main", { className: "h-full relative overflow-hidden flex", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-full overflow-y-scroll w-full", children: /* @__PURE__ */ jsxRuntime.jsx(TracesTable, { traces, error }) }),
    open && /* @__PURE__ */ jsxRuntime.jsx(TracesSidebar, { width: sidebarWidth, onResize: setSidebarWidth })
  ] });
}

function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: cn("animate-pulse rounded-md bg-muted/50", className), ...props });
}

const useLegacyWorkflow = (workflowId) => {
  const [legacyWorkflow, setLegacyWorkflow] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const client = useMastraClient();
  React.useEffect(() => {
    const fetchWorkflow = async () => {
      setIsLoading(true);
      try {
        if (!workflowId) {
          setLegacyWorkflow(null);
          setIsLoading(false);
          return;
        }
        const res = await client.getLegacyWorkflow(workflowId).details();
        if (!res) {
          setLegacyWorkflow(null);
          console.error("Error fetching legacy workflow");
          sonner.toast.error("Error fetching legacy workflow");
          return;
        }
        const steps = res.steps;
        const stepsWithWorkflow = await Promise.all(
          Object.values(steps)?.map(async (step) => {
            if (!step.workflowId) return step;
            const wFlow = await client.getLegacyWorkflow(step.workflowId).details();
            if (!wFlow) return step;
            return { ...step, stepGraph: wFlow.stepGraph, stepSubscriberGraph: wFlow.stepSubscriberGraph };
          })
        );
        const _steps = stepsWithWorkflow.reduce((acc, b) => {
          return { ...acc, [b.id]: b };
        }, {});
        setLegacyWorkflow({ ...res, steps: _steps });
      } catch (error) {
        setLegacyWorkflow(null);
        console.error("Error fetching legacy workflow", error);
        sonner.toast.error("Error fetching legacy workflow");
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkflow();
  }, [workflowId]);
  return { legacyWorkflow, isLoading };
};
const useExecuteWorkflow = () => {
  const client = useMastraClient();
  const createLegacyWorkflowRun = async ({ workflowId, prevRunId }) => {
    try {
      const workflow = client.getLegacyWorkflow(workflowId);
      const { runId: newRunId } = await workflow.createRun({ runId: prevRunId });
      return { runId: newRunId };
    } catch (error) {
      console.error("Error creating workflow run:", error);
      throw error;
    }
  };
  const startLegacyWorkflowRun = async ({
    workflowId,
    runId,
    input
  }) => {
    try {
      const workflow = client.getLegacyWorkflow(workflowId);
      await workflow.start({ runId, triggerData: input || {} });
    } catch (error) {
      console.error("Error starting workflow run:", error);
      throw error;
    }
  };
  return {
    startLegacyWorkflowRun,
    createLegacyWorkflowRun
  };
};
const useWatchWorkflow = () => {
  const [isWatchingLegacyWorkflow, setIsWatchingLegacyWorkflow] = React.useState(false);
  const [legacyWatchResult, setLegacyWatchResult] = React.useState(null);
  const client = useMastraClient();
  const debouncedSetLegacyWorkflowWatchResult = useDebounce.useDebouncedCallback((record) => {
    const formattedResults = Object.entries(record.results || {}).reduce(
      (acc, [key, value]) => {
        let output = value.status === "success" ? value.output : void 0;
        if (output) {
          output = Object.entries(output).reduce(
            (_acc, [_key, _value]) => {
              const val = _value;
              _acc[_key] = val.type?.toLowerCase() === "buffer" ? { type: "Buffer", data: `[...buffered data]` } : val;
              return _acc;
            },
            {}
          );
        }
        acc[key] = { ...value, output };
        return acc;
      },
      {}
    );
    const sanitizedRecord = {
      ...record,
      sanitizedOutput: record ? JSON.stringify({ ...record, results: formattedResults }, null, 2).slice(0, 5e4) : null
    };
    setLegacyWatchResult(sanitizedRecord);
  }, 100);
  const watchLegacyWorkflow = async ({ workflowId, runId }) => {
    try {
      setIsWatchingLegacyWorkflow(true);
      const workflow = client.getLegacyWorkflow(workflowId);
      await workflow.watch({ runId }, (record) => {
        try {
          debouncedSetLegacyWorkflowWatchResult(record);
        } catch (err) {
          console.error("Error processing workflow record:", err);
          setLegacyWatchResult({
            ...record
          });
        }
      });
    } catch (error) {
      console.error("Error watching workflow:", error);
      throw error;
    } finally {
      setIsWatchingLegacyWorkflow(false);
    }
  };
  return {
    watchLegacyWorkflow,
    isWatchingLegacyWorkflow,
    legacyWatchResult
  };
};
const useResumeWorkflow = () => {
  const [isResumingLegacyWorkflow, setIsResumingLegacyWorkflow] = React.useState(false);
  const client = useMastraClient();
  const resumeLegacyWorkflow = async ({
    workflowId,
    stepId,
    runId,
    context
  }) => {
    try {
      setIsResumingLegacyWorkflow(true);
      const response = await client.getLegacyWorkflow(workflowId).resume({ stepId, runId, context });
      return response;
    } catch (error) {
      console.error("Error resuming workflow:", error);
      throw error;
    } finally {
      setIsResumingLegacyWorkflow(false);
    }
  };
  return {
    resumeLegacyWorkflow,
    isResumingLegacyWorkflow
  };
};

function extractConditions(group, type) {
  let result = [];
  if (!group) return result;
  function recurse(group2, conj) {
    if (typeof group2 === "string") {
      result.push({ type, fnString: group2 });
    } else {
      const simpleCondition = Object.entries(group2).find(([key]) => key.includes("."));
      if (simpleCondition) {
        const [key, queryValue] = simpleCondition;
        const [stepId, ...pathParts] = key.split(".");
        const ref = {
          step: {
            id: stepId
          },
          path: pathParts.join(".")
        };
        result.push({
          type,
          ref,
          query: { [queryValue === true || queryValue === false ? "is" : "eq"]: String(queryValue) },
          conj
        });
      }
      if ("ref" in group2) {
        const { ref, query } = group2;
        result.push({ type, ref, query, conj });
      }
      if ("and" in group2) {
        for (const subGroup of group2.and) {
          recurse({ ...subGroup }, "and");
        }
      }
      if ("or" in group2) {
        for (const subGroup of group2.or) {
          recurse({ ...subGroup }, "or");
        }
      }
      if ("not" in group2) {
        recurse({ ...group2.not }, "not");
      }
    }
  }
  recurse(group);
  return result.reverse();
}
const getLayoutedElements = (nodes, edges) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB" });
  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach(
    (node) => g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 274,
      height: node.measured?.height ?? (node?.data?.isLarge ? 260 : 100)
    })
  );
  Dagre.layout(g);
  const fullWidth = g.graph()?.width ? g.graph().width / 2 : 0;
  const fullHeight = g.graph()?.height ? g.graph().height / 2 : 0;
  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      const positionX = position.x - (node.measured?.width ?? 274) / 2;
      const positionY = position.y - (node.measured?.height ?? (node?.data?.isLarge ? 260 : 100)) / 2;
      const x = positionX;
      const y = positionY;
      return { ...node, position: { x, y } };
    }),
    edges,
    fullWidth,
    fullHeight
  };
};
const defaultEdgeOptions = {
  animated: true,
  markerEnd: {
    type: react$2.MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: "#8e8e8e"
  }
};
const contructLegacyNodesAndEdges = ({
  stepGraph,
  stepSubscriberGraph,
  steps: mainSteps = {}
}) => {
  if (!stepGraph) {
    return { nodes: [], edges: [] };
  }
  const { initial, ...stepsList } = stepGraph;
  if (!initial.length) {
    return { nodes: [], edges: [] };
  }
  let nodes = [];
  let edges = [];
  let allSteps = [];
  for (const [_index, _step] of initial.entries()) {
    const step = _step.step;
    const stepId = step.id;
    const steps = [_step, ...stepsList?.[stepId] || []]?.reduce((acc, step2, i) => {
      const { stepGraph: stepWflowGraph, stepSubscriberGraph: stepWflowSubscriberGraph } = mainSteps[step2.step.id] || {};
      const hasGraph = !!stepWflowGraph;
      const nodeId = nodes.some((node) => node.id === step2.step.id) ? `${step2.step.id}-${i}` : step2.step.id;
      let newStep = {
        ...step2.step,
        label: step2.step.id,
        originalId: step2.step.id,
        type: hasGraph ? "nested-node" : "default-node",
        id: nodeId,
        stepGraph: stepWflowGraph,
        stepSubscriberGraph: stepWflowSubscriberGraph
      };
      let conditionType = "when";
      if (step2.config?.serializedWhen) {
        conditionType = step2.step.id?.endsWith("_if") ? "if" : step2.step.id?.endsWith("_else") ? "else" : "when";
        const conditions = extractConditions(step2.config.serializedWhen, conditionType);
        const conditionStep = {
          id: crypto.randomUUID(),
          conditions,
          type: "condition-node",
          isLarge: (conditions?.length > 1 || conditions.some(({ fnString }) => !!fnString)) && conditionType !== "else"
        };
        acc.push(conditionStep);
      }
      if (conditionType === "if" || conditionType === "else") {
        newStep = {
          ...newStep,
          label: conditionType === "if" ? "start if" : "start else"
        };
      }
      newStep = {
        ...newStep,
        label: step2.config?.loopLabel || newStep.label
      };
      acc.push(newStep);
      return acc;
    }, []);
    allSteps = [...allSteps, ...steps];
    const newNodes = [...steps].map((step2, index) => {
      const subscriberGraph = stepSubscriberGraph?.[step2.id];
      return {
        id: step2.id,
        position: { x: _index * 300, y: index * 100 },
        type: step2.type,
        data: {
          conditions: step2.conditions,
          label: step2.label,
          description: step2.description,
          withoutTopHandle: subscriberGraph?.[step2.id] ? false : index === 0,
          withoutBottomHandle: subscriberGraph ? false : index === steps.length - 1,
          isLarge: step2.isLarge,
          stepGraph: step2.stepGraph,
          stepSubscriberGraph: step2.stepSubscriberGraph
        }
      };
    });
    nodes = [...nodes, ...newNodes];
    const edgeSteps = [...steps].slice(0, -1);
    const newEdges = edgeSteps.map((step2, index) => ({
      id: `e${step2.id}-${steps[index + 1].id}`,
      source: step2.id,
      target: steps[index + 1].id,
      ...defaultEdgeOptions
    }));
    edges = [...edges, ...newEdges];
  }
  if (!stepSubscriberGraph || !Object.keys(stepSubscriberGraph).length) {
    const { nodes: layoutedNodes2, edges: layoutedEdges2 } = getLayoutedElements(nodes, edges);
    return { nodes: layoutedNodes2, edges: layoutedEdges2 };
  }
  for (const [connectingStepId, stepInfoGraph] of Object.entries(stepSubscriberGraph)) {
    const { initial: initial2, ...stepsList2 } = stepInfoGraph;
    let untilOrWhileConditionId;
    const loopResultSteps = [];
    let finishedLoopStep;
    let otherLoopStep;
    if (initial2.length) {
      for (const [_index, _step] of initial2.entries()) {
        const step = _step.step;
        const stepId = step.id;
        const steps = [_step, ...stepsList2?.[stepId] || []]?.reduce((acc, step2, i) => {
          const { stepGraph: stepWflowGraph, stepSubscriberGraph: stepWflowSubscriberGraph } = mainSteps[step2.step.id] || {};
          const hasGraph = !!stepWflowGraph;
          const nodeId = nodes.some((node) => node.id === step2.step.id) ? `${step2.step.id}-${i}` : step2.step.id;
          let newStep = {
            ...step2.step,
            originalId: step2.step.id,
            label: step2.step.id,
            type: hasGraph ? "nested-node" : "default-node",
            id: nodeId,
            stepGraph: stepWflowGraph,
            stepSubscriberGraph: stepWflowSubscriberGraph
          };
          let conditionType = "when";
          const isFinishedLoop = step2.config?.loopLabel?.endsWith("loop finished");
          if (step2.config?.serializedWhen && !isFinishedLoop) {
            conditionType = step2.step.id?.endsWith("_if") ? "if" : step2.step.id?.endsWith("_else") ? "else" : step2.config?.loopType ?? "when";
            const conditions = extractConditions(step2.config.serializedWhen, conditionType);
            const conditionStep = {
              id: crypto.randomUUID(),
              conditions,
              type: "condition-node",
              isLarge: (conditions?.length > 1 || conditions.some(({ fnString }) => !!fnString)) && conditionType !== "else"
            };
            if (conditionType === "until" || conditionType === "while") {
              untilOrWhileConditionId = conditionStep.id;
            }
            acc.push(conditionStep);
          }
          if (isFinishedLoop) {
            const loopResultStep = {
              id: crypto.randomUUID(),
              type: "loop-result-node",
              loopType: "finished",
              loopResult: step2.config.loopType === "until" ? true : false
            };
            loopResultSteps.push(loopResultStep);
            acc.push(loopResultStep);
          }
          if (!isFinishedLoop && step2.config?.loopType) {
            const loopResultStep = {
              id: crypto.randomUUID(),
              type: "loop-result-node",
              loopType: step2.config.loopType,
              loopResult: step2.config.loopType === "until" ? false : true
            };
            loopResultSteps.push(loopResultStep);
            acc.push(loopResultStep);
          }
          if (conditionType === "if" || conditionType === "else") {
            newStep = {
              ...newStep,
              label: conditionType === "if" ? "start if" : "start else"
            };
          }
          if (step2.config.loopType) {
            if (isFinishedLoop) {
              finishedLoopStep = newStep;
            } else {
              otherLoopStep = newStep;
            }
          }
          newStep = {
            ...newStep,
            loopType: isFinishedLoop ? "finished" : step2.config.loopType,
            label: step2.config?.loopLabel || newStep.label
          };
          acc.push(newStep);
          return acc;
        }, []);
        let afterStep = [];
        let afterStepStepList = connectingStepId?.includes("&&") ? connectingStepId.split("&&") : [];
        if (connectingStepId?.includes("&&")) {
          afterStep = [
            {
              id: connectingStepId,
              label: connectingStepId,
              type: "after-node",
              steps: afterStepStepList
            }
          ];
        }
        const newNodes = [...steps, ...afterStep].map((step2, index) => {
          const subscriberGraph = stepSubscriberGraph?.[step2.id];
          const withBottomHandle = step2.originalId === connectingStepId || subscriberGraph;
          return {
            id: step2.id,
            position: { x: _index * 300 + 300, y: index * 100 + 100 },
            type: step2.type,
            data: {
              conditions: step2.conditions,
              label: step2.label,
              description: step2.description,
              result: step2.loopResult,
              loopType: step2.loopType,
              steps: step2.steps,
              withoutBottomHandle: withBottomHandle ? false : index === steps.length - 1,
              isLarge: step2.isLarge,
              stepGraph: step2.stepGraph,
              stepSubscriberGraph: step2.stepSubscriberGraph
            }
          };
        });
        nodes = [...nodes, ...newNodes].map((node) => ({
          ...node,
          data: {
            ...node.data,
            withoutBottomHandle: afterStepStepList.includes(node.id) ? false : node.data.withoutBottomHandle
          }
        }));
        const edgeSteps = [...steps].slice(0, -1);
        const firstEdgeStep = steps[0];
        const lastEdgeStep = steps[steps.length - 1];
        const afterEdges = afterStepStepList?.map((step2) => ({
          id: `e${step2}-${connectingStepId}`,
          source: step2,
          target: connectingStepId,
          ...defaultEdgeOptions
        }));
        const finishedLoopResult = loopResultSteps?.find((step2) => step2.loopType === "finished");
        const newEdges = edgeSteps.map((step2, index) => ({
          id: `e${step2.id}-${steps[index + 1].id}`,
          source: step2.id,
          target: steps[index + 1].id,
          remove: finishedLoopResult?.id === steps[index + 1].id,
          //remove if target is a finished loop result
          ...defaultEdgeOptions
        }))?.filter((edge) => !edge.remove);
        const connectingEdge = connectingStepId === firstEdgeStep.id ? [] : [
          {
            id: `e${connectingStepId}-${firstEdgeStep.id}`,
            source: connectingStepId,
            target: firstEdgeStep.id,
            remove: finishedLoopResult?.id === firstEdgeStep.id,
            ...defaultEdgeOptions
          }
        ]?.filter((edge) => !edge.remove);
        const lastEdge = lastEdgeStep.originalId === connectingStepId ? [
          {
            id: `e${lastEdgeStep.id}-${connectingStepId}`,
            source: lastEdgeStep.id,
            target: connectingStepId,
            ...defaultEdgeOptions
          }
        ] : [];
        edges = [...edges, ...afterEdges, ...connectingEdge, ...newEdges, ...lastEdge];
        allSteps = [...allSteps, ...steps];
      }
      if (untilOrWhileConditionId && loopResultSteps.length && finishedLoopStep && otherLoopStep) {
        const loopResultStepsEdges = loopResultSteps.map((step) => ({
          id: `e${untilOrWhileConditionId}-${step.id}`,
          source: untilOrWhileConditionId,
          target: step.id,
          ...defaultEdgeOptions
        }));
        const finishedLoopResult = loopResultSteps?.find((res) => res.loopType === "finished");
        const otherLoopResult = loopResultSteps?.find((res) => res.loopType !== "finished");
        const otherLoopEdge = {
          id: `e${otherLoopResult?.id}-${otherLoopStep?.id}`,
          source: otherLoopResult?.id,
          target: otherLoopStep.id,
          ...defaultEdgeOptions
        };
        const finishedLoopEdge = {
          id: `e${finishedLoopResult?.id}-${finishedLoopStep?.id}`,
          source: finishedLoopResult?.id,
          target: finishedLoopStep.id,
          ...defaultEdgeOptions
        };
        edges = [...edges, ...loopResultStepsEdges, otherLoopEdge, finishedLoopEdge];
      }
    }
  }
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
  return { nodes: layoutedNodes, edges: layoutedEdges };
};
const getStepNodeAndEdge = ({
  stepFlow,
  xIndex,
  yIndex,
  prevNodeIds,
  prevStepIds,
  nextStepFlow,
  condition,
  allPrevNodeIds
}) => {
  let nextNodeIds = [];
  let nextStepIds = [];
  if (nextStepFlow?.type === "step" || nextStepFlow?.type === "foreach" || nextStepFlow?.type === "loop") {
    const nextStepId = allPrevNodeIds?.includes(nextStepFlow.step.id) ? `${nextStepFlow.step.id}-${yIndex + 1}` : nextStepFlow.step.id;
    nextNodeIds = [nextStepId];
    nextStepIds = [nextStepFlow.step.id];
  }
  if (nextStepFlow?.type === "parallel") {
    nextNodeIds = nextStepFlow?.steps.map((step) => {
      const stepId = step.step.id;
      const nextStepId = allPrevNodeIds?.includes(stepId) ? `${stepId}-${yIndex + 1}` : stepId;
      return nextStepId;
    }) || [];
    nextStepIds = nextStepFlow?.steps.map((step) => step.step.id) || [];
  }
  if (nextStepFlow?.type === "conditional") {
    nextNodeIds = nextStepFlow?.serializedConditions.map((cond) => cond.id) || [];
    nextStepIds = nextStepFlow?.steps?.map((step) => step.step.id) || [];
  }
  if (stepFlow.type === "step" || stepFlow.type === "foreach") {
    const hasGraph = stepFlow.step.component === "WORKFLOW";
    const nodeId = allPrevNodeIds?.includes(stepFlow.step.id) ? `${stepFlow.step.id}-${yIndex}` : stepFlow.step.id;
    const nodes = [
      ...condition ? [
        {
          id: condition.id,
          position: { x: xIndex * 300, y: yIndex * 100 },
          type: "condition-node",
          data: {
            label: condition.id,
            previousStepId: prevStepIds[prevStepIds.length - 1],
            nextStepId: stepFlow.step.id,
            withoutTopHandle: false,
            withoutBottomHandle: !nextNodeIds.length,
            isLarge: true,
            conditions: [{ type: "when", fnString: condition.fn }]
          }
        }
      ] : [],
      {
        id: nodeId,
        position: { x: xIndex * 300, y: (yIndex + (condition ? 1 : 0)) * 100 },
        type: hasGraph ? "nested-node" : "default-node",
        data: {
          label: stepFlow.step.id,
          description: stepFlow.step.description,
          withoutTopHandle: condition ? false : !prevNodeIds.length,
          withoutBottomHandle: !nextNodeIds.length,
          stepGraph: hasGraph ? stepFlow.step.serializedStepFlow : void 0,
          mapConfig: stepFlow.step.mapConfig
        }
      }
    ];
    const edges = [
      ...!prevNodeIds.length ? [] : condition ? [
        ...prevNodeIds.map((prevNodeId, i) => ({
          id: `e${prevNodeId}-${condition.id}`,
          source: prevNodeId,
          data: { previousStepId: prevStepIds[i], nextStepId: stepFlow.step.id },
          target: condition.id,
          ...defaultEdgeOptions
        })),
        {
          id: `e${condition.id}-${nodeId}`,
          source: condition.id,
          data: { previousStepId: prevStepIds[prevStepIds.length - 1], nextStepId: stepFlow.step.id },
          target: nodeId,
          ...defaultEdgeOptions
        }
      ] : prevNodeIds.map((prevNodeId, i) => ({
        id: `e${prevNodeId}-${nodeId}`,
        source: prevNodeId,
        data: { previousStepId: prevStepIds[i], nextStepId: stepFlow.step.id },
        target: nodeId,
        ...defaultEdgeOptions
      })),
      ...!nextNodeIds.length ? [] : nextNodeIds.map((nextNodeId, i) => ({
        id: `e${nodeId}-${nextNodeId}`,
        source: nodeId,
        data: { previousStepId: stepFlow.step.id, nextStepId: nextStepIds[i] },
        target: nextNodeId,
        ...defaultEdgeOptions
      }))
    ];
    return { nodes, edges, nextPrevNodeIds: [nodeId], nextPrevStepIds: [stepFlow.step.id] };
  }
  if (stepFlow.type === "loop") {
    const { step: _step, serializedCondition, loopType } = stepFlow;
    const hasGraph = _step.component === "WORKFLOW";
    const nodes = [
      {
        id: _step.id,
        position: { x: xIndex * 300, y: yIndex * 100 },
        type: hasGraph ? "nested-node" : "default-node",
        data: {
          label: _step.id,
          description: _step.description,
          withoutTopHandle: !prevNodeIds.length,
          withoutBottomHandle: false,
          stepGraph: hasGraph ? _step.serializedStepFlow : void 0
        }
      },
      {
        id: serializedCondition.id,
        position: { x: xIndex * 300, y: (yIndex + 1) * 100 },
        type: "condition-node",
        data: {
          label: serializedCondition.id,
          // conditionStepId: _step.id,
          previousStepId: _step.id,
          nextStepId: nextStepIds[0],
          withoutTopHandle: false,
          withoutBottomHandle: !nextNodeIds.length,
          isLarge: true,
          conditions: [{ type: loopType, fnString: serializedCondition.fn }]
        }
      }
    ];
    const edges = [
      ...!prevNodeIds.length ? [] : prevNodeIds.map((prevNodeId, i) => ({
        id: `e${prevNodeId}-${_step.id}`,
        source: prevNodeId,
        data: { previousStepId: prevStepIds[i], nextStepId: _step.id },
        target: _step.id,
        ...defaultEdgeOptions
      })),
      {
        id: `e${_step.id}-${serializedCondition.id}`,
        source: _step.id,
        data: { previousStepId: _step.id, nextStepId: nextStepIds[0] },
        target: serializedCondition.id,
        ...defaultEdgeOptions
      },
      ...!nextNodeIds.length ? [] : nextNodeIds.map((nextNodeId, i) => ({
        id: `e${serializedCondition.id}-${nextNodeId}`,
        source: serializedCondition.id,
        data: { previousStepId: _step.id, nextStepId: nextStepIds[i] },
        target: nextNodeId,
        ...defaultEdgeOptions
      }))
    ];
    return { nodes, edges, nextPrevNodeIds: [serializedCondition.id], nextPrevStepIds: [_step.id] };
  }
  if (stepFlow.type === "parallel") {
    let nodes = [];
    let edges = [];
    let nextPrevStepIds = [];
    stepFlow.steps.forEach((_stepFlow, index) => {
      const {
        nodes: _nodes,
        edges: _edges,
        nextPrevStepIds: _nextPrevStepIds
      } = getStepNodeAndEdge({
        stepFlow: _stepFlow,
        xIndex: index,
        yIndex,
        prevNodeIds,
        prevStepIds,
        nextStepFlow,
        allPrevNodeIds
      });
      nodes.push(..._nodes);
      edges.push(..._edges);
      nextPrevStepIds.push(..._nextPrevStepIds);
    });
    return { nodes, edges, nextPrevNodeIds: nodes.map((node) => node.id), nextPrevStepIds };
  }
  if (stepFlow.type === "conditional") {
    let nodes = [];
    let edges = [];
    let nextPrevStepIds = [];
    stepFlow.steps.forEach((_stepFlow, index) => {
      const {
        nodes: _nodes,
        edges: _edges,
        nextPrevStepIds: _nextPrevStepIds
      } = getStepNodeAndEdge({
        stepFlow: _stepFlow,
        xIndex: index,
        yIndex,
        prevNodeIds,
        prevStepIds,
        nextStepFlow,
        condition: stepFlow.serializedConditions[index],
        allPrevNodeIds
      });
      nodes.push(..._nodes);
      edges.push(..._edges);
      nextPrevStepIds.push(..._nextPrevStepIds);
    });
    return {
      nodes,
      edges,
      nextPrevNodeIds: nodes.filter(({ type }) => type !== "condition-node").map((node) => node.id),
      nextPrevStepIds
    };
  }
  return { nodes: [], edges: [], nextPrevNodeIds: [], nextPrevStepIds: [] };
};
const constructNodesAndEdges = ({
  stepGraph
}) => {
  if (!stepGraph) {
    return { nodes: [], edges: [] };
  }
  if (stepGraph.length === 0) {
    return { nodes: [], edges: [] };
  }
  let nodes = [];
  let edges = [];
  let prevNodeIds = [];
  let prevStepIds = [];
  let allPrevNodeIds = [];
  for (let index = 0; index < stepGraph.length; index++) {
    const {
      nodes: _nodes,
      edges: _edges,
      nextPrevNodeIds,
      nextPrevStepIds
    } = getStepNodeAndEdge({
      stepFlow: stepGraph[index],
      xIndex: index,
      yIndex: index,
      prevNodeIds,
      prevStepIds,
      nextStepFlow: index === stepGraph.length - 1 ? void 0 : stepGraph[index + 1],
      allPrevNodeIds
    });
    nodes.push(..._nodes);
    edges.push(..._edges);
    prevNodeIds = nextPrevNodeIds;
    prevStepIds = nextPrevStepIds;
    allPrevNodeIds.push(...prevNodeIds);
  }
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
  return { nodes: layoutedNodes, edges: layoutedEdges };
};

const textVariants = cva("block", {
  variants: {
    variant: {
      primary: "text-text",
      secondary: "text-text-dim"
    },
    size: {
      default: "text-base",
      xs: "text-xs",
      sm: "text-sm",
      md: "text-md",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl"
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold"
    }
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
    weight: "normal"
  }
});
const Text = ({ className, weight, variant, as: Tag = "span", size, ...props }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(Tag, { className: cn(textVariants({ size, variant, weight, className })), ...props });
};

const Collapsible = CollapsiblePrimitive__namespace.Root;
const CollapsibleTrigger = CollapsiblePrimitive__namespace.CollapsibleTrigger;
const CollapsibleContent = CollapsiblePrimitive__namespace.CollapsibleContent;

const ScrollArea = React__namespace.forwardRef(
  ({ className, children, viewPortClassName, maxHeight, autoScroll = false, ...props }, ref) => {
    const areaRef = React__namespace.useRef(null);
    useAutoscroll(areaRef, { enabled: autoScroll });
    return /* @__PURE__ */ jsxRuntime.jsxs(ScrollAreaPrimitive__namespace.Root, { ref, className: cn("relative overflow-hidden", className), ...props, children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        ScrollAreaPrimitive__namespace.Viewport,
        {
          ref: areaRef,
          className: cn("h-full w-full rounded-[inherit] [&>div]:!block", viewPortClassName),
          style: maxHeight ? { maxHeight } : void 0,
          children
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(ScrollBar, {}),
      /* @__PURE__ */ jsxRuntime.jsx(ScrollAreaPrimitive__namespace.Corner, {})
    ] });
  }
);
ScrollArea.displayName = ScrollAreaPrimitive__namespace.Root.displayName;
const ScrollBar = React__namespace.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  ScrollAreaPrimitive__namespace.ScrollAreaScrollbar,
  {
    ref,
    orientation,
    className: cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(ScrollAreaPrimitive__namespace.ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" })
  }
));
ScrollBar.displayName = ScrollAreaPrimitive__namespace.ScrollAreaScrollbar.displayName;

function convertWorkflowRunStateToWatchResult(runState) {
  const runId = runState.runId;
  const steps = {};
  const context = runState.context || {};
  Object.entries(context).forEach(([stepId, stepResult]) => {
    if (stepId !== "input" && "status" in stepResult) {
      const result = stepResult;
      steps[stepId] = {
        status: result.status,
        output: "output" in result ? result.output : void 0,
        payload: "payload" in result ? result.payload : void 0,
        resumePayload: "resumePayload" in result ? result.resumePayload : void 0,
        error: "error" in result ? result.error : void 0,
        startedAt: "startedAt" in result ? result.startedAt : Date.now(),
        endedAt: "endedAt" in result ? result.endedAt : void 0,
        suspendedAt: "suspendedAt" in result ? result.suspendedAt : void 0,
        resumedAt: "resumedAt" in result ? result.resumedAt : void 0
      };
    }
  });
  const status = determineWorkflowStatus(steps);
  return {
    type: "watch",
    payload: {
      workflowState: {
        status,
        steps,
        result: runState.value,
        payload: context.input,
        error: void 0
      }
    },
    eventTimestamp: new Date(runState.timestamp),
    runId
  };
}
function determineWorkflowStatus(steps) {
  const stepStatuses = Object.values(steps).map((step) => step.status);
  if (stepStatuses.includes("failed")) {
    return "failed";
  }
  if (stepStatuses.includes("suspended")) {
    return "suspended";
  }
  if (stepStatuses.every((status) => status === "success")) {
    return "success";
  }
  return "running";
}

const WorkflowRunContext = React.createContext({});
function WorkflowRunProvider({
  children,
  snapshot
}) {
  const [legacyResult, setLegacyResult] = React.useState(null);
  const [result, setResult] = React.useState(
    () => snapshot ? convertWorkflowRunStateToWatchResult(snapshot) : null
  );
  const [payload, setPayload] = React.useState(null);
  const clearData = () => {
    setLegacyResult(null);
    setResult(null);
    setPayload(null);
  };
  React.useEffect(() => {
    if (snapshot?.runId) {
      setResult(convertWorkflowRunStateToWatchResult(snapshot));
    } else {
      setResult(null);
    }
  }, [snapshot?.runId ?? ""]);
  return /* @__PURE__ */ jsxRuntime.jsx(
    WorkflowRunContext.Provider,
    {
      value: {
        legacyResult,
        setLegacyResult,
        result,
        setResult,
        payload,
        setPayload,
        clearData,
        snapshot
      },
      children
    }
  );
}

const useCurrentRun = () => {
  const context = React.useContext(WorkflowRunContext);
  const workflowCurrentSteps = context.result?.payload?.workflowState?.steps ?? {};
  const steps = Object.entries(workflowCurrentSteps).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: {
        error: value.error,
        startedAt: value.startedAt,
        endedAt: value.endedAt,
        status: value.status,
        output: value.output,
        input: value.payload
      }
    };
  }, {});
  return { steps, isRunning: Boolean(context.payload), runId: context.result?.runId };
};

const CodeDialogContent = ({ data }) => {
  const theme = useCodemirrorTheme();
  if (typeof data !== "string") {
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "max-h-[500px] overflow-auto relative p-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute right-2 top-2 bg-surface4 rounded-full z-10", children: /* @__PURE__ */ jsxRuntime.jsx(CopyButton, { content: JSON.stringify(data, null, 2) }) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "bg-surface4 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntime.jsx(CodeMirror, { value: JSON.stringify(data, null, 2), theme, extensions: [langJson.jsonLanguage] }) })
    ] });
  }
  try {
    const json = JSON.parse(data);
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "max-h-[500px] overflow-auto relative p-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute right-2 top-2 bg-surface4 rounded-full z-10", children: /* @__PURE__ */ jsxRuntime.jsx(CopyButton, { content: data }) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "bg-surface4 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntime.jsx(CodeMirror, { value: JSON.stringify(json, null, 2), theme, extensions: [langJson.jsonLanguage] }) })
    ] });
  } catch (error) {
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "max-h-[500px] overflow-auto relative p-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute right-2 top-2 bg-surface4 rounded-full z-10", children: /* @__PURE__ */ jsxRuntime.jsx(CopyButton, { content: data }) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "bg-surface4 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntime.jsx(CodeMirror, { value: data, theme, extensions: [] }) })
    ] });
  }
};

const WorkflowStepActionBar = ({
  input,
  output,
  error,
  mapConfig,
  stepName,
  onShowTrace
}) => {
  const [isInputOpen, setIsInputOpen] = React.useState(false);
  const [isOutputOpen, setIsOutputOpen] = React.useState(false);
  const [isErrorOpen, setIsErrorOpen] = React.useState(false);
  const [isMapConfigOpen, setIsMapConfigOpen] = React.useState(false);
  const dialogContentClass = "bg-surface2 rounded-lg border-sm border-border1 max-w-4xl w-full px-0";
  const dialogTitleClass = "border-b-sm border-border1 pb-4 px-6";
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: (input || output || error || mapConfig) && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center bg-surface4 border-t-sm border-border1 px-2 py-1 gap-2 rounded-b-lg", children: [
    mapConfig && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(Button, { onClick: () => setIsMapConfigOpen(true), children: "Map config" }),
      /* @__PURE__ */ jsxRuntime.jsx(Dialog, { open: isMapConfigOpen, onOpenChange: setIsMapConfigOpen, children: /* @__PURE__ */ jsxRuntime.jsxs(DialogContent, { className: dialogContentClass, children: [
        /* @__PURE__ */ jsxRuntime.jsxs(DialogTitle, { className: dialogTitleClass, children: [
          stepName,
          " map config"
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-4 overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx(CodeDialogContent, { data: mapConfig }) })
      ] }) })
    ] }),
    input && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(Button, { onClick: () => setIsInputOpen(true), children: "Input" }),
      /* @__PURE__ */ jsxRuntime.jsx(Dialog, { open: isInputOpen, onOpenChange: setIsInputOpen, children: /* @__PURE__ */ jsxRuntime.jsxs(DialogContent, { className: dialogContentClass, children: [
        /* @__PURE__ */ jsxRuntime.jsxs(DialogTitle, { className: dialogTitleClass, children: [
          stepName,
          " input"
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-4 overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx(CodeDialogContent, { data: input }) })
      ] }) })
    ] }),
    output && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(Button, { onClick: () => setIsOutputOpen(true), children: "Output" }),
      /* @__PURE__ */ jsxRuntime.jsx(Dialog, { open: isOutputOpen, onOpenChange: setIsOutputOpen, children: /* @__PURE__ */ jsxRuntime.jsxs(DialogContent, { className: dialogContentClass, children: [
        /* @__PURE__ */ jsxRuntime.jsxs(DialogTitle, { className: dialogTitleClass, children: [
          stepName,
          " output"
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-4 overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx(CodeDialogContent, { data: output }) })
      ] }) })
    ] }),
    error && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(Button, { onClick: () => setIsErrorOpen(true), children: "Error" }),
      /* @__PURE__ */ jsxRuntime.jsx(Dialog, { open: isErrorOpen, onOpenChange: setIsErrorOpen, children: /* @__PURE__ */ jsxRuntime.jsxs(DialogContent, { className: dialogContentClass, children: [
        /* @__PURE__ */ jsxRuntime.jsxs(DialogTitle, { className: dialogTitleClass, children: [
          stepName,
          " error"
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-4 overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx(CodeDialogContent, { data: error }) })
      ] }) })
    ] }),
    onShowTrace && /* @__PURE__ */ jsxRuntime.jsx(Button, { onClick: onShowTrace, children: "Show trace" })
  ] }) });
};

function WorkflowConditionNode({ data }) {
  const { conditions, previousStepId, nextStepId } = data;
  const [open, setOpen] = React.useState(true);
  const [openDialog, setOpenDialog] = React.useState(false);
  const type = conditions[0]?.type;
  const isCollapsible = (conditions.some((condition) => condition.fnString) || conditions?.length > 1) && type !== "else";
  const { steps } = useCurrentRun();
  const previousStep = steps[previousStepId];
  const nextStep = steps[nextStepId];
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(react$2.Handle, { type: "target", position: react$2.Position.Top, style: { visibility: "hidden" } }),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: cn(
          "bg-surface3 rounded-lg w-[300px] border-sm border-border1",
          previousStep?.status === "success" && nextStep && "ring-2 ring-accent1",
          previousStep?.status === "failed" && nextStep && "ring-2 ring-accent2"
        ),
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs(
            Collapsible,
            {
              open: !isCollapsible ? true : open,
              onOpenChange: (_open) => {
                if (isCollapsible) {
                  setOpen(_open);
                }
              },
              children: [
                /* @__PURE__ */ jsxRuntime.jsxs(CollapsibleTrigger, { className: "flex items-center justify-between w-full px-3 py-2", children: [
                  /* @__PURE__ */ jsxRuntime.jsx(Badge$1, { icon: type === "when" ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Network, { className: "text-[#ECB047]" }) : null, children: type?.toUpperCase() }),
                  isCollapsible && /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(
                    lucideReact.ChevronDown,
                    {
                      className: cn("transition-transform text-icon3", {
                        "transform rotate-180": open
                      })
                    }
                  ) })
                ] }),
                type === "else" ? null : /* @__PURE__ */ jsxRuntime.jsx(CollapsibleContent, { className: "flex flex-col gap-2 pb-2", children: conditions.map((condition, index) => {
                  return condition.fnString ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-3", children: [
                    /* @__PURE__ */ jsxRuntime.jsx(prismReactRenderer.Highlight, { theme: prismReactRenderer.themes.oneDark, code: String(condition.fnString).trim(), language: "javascript", children: ({ className, style, tokens, getLineProps, getTokenProps }) => /* @__PURE__ */ jsxRuntime.jsx(
                      "pre",
                      {
                        className: `${className} relative font-mono p-3 w-full cursor-pointer rounded-lg text-xs !bg-surface4 overflow-scroll`,
                        onClick: () => setOpenDialog(true),
                        style,
                        children: tokens.map((line, i) => /* @__PURE__ */ jsxRuntime.jsxs("div", { ...getLineProps({ line }), children: [
                          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-block mr-2 text-muted-foreground", children: i + 1 }),
                          line.map((token, key) => /* @__PURE__ */ jsxRuntime.jsx("span", { ...getTokenProps({ token }) }, key))
                        ] }, i))
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntime.jsx(Dialog, { open: openDialog, onOpenChange: setOpenDialog, children: /* @__PURE__ */ jsxRuntime.jsxs(DialogContent, { className: "max-w-[30rem] bg-surface2 p-4", children: [
                      /* @__PURE__ */ jsxRuntime.jsx(DialogTitle, { className: "sr-only", children: "Condition Function" }),
                      /* @__PURE__ */ jsxRuntime.jsx(ScrollArea, { className: "w-full p-2 pt-4", maxHeight: "400px", children: /* @__PURE__ */ jsxRuntime.jsx(
                        prismReactRenderer.Highlight,
                        {
                          theme: prismReactRenderer.themes.oneDark,
                          code: String(condition.fnString).trim(),
                          language: "javascript",
                          children: ({ className, style, tokens, getLineProps, getTokenProps }) => /* @__PURE__ */ jsxRuntime.jsx(
                            "pre",
                            {
                              className: `${className} relative font-mono text-sm overflow-x-auto p-3 w-full rounded-lg mt-2 dark:bg-zinc-800`,
                              style: {
                                ...style,
                                backgroundColor: "#121212",
                                padding: "0 0.75rem 0 0"
                              },
                              children: tokens.map((line, i) => /* @__PURE__ */ jsxRuntime.jsxs("div", { ...getLineProps({ line }), children: [
                                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-block mr-2 text-muted-foreground", children: i + 1 }),
                                line.map((token, key) => /* @__PURE__ */ jsxRuntime.jsx("span", { ...getTokenProps({ token }) }, key))
                              ] }, i))
                            }
                          )
                        }
                      ) })
                    ] }) })
                  ] }, `${condition.fnString}-${index}`) : /* @__PURE__ */ jsxRuntime.jsx(React.Fragment, { children: condition.ref?.step ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1", children: [
                    index === 0 ? null : /* @__PURE__ */ jsxRuntime.jsx(Badge$1, { icon: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Network, { className: "text-[#ECB047]" }), children: condition.conj?.toLocaleUpperCase() || "WHEN" }),
                    /* @__PURE__ */ jsxRuntime.jsxs(Text, { size: "xs", className: " text-mastra-el-3 flex-1", children: [
                      condition.ref.step.id || condition.ref.step,
                      "'s ",
                      condition.ref.path,
                      " ",
                      Object.entries(condition.query).map(([key, value]) => `${key} ${String(value)}`)
                    ] })
                  ] }) : null }, `${condition.ref?.path}-${index}`);
                }) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(WorkflowStepActionBar, { stepName: nextStepId, input: previousStep?.output, mapConfig: data.mapConfig })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(react$2.Handle, { type: "source", position: react$2.Position.Bottom, style: { visibility: "hidden" } })
  ] });
}

const Clock = ({ startedAt, endedAt }) => {
  const [time, setTime] = React.useState(startedAt);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 100);
    return () => clearInterval(interval);
  }, [startedAt]);
  const timeDiff = endedAt ? endedAt - startedAt : time - startedAt;
  return /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "text-xs text-icon3", children: [
    toSigFigs(timeDiff, 3),
    "ms"
  ] });
};

function WorkflowDefaultNode({
  data,
  onShowTrace,
  parentWorkflowName
}) {
  const { steps, isRunning, runId } = useCurrentRun();
  const { label, description, withoutTopHandle, withoutBottomHandle } = data;
  const fullLabel = parentWorkflowName ? `${parentWorkflowName}.${label}` : label;
  const step = steps[fullLabel];
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    !withoutTopHandle && /* @__PURE__ */ jsxRuntime.jsx(react$2.Handle, { type: "target", position: react$2.Position.Top, style: { visibility: "hidden" } }),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: cn(
          "bg-surface3 rounded-lg w-[274px] border-sm border-border1 pt-2",
          step?.status === "success" && "ring-2 ring-accent1",
          step?.status === "failed" && "ring-2 ring-accent2"
        ),
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("flex items-center gap-2 px-3", !description && "pb-2"), children: [
            isRunning && /* @__PURE__ */ jsxRuntime.jsxs(Icon, { children: [
              step?.status === "failed" && /* @__PURE__ */ jsxRuntime.jsx(CrossIcon, { className: "text-accent2" }),
              step?.status === "success" && /* @__PURE__ */ jsxRuntime.jsx(CheckIcon, { className: "text-accent1" }),
              step?.status === "suspended" && /* @__PURE__ */ jsxRuntime.jsx(lucideReact.PauseIcon, { className: "text-icon3" }),
              step?.status === "running" && /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "text-icon6 animate-spin" }),
              !step && /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CircleDashed, { className: "text-icon2" })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs(Txt, { variant: "ui-lg", className: "text-icon6 font-medium inline-flex items-center gap-1 justify-between w-full", children: [
              label,
              " ",
              step?.startedAt && /* @__PURE__ */ jsxRuntime.jsx(Clock, { startedAt: step.startedAt, endedAt: step.endedAt })
            ] })
          ] }),
          description && /* @__PURE__ */ jsxRuntime.jsx(Txt, { variant: "ui-sm", className: "text-icon3 px-3 pb-2", children: description }),
          /* @__PURE__ */ jsxRuntime.jsx(
            WorkflowStepActionBar,
            {
              stepName: label,
              input: step?.input,
              output: step?.output,
              error: step?.error,
              mapConfig: data.mapConfig,
              onShowTrace: runId ? () => onShowTrace?.({ runId, stepName: fullLabel }) : void 0
            }
          )
        ]
      }
    ),
    !withoutBottomHandle && /* @__PURE__ */ jsxRuntime.jsx(react$2.Handle, { type: "source", position: react$2.Position.Bottom, style: { visibility: "hidden", color: "red" } })
  ] });
}

function WorkflowAfterNode({ data }) {
  const { steps } = data;
  const [open, setOpen] = React.useState(true);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    Collapsible,
    {
      open,
      onOpenChange: setOpen,
      className: cn("bg-mastra-bg-3 rounded-md w-[274px] flex flex-col p-2 gap-2"),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(react$2.Handle, { type: "target", position: react$2.Position.Top, style: { visibility: "hidden" } }),
        /* @__PURE__ */ jsxRuntime.jsxs(CollapsibleTrigger, { className: "flex items-center justify-between w-full", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            Text,
            {
              size: "xs",
              weight: "medium",
              className: "text-mastra-el-3 bg-mastra-bg-11 my-auto block rounded-[0.125rem] px-2 py-1 text-[10px] w-fit",
              children: "AFTER"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            lucideReact.ChevronDown,
            {
              className: cn("w-4 h-4 transition-transform", {
                "transform rotate-180": open
              })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(CollapsibleContent, { className: "flex flex-col gap-2", children: steps.map((step) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-sm bg-mastra-bg-9 flex items-center gap-[6px] rounded-sm  p-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Footprints, { className: "text-current w-4 h-4" }),
          /* @__PURE__ */ jsxRuntime.jsx(Text, { size: "xs", weight: "medium", className: "text-mastra-el-6 capitalize", children: step })
        ] }, step)) }),
        /* @__PURE__ */ jsxRuntime.jsx(react$2.Handle, { type: "source", position: react$2.Position.Bottom, style: { visibility: "hidden" } })
      ]
    }
  );
}

function WorkflowLoopResultNode({ data }) {
  const { result } = data;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("bg-mastra-bg-8 rounded-md w-[274px]"), children: [
    /* @__PURE__ */ jsxRuntime.jsx(react$2.Handle, { type: "target", position: react$2.Position.Top, style: { visibility: "hidden" } }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-2", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-sm bg-mastra-bg-9 flex items-center gap-[6px] rounded-sm  p-2", children: [
      result ? /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CircleCheck, { className: "text-current w-4 h-4" }) : /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CircleX, { className: "text-current w-4 h-4" }),
      /* @__PURE__ */ jsxRuntime.jsx(Text, { size: "xs", weight: "medium", className: "text-mastra-el-6 capitalize", children: String(result) })
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsx(react$2.Handle, { type: "source", position: react$2.Position.Bottom, style: { visibility: "hidden" } })
  ] });
}

function Spinner({ color = "#fff", className }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "svg",
    {
      className: cn("animate-spin duration-700", className),
      xmlns: "http://www.w3.org/2000/svg",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M21 12a9 9 0 1 1-6.219-8.56", stroke: color })
    }
  );
}

function LegacyWorkflowNestedGraph({
  stepGraph,
  stepSubscriberGraph,
  open
}) {
  const { nodes: initialNodes, edges: initialEdges } = contructLegacyNodesAndEdges({
    stepGraph,
    stepSubscriberGraph
  });
  const [isMounted, setIsMounted] = React.useState(false);
  const [nodes, _, onNodesChange] = react$2.useNodesState(initialNodes);
  const [edges] = react$2.useEdgesState(initialEdges);
  const nodeTypes = {
    "default-node": WorkflowDefaultNode,
    "condition-node": WorkflowConditionNode,
    "after-node": WorkflowAfterNode,
    "loop-result-node": WorkflowLoopResultNode
  };
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        setIsMounted(true);
      }, 500);
    }
  }, [open]);
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full h-full relative", children: isMounted ? /* @__PURE__ */ jsxRuntime.jsxs(
    react$2.ReactFlow,
    {
      nodes,
      edges,
      fitView: true,
      fitViewOptions: { maxZoom: 0.85 },
      nodeTypes,
      onNodesChange,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(react$2.Controls, {}),
        /* @__PURE__ */ jsxRuntime.jsx(react$2.MiniMap, { pannable: true, zoomable: true, maskColor: "#121212", bgColor: "#171717", nodeColor: "#2c2c2c" }),
        /* @__PURE__ */ jsxRuntime.jsx(react$2.Background, { variant: react$2.BackgroundVariant.Lines, gap: 12, size: 0.5 })
      ]
    }
  ) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(Spinner, {}) }) });
}

const LegacyWorkflowNestedGraphContext = React.createContext(
  {}
);
function LegacyWorkflowNestedGraphProvider({ children }) {
  const [stepGraph, setStepGraph] = React.useState(null);
  const [stepSubscriberGraph, setStepSubscriberGraph] = React.useState(null);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [label, setLabel] = React.useState("");
  const closeNestedGraph = () => {
    setOpenDialog(false);
    setStepGraph(null);
    setStepSubscriberGraph(null);
    setLabel("");
  };
  const showNestedGraph = ({
    label: label2,
    stepGraph: stepGraph2,
    stepSubscriberGraph: stepSubscriberGraph2
  }) => {
    setLabel(label2);
    setStepGraph(stepGraph2);
    setStepSubscriberGraph(stepSubscriberGraph2);
    setOpenDialog(true);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(
    LegacyWorkflowNestedGraphContext.Provider,
    {
      value: {
        showNestedGraph,
        closeNestedGraph
      },
      children: [
        children,
        /* @__PURE__ */ jsxRuntime.jsx(Dialog, { open: openDialog, onOpenChange: closeNestedGraph, children: /* @__PURE__ */ jsxRuntime.jsx(DialogPortal, { children: /* @__PURE__ */ jsxRuntime.jsxs(DialogContent, { className: "w-[40rem] h-[40rem] bg-[#121212] p-[0.5rem]", children: [
          /* @__PURE__ */ jsxRuntime.jsxs(DialogTitle, { className: "flex items-center gap-1.5 absolute top-2.5 left-2.5", children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Workflow, { className: "text-current w-4 h-4" }),
            /* @__PURE__ */ jsxRuntime.jsxs(Text, { size: "xs", weight: "medium", className: "text-mastra-el-6 capitalize", children: [
              label,
              " workflow"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(react$2.ReactFlowProvider, { children: /* @__PURE__ */ jsxRuntime.jsx(
            LegacyWorkflowNestedGraph,
            {
              stepGraph,
              open: openDialog,
              stepSubscriberGraph
            }
          ) })
        ] }) }) })
      ]
    }
  );
}

function LegacyWorkflowNestedNode({ data }) {
  const { label, withoutTopHandle, withoutBottomHandle, stepGraph, stepSubscriberGraph } = data;
  const { showNestedGraph } = React.useContext(LegacyWorkflowNestedGraphContext);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("bg-[rgba(29,29,29,0.5)] rounded-md h-full overflow-scroll w-[274px]"), children: [
    !withoutTopHandle && /* @__PURE__ */ jsxRuntime.jsx(react$2.Handle, { type: "target", position: react$2.Position.Top, style: { visibility: "hidden" } }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-2 cursor-pointer", onClick: () => showNestedGraph({ label, stepGraph, stepSubscriberGraph }), children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-sm bg-mastra-bg-9 flex items-center gap-1.5 rounded-sm p-2 cursor-pointer", children: [
      /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Workflow, { className: "text-current w-4 h-4" }),
      /* @__PURE__ */ jsxRuntime.jsx(Text, { size: "xs", weight: "medium", className: "text-mastra-el-6 capitalize", children: label })
    ] }) }),
    !withoutBottomHandle && /* @__PURE__ */ jsxRuntime.jsx(react$2.Handle, { type: "source", position: react$2.Position.Bottom, style: { visibility: "hidden" } })
  ] });
}

function LegacyWorkflowGraphInner({ workflow }) {
  const { nodes: initialNodes, edges: initialEdges } = contructLegacyNodesAndEdges({
    stepGraph: workflow.serializedStepGraph || workflow.stepGraph,
    stepSubscriberGraph: workflow.serializedStepSubscriberGraph || workflow.stepSubscriberGraph,
    steps: workflow.steps
  });
  const [nodes, _, onNodesChange] = react$2.useNodesState(initialNodes);
  const [edges] = react$2.useEdgesState(initialEdges);
  const nodeTypes = {
    "default-node": WorkflowDefaultNode,
    "condition-node": WorkflowConditionNode,
    "after-node": WorkflowAfterNode,
    "loop-result-node": WorkflowLoopResultNode,
    "nested-node": LegacyWorkflowNestedNode
  };
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full h-full", children: /* @__PURE__ */ jsxRuntime.jsxs(
    react$2.ReactFlow,
    {
      nodes,
      edges,
      nodeTypes,
      onNodesChange,
      fitView: true,
      fitViewOptions: {
        maxZoom: 0.85
      },
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(react$2.Controls, {}),
        /* @__PURE__ */ jsxRuntime.jsx(react$2.MiniMap, { pannable: true, zoomable: true, maskColor: "#121212", bgColor: "#171717", nodeColor: "#2c2c2c" }),
        /* @__PURE__ */ jsxRuntime.jsx(react$2.Background, { variant: react$2.BackgroundVariant.Dots, gap: 12, size: 0.5 })
      ]
    }
  ) });
}

const lodashTitleCase = (str) => {
  const camelCased = str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : "").replace(/^(.)/, (char) => char.toLowerCase());
  return camelCased.replace(/([A-Z])/g, " $1").replace(/^./, (str2) => str2.toUpperCase()).trim();
};

function LegacyWorkflowGraph({ workflowId }) {
  const { legacyWorkflow, isLoading } = useLegacyWorkflow(workflowId);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "h-[600px]" }) });
  }
  if (!legacyWorkflow) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid h-full place-items-center", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertCircleIcon, {}),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        "We couldn't find ",
        lodashTitleCase(workflowId),
        " workflow."
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(LegacyWorkflowNestedGraphProvider, { children: /* @__PURE__ */ jsxRuntime.jsx(react$2.ReactFlowProvider, { children: /* @__PURE__ */ jsxRuntime.jsx(LegacyWorkflowGraphInner, { workflow: legacyWorkflow }) }) });
}

const Form = React.forwardRef(({ children, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx("form", { ref, className: "space-y-4", ...props, children });
});

const DISABLED_LABELS = ["boolean", "object", "array"];
const FieldWrapper = ({ label, children, id, field, error }) => {
  const isDisabled = DISABLED_LABELS.includes(field.type);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "pb-4 last:pb-0", children: [
    !isDisabled && /* @__PURE__ */ jsxRuntime.jsxs(Txt, { as: "label", variant: "ui-sm", className: "text-icon3 pb-1 block", htmlFor: id, children: [
      label,
      field.required && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-accent2", children: " *" })
    ] }),
    children,
    field.fieldConfig?.description && /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "p", variant: "ui-sm", className: "text-icon6", children: field.fieldConfig.description }),
    error && /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "p", variant: "ui-sm", className: "text-accent2", children: error })
  ] });
};

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Alert = React__namespace.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx("div", { ref, role: "alert", className: cn(alertVariants({ variant }), className), ...props }));
Alert.displayName = "Alert";
const AlertTitle = React__namespace.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx("h5", { ref, className: cn("mb-1 font-medium leading-none tracking-tight", className), ...props })
);
AlertTitle.displayName = "AlertTitle";
const AlertDescription = React__namespace.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx("div", { ref, className: cn("text-sm [&_p]:leading-relaxed", className), ...props })
);
AlertDescription.displayName = "AlertDescription";

const ErrorMessage = ({ error }) => /* @__PURE__ */ jsxRuntime.jsxs(Alert, { variant: "destructive", children: [
  /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertCircle, { className: "h-4 w-4" }),
  /* @__PURE__ */ jsxRuntime.jsx(AlertTitle, { children: error })
] });

const SubmitButton = ({ children }) => /* @__PURE__ */ jsxRuntime.jsx(Button$1, { type: "submit", children });

const StringField = ({ inputProps, error, field, id }) => {
  const { key, ...props } = inputProps;
  return /* @__PURE__ */ jsxRuntime.jsx(Input, { id, className: error ? "border-destructive" : "", ...props, defaultValue: field.default });
};

const NumberField = ({ inputProps, error, field, id }) => {
  const { key, ...props } = inputProps;
  React.useEffect(() => {
    if (field.default !== void 0) {
      props.onChange({
        target: { value: Number(field.default), name: inputProps.name }
      });
    }
  }, [field.default]);
  return /* @__PURE__ */ jsxRuntime.jsx(
    Input,
    {
      id,
      type: "number",
      className: error ? "border-destructive" : "",
      ...props,
      defaultValue: field.default !== void 0 ? Number(field.default) : void 0,
      onChange: (e) => {
        const value = e.target.value;
        if (value !== "" && !isNaN(Number(value))) {
          props.onChange({
            target: { value, name: inputProps.name }
          });
        }
      },
      onBlur: (e) => {
        const value = e.target.value;
        if (value !== "" && !isNaN(Number(value))) {
          props.onChange({
            target: { value: Number(value), name: inputProps.name }
          });
        }
      }
    }
  );
};

const Checkbox = React__namespace.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
  CheckboxPrimitive__namespace.Root,
  {
    ref,
    className: cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(CheckboxPrimitive__namespace.Indicator, { className: cn("flex items-center justify-center text-current"), children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { className: "h-4 w-4" }) })
  }
));
Checkbox.displayName = CheckboxPrimitive__namespace.Root.displayName;

const BooleanField = ({ field, label, id, inputProps, value }) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center space-x-2", children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    Checkbox,
    {
      id,
      onCheckedChange: (checked) => {
        const event = {
          target: {
            name: inputProps.name,
            value: checked
          }
        };
        inputProps.onChange(event);
      },
      defaultChecked: field.default,
      disabled: inputProps.disabled || inputProps.readOnly
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsxs(Txt, { as: "label", variant: "ui-sm", className: "text-icon3", htmlFor: id, children: [
    label,
    field.required && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-accent2", children: " *" })
  ] })
] });

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    reactDayPicker.DayPicker,
    {
      showOutsideDays,
      className: cn("p-3", className),
      classNames: {
        months: "flex flex-col space-y-4 sm:space-y-0",
        month: "space-y-4",
        // month_caption: 'flex justify-center pt-1 relative items-center',
        caption_label: "text-sm text-text font-medium",
        nav: "space-x-1 flex items-center",
        nav_button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          "absolute left-4 top-[56px] z-10"
        ),
        nav_button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          "absolute right-4 top-[56px] z-10"
        ),
        dropdown_month: "w-full border-collapse space-y-1",
        weeknumber: "flex",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range" ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md" : "[&:has([aria-selected])]:rounded-md",
          "h-8 w-8 p-0 hover:bg-lightGray-7/50 font-normal aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected: "!bg-primary !text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-lightGray-7/50 text-accent-foreground",
        day_outside: "day-outside text-muted-foreground opacity-50  aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames
      },
      components: {
        // IconDropdown: ({  }) => (
        //   <CalendarIcon
        //     className={cn('h-4 w-4', {
        //       'rotate-180': orientation === 'up',
        //       'rotate-90': orientation === 'left',
        //       '-rotate-90': orientation === 'right',
        //     })}
        //   />
        // ),
      },
      ...props
    }
  );
}
Calendar.displayName = "Calendar";

const Popover = PopoverPrimitive__namespace.Root;
const PopoverTrigger = PopoverPrimitive__namespace.Trigger;
const PopoverContent = React__namespace.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(PopoverPrimitive__namespace.Portal, { children: /* @__PURE__ */ jsxRuntime.jsx(
  PopoverPrimitive__namespace.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = PopoverPrimitive__namespace.Content.displayName;

const DatePicker = ({
  value,
  setValue,
  children,
  className,
  placeholder,
  ...props
}) => {
  const [openPopover, setOpenPopover] = React__namespace.useState(false);
  return /* @__PURE__ */ jsxRuntime.jsxs(Popover, { open: openPopover, onOpenChange: setOpenPopover, children: [
    /* @__PURE__ */ jsxRuntime.jsx(PopoverTrigger, { asChild: true, children: children ? children : /* @__PURE__ */ jsxRuntime.jsx(
      DefaultButton,
      {
        value,
        placeholder,
        className,
        "data-testid": "datepicker-button"
      }
    ) }),
    /* @__PURE__ */ jsxRuntime.jsx(
      PopoverContent,
      {
        className: "backdrop-blur-4xl w-auto p-0 bg-[#171717]",
        align: "start",
        "data-testid": "datepicker-calendar",
        children: /* @__PURE__ */ jsxRuntime.jsx(
          DatePickerOnly,
          {
            value,
            setValue: (v) => setValue(v ? /* @__PURE__ */ new Date(`${v}z`) : null),
            clearable: props.clearable,
            setOpenPopover,
            ...props
          }
        )
      }
    )
  ] });
};
const DatePickerOnly = ({
  value,
  setValue,
  setOpenPopover,
  clearable,
  placeholder,
  className,
  ...props
}) => {
  const [inputValue, setInputValue] = React__namespace.useState(value ? dateFns.format(value, "PP") : "");
  const [selected, setSelected] = React__namespace.useState(value ? new Date(value) : void 0);
  const debouncedDateUpdate = useDebounce.useDebouncedCallback((date) => {
    if (dateFns.isValid(date)) {
      setSelected(date);
      setValue?.(date);
      setOpenPopover?.(false);
    }
  }, 2e3);
  const handleInputChange = (e) => {
    setInputValue(e.currentTarget.value);
    const date = new Date(e.target.value);
    debouncedDateUpdate(date);
  };
  const handleDaySelect = (date) => {
    setSelected(date);
    setValue?.(date);
    setOpenPopover?.(false);
    if (date) {
      setInputValue(dateFns.format(date, "PP"));
    } else {
      setInputValue("");
    }
  };
  const handleMonthSelect = (date) => {
    setSelected(date);
    if (date) {
      setInputValue(dateFns.format(date, "PP"));
    } else {
      setInputValue("");
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      "aria-label": "Choose date",
      className: "relative mt-2 flex flex-col gap-2",
      onKeyDown: (e) => {
        e.stopPropagation();
        if (e.key === "Escape") {
          setOpenPopover?.(false);
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full px-3", children: /* @__PURE__ */ jsxRuntime.jsx(
          Input,
          {
            type: "text",
            value: inputValue,
            onChange: handleInputChange,
            placeholder,
            className
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsx(
          Calendar,
          {
            mode: "single",
            month: selected,
            selected,
            onMonthChange: handleMonthSelect,
            onSelect: handleDaySelect,
            ...props
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-3 pb-2", children: clearable && /* @__PURE__ */ jsxRuntime.jsx(
          Button$1,
          {
            variant: "outline",
            tabIndex: 0,
            className: "w-full !opacity-50 duration-200 hover:!opacity-100",
            onClick: () => {
              setValue(null);
              setSelected(void 0);
              setInputValue("");
              setOpenPopover?.(false);
            },
            children: "Clear"
          }
        ) })
      ]
    }
  );
};
const DefaultButton = React__namespace.forwardRef(
  ({ value, placeholder, className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      Button$1,
      {
        ref,
        variant: "outline",
        className: cn(
          "bg-neutral-825 border-neutral-775 w-full justify-start whitespace-nowrap rounded-md border px-2 py-0 text-left flex items-center gap-1",
          className
        ),
        ...props,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CalendarIcon, { className: "h-4 w-4" }),
          value ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-white", children: dateFns.format(value, "PPP") }) : /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-gray", children: placeholder ?? "Pick a date" })
        ]
      }
    );
  }
);
DefaultButton.displayName = "DefaultButton";

const DateField = ({ inputProps, field, error, id }) => {
  const { key, ...props } = inputProps;
  const [value, setValue] = React.useState(null);
  React.useEffect(() => {
    if (field.default) {
      const date = new Date(field.default);
      if (dateFns.isValid(date)) {
        setValue(date);
      }
    }
  }, [field]);
  return /* @__PURE__ */ jsxRuntime.jsx(
    DatePicker,
    {
      id,
      className: error ? "border-destructive" : "",
      value,
      setValue: (date) => {
        const newDate = date ? new Date(date).toISOString() : date;
        if (newDate) {
          props.onChange({
            target: { value: newDate?.toString(), name: inputProps.name }
          });
          setValue(new Date(newDate));
        }
      },
      clearable: true
    }
  );
};

const Select = SelectPrimitive__namespace.Root;
const SelectValue = SelectPrimitive__namespace.Value;
const SelectTrigger = React__namespace.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsxs(
  SelectPrimitive__namespace.Trigger,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntime.jsx(SelectPrimitive__namespace.Icon, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive__namespace.Trigger.displayName;
const SelectContent = React__namespace.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(SelectPrimitive__namespace.Portal, { children: /* @__PURE__ */ jsxRuntime.jsx(
  SelectPrimitive__namespace.Content,
  {
    ref,
    className: cn(
      "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(
      SelectPrimitive__namespace.Viewport,
      {
        className: cn(
          "p-1",
          position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        ),
        children
      }
    )
  }
) }));
SelectContent.displayName = SelectPrimitive__namespace.Content.displayName;
const SelectItem = React__namespace.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsxs(
  SelectPrimitive__namespace.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-mastra-el-5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(SelectPrimitive__namespace.ItemIndicator, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxRuntime.jsx(SelectPrimitive__namespace.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive__namespace.Item.displayName;

const SelectField = ({ field, inputProps, error, id, value }) => {
  const { key, ...props } = inputProps;
  return /* @__PURE__ */ jsxRuntime.jsxs(
    Select,
    {
      ...props,
      onValueChange: (value2) => {
        const syntheticEvent = {
          target: {
            value: value2,
            name: inputProps.name
          }
        };
        props.onChange(syntheticEvent);
      },
      defaultValue: field.default,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(SelectTrigger, { id, className: error ? "border-destructive" : "", children: /* @__PURE__ */ jsxRuntime.jsx(SelectValue, { placeholder: "Select an option" }) }),
        /* @__PURE__ */ jsxRuntime.jsx(SelectContent, { children: (field.options || []).map(([key2, label]) => /* @__PURE__ */ jsxRuntime.jsx(SelectItem, { value: key2, children: label }, key2)) })
      ]
    }
  );
};

const ObjectWrapper = ({ label, children }) => {
  const hasLabel = label !== "​" && label !== "";
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "", children: [
    hasLabel && /* @__PURE__ */ jsxRuntime.jsxs(Txt, { as: "h3", variant: "ui-sm", className: "text-icon3 flex items-center gap-1 pb-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(Icon, { size: "sm", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Braces, {}) }),
      label
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: hasLabel ? "flex flex-col gap-1 [&>*]:border-dashed [&>*]:border-l [&>*]:border-l-border1 [&>*]:pl-4" : "",
        children
      }
    )
  ] });
};

const ArrayWrapper = ({ label, children, onAddItem }) => {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-2 justify-between", children: [
      /* @__PURE__ */ jsxRuntime.jsxs(Txt, { as: "h3", variant: "ui-sm", className: "text-icon3 pb-2 flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntime.jsx(Icon, { size: "sm", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Brackets, {}) }),
        label
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(TooltipProvider, { children: /* @__PURE__ */ jsxRuntime.jsxs(Tooltip, { delayDuration: 0, children: [
        /* @__PURE__ */ jsxRuntime.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            onClick: onAddItem,
            type: "button",
            className: "text-icon3 bg-surface3 rounded-md p-1 hover:bg-surface4 hover:text-icon6 h-icon-sm w-icon-sm",
            children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { size: "sm", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.PlusIcon, {}) })
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsx(TooltipContent, { children: "Add item" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-1", children })
  ] });
};

const ArrayElementWrapper = ({ children, onRemove }) => {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "pl-4 border-l border-border1", children: [
    children,
    /* @__PURE__ */ jsxRuntime.jsxs(Button, { onClick: onRemove, type: "button", children: [
      /* @__PURE__ */ jsxRuntime.jsx(Icon, { size: "sm", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.TrashIcon, {}) }),
      "Delete"
    ] })
  ] });
};

const RecordField = ({ inputProps, field, error, id }) => {
  const { key, onChange, ...props } = inputProps;
  const [pairs, setPairs] = React__namespace.useState(
    () => Object.entries(field.default || {}).map(([key2, val]) => ({
      id: key2 || uuid.v4(),
      key: key2,
      value: val
    }))
  );
  React__namespace.useEffect(() => {
    if (pairs.length === 0) {
      setPairs([{ id: uuid.v4(), key: "", value: "" }]);
    }
  }, [pairs]);
  const updateForm = React__namespace.useCallback(
    (newPairs) => {
      const newValue = newPairs.reduce(
        (acc, pair) => {
          if (pair.key) {
            acc[pair.key] = pair.value;
          }
          return acc;
        },
        {}
      );
      onChange?.({
        target: { value: newValue, name: inputProps.name }
      });
    },
    [onChange, inputProps.name]
  );
  const handleChange = (id2, field2, newValue) => {
    setPairs((prev) => prev.map((pair) => pair.id === id2 ? { ...pair, [field2]: newValue } : pair));
  };
  const handleBlur = () => {
    updateForm(pairs);
  };
  const addPair = () => {
    const newPairs = [...pairs, { id: uuid.v4(), key: "", value: "" }];
    setPairs(newPairs);
    updateForm(newPairs);
  };
  const removePair = (id2) => {
    const newPairs = pairs.filter((p) => p.id !== id2);
    if (newPairs.length === 0) {
      newPairs.push({ id: uuid.v4(), key: "", value: "" });
    }
    setPairs(newPairs);
    updateForm(newPairs);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-3", children: [
    pairs.map((pair) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative space-y-2 rounded-lg border p-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        Button$1,
        {
          type: "button",
          variant: "ghost",
          size: "icon",
          className: "absolute right-2 top-2",
          onClick: () => removePair(pair.id),
          children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.TrashIcon, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-2 pt-6", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          Input,
          {
            placeholder: "Key",
            value: pair.key,
            onChange: (e) => handleChange(pair.id, "key", e.target.value),
            onBlur: handleBlur
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          Input,
          {
            placeholder: "Value",
            value: pair.value,
            onChange: (e) => handleChange(pair.id, "value", e.target.value),
            onBlur: handleBlur
          }
        )
      ] })
    ] }, pair.id)),
    /* @__PURE__ */ jsxRuntime.jsxs(Button$1, { type: "button", variant: "outline", size: "sm", className: "w-full", onClick: addPair, children: [
      /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { className: "mr-2 h-4 w-4" }),
      "Add Key-Value Pair"
    ] })
  ] });
};

const ShadcnUIComponents = {
  Form,
  FieldWrapper,
  ErrorMessage,
  SubmitButton,
  ObjectWrapper,
  ArrayWrapper,
  ArrayElementWrapper
};
function AutoForm({
  uiComponents,
  formComponents,
  readOnly,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntime.jsx(
    react$3.AutoForm,
    {
      ...props,
      uiComponents: { ...ShadcnUIComponents, ...uiComponents },
      formComponents: {
        string: (props2) => /* @__PURE__ */ jsxRuntime.jsx(StringField, { ...props2, inputProps: { ...props2.inputProps, readOnly } }),
        number: (props2) => /* @__PURE__ */ jsxRuntime.jsx(NumberField, { ...props2, inputProps: { ...props2.inputProps, readOnly } }),
        boolean: (props2) => /* @__PURE__ */ jsxRuntime.jsx(BooleanField, { ...props2, inputProps: { ...props2.inputProps, readOnly } }),
        date: (props2) => /* @__PURE__ */ jsxRuntime.jsx(DateField, { ...props2, inputProps: { ...props2.inputProps, readOnly } }),
        select: (props2) => /* @__PURE__ */ jsxRuntime.jsx(SelectField, { ...props2, inputProps: { ...props2.inputProps, readOnly } }),
        record: (props2) => /* @__PURE__ */ jsxRuntime.jsx(RecordField, { ...props2, inputProps: { ...props2.inputProps, readOnly } }),
        ...formComponents
      }
    }
  );
}

react$3.buildZodFieldConfig();

function inferFieldType(schema, fieldConfig) {
  if (fieldConfig?.fieldType) {
    return fieldConfig.fieldType;
  }
  if (schema instanceof z.z.ZodObject) return "object";
  if (schema instanceof z.z.ZodNumber) return "number";
  if (schema instanceof z.z.ZodBoolean) return "boolean";
  if (schema instanceof z.z.ZodDate || schema?.isDatetime || schema?.isDate) return "date";
  if (schema instanceof z.z.ZodString) return "string";
  if (schema instanceof z.z.ZodEnum) return "select";
  if (schema instanceof z.z.ZodNativeEnum) return "select";
  if (schema instanceof z.z.ZodArray) return "array";
  if (schema instanceof z.z.ZodRecord) return "record";
  return "string";
}

function parseField(key, schema) {
  const baseSchema = getBaseSchema(schema);
  const fieldConfig = zod.getFieldConfigInZodStack(schema);
  const type = inferFieldType(baseSchema, fieldConfig);
  const defaultValue = zod.getDefaultValueInZodStack(schema);
  const options = baseSchema._def?.values;
  let optionValues = [];
  if (options) {
    if (!Array.isArray(options)) {
      optionValues = Object.entries(options);
    } else {
      optionValues = options.map((value) => [value, value]);
    }
  }
  let subSchema = [];
  if (baseSchema instanceof z.z.ZodObject) {
    subSchema = Object.entries(baseSchema.shape).map(([key2, field]) => parseField(key2, field));
  }
  if (baseSchema instanceof z.z.ZodArray) {
    subSchema = [parseField("0", baseSchema._def.type)];
  }
  return {
    key,
    type,
    required: !schema.isOptional(),
    default: defaultValue,
    description: baseSchema.description,
    fieldConfig,
    options: optionValues,
    schema: subSchema
  };
}
function getBaseSchema(schema) {
  if ("innerType" in schema._def) {
    return getBaseSchema(schema._def.innerType);
  }
  if ("schema" in schema._def) {
    return getBaseSchema(schema._def.schema);
  }
  return schema;
}
function parseSchema(schema) {
  const objectSchema = schema instanceof z.z.ZodEffects ? schema.innerType() : schema;
  const shape = objectSchema.shape;
  const fields = Object.entries(shape).map(([key, field]) => parseField(key, field));
  return { fields };
}
class CustomZodProvider extends zod.ZodProvider {
  _schema;
  constructor(schema) {
    super(schema);
    this._schema = schema;
  }
  parseSchema() {
    return parseSchema(this._schema);
  }
}

const labelVariants = cva("text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
const Label = React__namespace.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsx(LabelPrimitive__namespace.Root, { ref, className: cn(labelVariants(), className), ...props }));
Label.displayName = LabelPrimitive__namespace.Root.displayName;

function isEmptyZodObject(schema) {
  if (schema instanceof z.ZodObject) {
    return Object.keys(schema.shape).length === 0;
  }
  return false;
}
function DynamicForm({
  schema,
  onSubmit,
  defaultValues,
  isSubmitLoading,
  submitButtonLabel,
  className,
  readOnly
}) {
  if (!schema) {
    console.error("no form schema found");
    return null;
  }
  const normalizedSchema = (schema2) => {
    if (isEmptyZodObject(schema2)) {
      return z.object({});
    }
    return z.object({
      "​": schema2
    });
  };
  const schemaProvider = new CustomZodProvider(normalizedSchema(schema));
  const formProps = {
    schema: schemaProvider,
    onSubmit: async (values) => {
      await onSubmit?.(values?.["​"] || {});
    },
    defaultValues: defaultValues ? { "​": defaultValues } : void 0,
    formProps: {
      className: ""
    },
    uiComponents: {
      SubmitButton: ({ children }) => onSubmit ? /* @__PURE__ */ jsxRuntime.jsx(Button, { variant: "light", className: "w-full", size: "lg", disabled: isSubmitLoading, children: isSubmitLoading ? /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "animate-spin" }) }) : submitButtonLabel || children }) : null
    },
    formComponents: {
      Label: ({ value }) => /* @__PURE__ */ jsxRuntime.jsx(Label, { className: "text-sm font-normal", children: value })
    },
    withSubmit: true
  };
  return /* @__PURE__ */ jsxRuntime.jsx(AutoForm, { ...formProps, readOnly });
}

function resolveSerializedZodOutput(obj) {
  return Function("z", `"use strict";return (${obj});`)(z.z);
}

function CodeBlockDemo({
  code = "",
  language = "ts",
  filename,
  className
}) {
  return /* @__PURE__ */ jsxRuntime.jsxs(reactCodeBlock.CodeBlock, { code, language, theme: prismReactRenderer.themes.oneDark, children: [
    filename ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute w-full px-6 py-2 pl-4 text-sm rounded bg-mastra-bg-2 text-mastra-el-6/50", children: filename }) : null,
    /* @__PURE__ */ jsxRuntime.jsx(
      reactCodeBlock.CodeBlock.Code,
      {
        className: cn("bg-transparent h-full p-6 rounded-xl whitespace-pre-wrap", filename ? "pt-10" : "", className),
        children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "table-row", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsxRuntime.jsx(reactCodeBlock.CodeBlock.LineNumber, { className: "table-cell pr-4 text-sm text-right select-none text-gray-500/50" }),
          /* @__PURE__ */ jsxRuntime.jsx(reactCodeBlock.CodeBlock.LineContent, { className: "flex", children: /* @__PURE__ */ jsxRuntime.jsx(reactCodeBlock.CodeBlock.Token, { className: "font-mono text-sm mastra-token" }) })
        ] }) })
      }
    )
  ] });
}

const WorkflowCard = ({ header, children, footer }) => {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "rounded-lg border-sm border-border1 bg-surface4", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "py-1 px-2 flex items-center gap-3", children: header }),
    children && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-t-sm border-border1", children }),
    footer && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "py-1 px-2 border-t-sm border-border1", children: footer })
  ] });
};

const LegacyWorkflowStatus = ({ stepId, pathStatus, path }) => {
  const status = pathStatus === "completed" ? "Completed" : stepId === path ? pathStatus.charAt(0).toUpperCase() + pathStatus.slice(1) : pathStatus === "executing" ? "Executing" : "Completed";
  return /* @__PURE__ */ jsxRuntime.jsx(
    WorkflowCard,
    {
      header: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(Icon, { children: [
          status === "Completed" && /* @__PURE__ */ jsxRuntime.jsx(CheckIcon, { className: "text-accent1" }),
          status === "Failed" && /* @__PURE__ */ jsxRuntime.jsx(CrossIcon, { className: "text-accent2" }),
          status === "Executing" && /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "text-icon3 animate-spin" })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "span", variant: "ui-lg", className: "text-icon6 font-medium", children: path })
      ] })
    }
  );
};

const WorkflowResult = ({ jsonResult, sanitizedJsonResult }) => {
  const { handleCopy } = useCopyToClipboard({ text: jsonResult });
  const [expanded, setExpanded] = React.useState(false);
  return /* @__PURE__ */ jsxRuntime.jsx(
    WorkflowCard,
    {
      header: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 justify-between w-full", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(Txt, { variant: "ui-lg", className: "text-icon6 flex items-center gap-3 font-medium", children: [
          /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(DeploymentIcon, {}) }),
          "Workflow Execution (JSON)"
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              className: "p-2 rounded-lg hover:bg-surface5 transition-colors duration-150 ease-in-out text-icon3 hover:text-icon6",
              onClick: () => handleCopy(),
              children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { size: "sm", children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CopyIcon, {}) })
            }
          ) }),
          /* @__PURE__ */ jsxRuntime.jsx(TooltipContent, { children: "Copy result" })
        ] })
      ] }),
      footer: /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          className: "w-full h-full text-center text-icon2 hover:text-icon6 text-ui-md",
          onClick: () => setExpanded((s) => !s),
          children: expanded ? "collapse" : "expand"
        }
      ),
      children: expanded ? /* @__PURE__ */ jsxRuntime.jsx(CodeBlockDemo, { className: "w-full overflow-x-auto", code: sanitizedJsonResult || jsonResult, language: "json" }) : null
    }
  );
};

function LegacyWorkflowTrigger({
  workflowId,
  setRunId
}) {
  const { legacyResult: result, setLegacyResult: setResult, payload, setPayload } = React.useContext(WorkflowRunContext);
  const { isLoading, legacyWorkflow: workflow } = useLegacyWorkflow(workflowId);
  const { createLegacyWorkflowRun: createWorkflowRun, startLegacyWorkflowRun: startWorkflowRun } = useExecuteWorkflow();
  const {
    watchLegacyWorkflow: watchWorkflow,
    legacyWatchResult: watchResult,
    isWatchingLegacyWorkflow: isWatchingWorkflow
  } = useWatchWorkflow();
  const { resumeLegacyWorkflow: resumeWorkflow, isResumingLegacyWorkflow: isResumingWorkflow } = useResumeWorkflow();
  const [suspendedSteps, setSuspendedSteps] = React.useState([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const triggerSchema = workflow?.triggerSchema;
  const handleExecuteWorkflow = async (data) => {
    try {
      if (!workflow) return;
      setIsRunning(true);
      setResult(null);
      const { runId } = await createWorkflowRun({ workflowId });
      setRunId?.(runId);
      watchWorkflow({ workflowId, runId });
      startWorkflowRun({ workflowId, runId, input: data });
    } catch (err) {
      setIsRunning(false);
      sonner.toast.error("Error executing workflow");
    }
  };
  const handleResumeWorkflow = async (step) => {
    if (!workflow) return;
    const { stepId, runId: prevRunId, context } = step;
    const { runId } = await createWorkflowRun({ workflowId, prevRunId });
    watchWorkflow({ workflowId, runId });
    await resumeWorkflow({
      stepId,
      runId,
      context,
      workflowId
    });
  };
  const watchResultToUse = result ?? watchResult;
  const workflowActivePaths = watchResultToUse?.activePaths ?? {};
  React.useEffect(() => {
    setIsRunning(isWatchingWorkflow);
  }, [isWatchingWorkflow]);
  React.useEffect(() => {
    if (!watchResultToUse?.activePaths || !result?.runId) return;
    const suspended = Object.entries(watchResultToUse.activePaths).filter(([_, { status }]) => status === "suspended").map(([stepId, { suspendPayload }]) => ({
      stepId,
      runId: result.runId,
      suspendPayload
    }));
    setSuspendedSteps(suspended);
  }, [watchResultToUse, result]);
  React.useEffect(() => {
    if (watchResult) {
      setResult(watchResult);
    }
  }, [watchResult]);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntime.jsx(ScrollArea, { className: "h-[calc(100vh-126px)] pt-2 px-4 pb-4 text-xs", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "h-10" }),
      /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "h-10" })
    ] }) });
  }
  if (!workflow) return null;
  const isSuspendedSteps = suspendedSteps.length > 0;
  const zodInputSchema = triggerSchema ? resolveSerializedZodOutput(jsonSchemaToZod(superjson.parse(triggerSchema))) : null;
  const { sanitizedOutput, ...restResult } = result ?? {};
  const hasWorkflowActivePaths = Object.values(workflowActivePaths).length > 0;
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-full px-5 pt-3 pb-12", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
    isResumingWorkflow && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "py-2 px-5 flex items-center gap-2 bg-surface5 -mx-5 -mt-5 border-b-sm border-border1", children: [
      /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "animate-spin text-icon6" }) }),
      /* @__PURE__ */ jsxRuntime.jsx(Txt, { children: "Resuming workflow" })
    ] }),
    !isSuspendedSteps && /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: zodInputSchema ? /* @__PURE__ */ jsxRuntime.jsx(
      DynamicForm,
      {
        schema: zodInputSchema,
        defaultValues: payload,
        isSubmitLoading: isWatchingWorkflow,
        submitButtonLabel: "Run",
        onSubmit: (data) => {
          setPayload(data);
          handleExecuteWorkflow(data);
        }
      }
    ) : /* @__PURE__ */ jsxRuntime.jsx(
      Button,
      {
        className: "w-full",
        variant: "light",
        disabled: isRunning,
        onClick: () => handleExecuteWorkflow(null),
        children: isRunning ? /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "animate-spin" }) }) : "Trigger"
      }
    ) }),
    isSuspendedSteps && suspendedSteps?.map((step) => {
      const stepDefinition = workflow.steps[step.stepId];
      const stepSchema = stepDefinition?.inputSchema ? resolveSerializedZodOutput(jsonSchemaToZod(superjson.parse(stepDefinition.inputSchema))) : z.z.record(z.z.string(), z.z.any());
      return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col px-4", children: [
        /* @__PURE__ */ jsxRuntime.jsx(Text, { variant: "secondary", className: "text-mastra-el-3", size: "xs", children: step.stepId }),
        step.suspendPayload && /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(
          CodeBlockDemo,
          {
            className: "w-full overflow-x-auto p-2",
            code: JSON.stringify(step.suspendPayload, null, 2),
            language: "json"
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsx(
          DynamicForm,
          {
            schema: stepSchema,
            isSubmitLoading: isResumingWorkflow,
            submitButtonLabel: "Resume",
            onSubmit: (data) => {
              handleResumeWorkflow({
                stepId: step.stepId,
                runId: step.runId,
                suspendPayload: step.suspendPayload,
                context: data
              });
            }
          }
        )
      ] });
    }),
    hasWorkflowActivePaths && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx("hr", { className: "border-border1 border-sm my-5" }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-4", children: Object.entries(workflowActivePaths)?.map(([stepId, { status: pathStatus, stepPath }]) => {
        return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-1", children: stepPath?.map((path, idx) => {
          return /* @__PURE__ */ jsxRuntime.jsx(LegacyWorkflowStatus, { stepId, pathStatus, path }, idx);
        }) }, stepId);
      }) })
    ] }),
    result && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx("hr", { className: "border-border1 border-sm my-5" }),
      /* @__PURE__ */ jsxRuntime.jsx(WorkflowResult, { sanitizedJsonResult: sanitizedOutput, jsonResult: JSON.stringify(restResult, null, 2) })
    ] })
  ] }) });
}

const Slider = React__namespace.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntime.jsxs(
  SliderPrimitive__namespace.Root,
  {
    ref,
    className: cn("relative flex w-full touch-none select-none items-center", className),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx(SliderPrimitive__namespace.Track, { className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20", children: /* @__PURE__ */ jsxRuntime.jsx(SliderPrimitive__namespace.Range, { className: "absolute h-full bg-primary/50" }) }),
      /* @__PURE__ */ jsxRuntime.jsx(SliderPrimitive__namespace.Thumb, { className: "block h-4 w-4 rounded-full border border-primary/50 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" })
    ]
  }
));
Slider.displayName = SliderPrimitive__namespace.Root.displayName;

const ZoomSlider = React.forwardRef(({ className, ...props }) => {
  const { zoom } = react$2.useViewport();
  const { zoomTo, zoomIn, zoomOut, fitView } = react$2.useReactFlow();
  return /* @__PURE__ */ jsxRuntime.jsxs(react$2.Panel, { className: cn("flex gap-1 rounded-md bg-primary-foreground p-1 text-foreground", className), ...props, children: [
    /* @__PURE__ */ jsxRuntime.jsx(Button$1, { variant: "ghost", size: "icon", onClick: () => zoomOut({ duration: 300 }), children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Minus, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxRuntime.jsx(
      Slider,
      {
        className: "w-[140px]",
        value: [zoom],
        min: 0.01,
        max: 1,
        step: 0.01,
        onValueChange: (values) => {
          zoomTo(values[0]);
        }
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(Button$1, { variant: "ghost", size: "icon", onClick: () => zoomIn({ duration: 300 }), children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Plus, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxRuntime.jsxs(Button$1, { className: "min-w-20 tabular-nums", variant: "ghost", onClick: () => zoomTo(1, { duration: 300 }), children: [
      (100 * zoom).toFixed(0),
      "%"
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(Button$1, { variant: "ghost", size: "icon", onClick: () => fitView({ duration: 300, maxZoom: 1 }), children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Maximize, { className: "h-4 w-4" }) })
  ] });
});
ZoomSlider.displayName = "ZoomSlider";

function WorkflowNestedGraph({ stepGraph, open, workflowName }) {
  const { nodes: initialNodes, edges: initialEdges } = constructNodesAndEdges({
    stepGraph
  });
  const [isMounted, setIsMounted] = React.useState(false);
  const [nodes, _, onNodesChange] = react$2.useNodesState(initialNodes);
  const [edges] = react$2.useEdgesState(initialEdges);
  const { steps } = useCurrentRun();
  const nodeTypes = {
    "default-node": (props) => /* @__PURE__ */ jsxRuntime.jsx(WorkflowDefaultNode, { parentWorkflowName: workflowName, ...props }),
    "condition-node": WorkflowConditionNode,
    "after-node": WorkflowAfterNode,
    "loop-result-node": WorkflowLoopResultNode,
    "nested-node": (props) => /* @__PURE__ */ jsxRuntime.jsx(WorkflowNestedNode, { parentWorkflowName: workflowName, ...props })
  };
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        setIsMounted(true);
      }, 500);
    }
  }, [open]);
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full h-full relative bg-surface1", children: isMounted ? /* @__PURE__ */ jsxRuntime.jsxs(
    react$2.ReactFlow,
    {
      nodes,
      edges: edges.map((e) => ({
        ...e,
        style: {
          ...e.style,
          stroke: steps[`${workflowName}.${e.data?.previousStepId}`]?.status === "success" && steps[`${workflowName}.${e.data?.nextStepId}`] ? "#22c55e" : void 0
        }
      })),
      fitView: true,
      fitViewOptions: {
        maxZoom: 1
      },
      minZoom: 0.01,
      maxZoom: 1,
      nodeTypes,
      onNodesChange,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(ZoomSlider, { position: "bottom-left" }),
        /* @__PURE__ */ jsxRuntime.jsx(react$2.MiniMap, { pannable: true, zoomable: true, maskColor: "#121212", bgColor: "#171717", nodeColor: "#2c2c2c" }),
        /* @__PURE__ */ jsxRuntime.jsx(react$2.Background, { variant: react$2.BackgroundVariant.Lines, gap: 12, size: 0.5 })
      ]
    }
  ) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(Spinner, {}) }) });
}

const WorkflowNestedGraphContext = React.createContext(
  {}
);
function WorkflowNestedGraphProvider({ children }) {
  const [stepGraph, setStepGraph] = React.useState(null);
  const [parentStepGraphList, setParentStepGraphList] = React.useState([]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [label, setLabel] = React.useState("");
  const [fullStep, setFullStep] = React.useState("");
  const [switching, setSwitching] = React.useState(false);
  const closeNestedGraph = () => {
    if (parentStepGraphList.length) {
      setSwitching(true);
      const lastStepGraph = parentStepGraphList[parentStepGraphList.length - 1];
      setStepGraph(lastStepGraph.stepGraph);
      setLabel(lastStepGraph.label);
      setFullStep(lastStepGraph.fullStep);
      setParentStepGraphList(parentStepGraphList.slice(0, -1));
      setTimeout(() => {
        setSwitching(false);
      }, 500);
    } else {
      setOpenDialog(false);
      setStepGraph(null);
      setLabel("");
      setFullStep("");
    }
  };
  const showNestedGraph = ({
    label: newLabel,
    stepGraph: newStepGraph,
    fullStep: newFullStep
  }) => {
    if (stepGraph) {
      setSwitching(true);
      setParentStepGraphList([...parentStepGraphList, { stepGraph, label, fullStep }]);
    }
    setLabel(newLabel);
    setFullStep(newFullStep);
    setStepGraph(newStepGraph);
    setOpenDialog(true);
    setTimeout(() => {
      setSwitching(false);
    }, 500);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(
    WorkflowNestedGraphContext.Provider,
    {
      value: {
        showNestedGraph,
        closeNestedGraph
      },
      children: [
        children,
        /* @__PURE__ */ jsxRuntime.jsx(Dialog, { open: openDialog, onOpenChange: closeNestedGraph, children: /* @__PURE__ */ jsxRuntime.jsx(DialogPortal, { children: /* @__PURE__ */ jsxRuntime.jsxs(DialogContent, { className: "w-[45rem] h-[45rem] max-w-[unset] bg-[#121212] p-[0.5rem]", children: [
          /* @__PURE__ */ jsxRuntime.jsxs(DialogTitle, { className: "flex items-center gap-1.5 absolute top-2.5 left-2.5", children: [
            /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Workflow, { className: "text-current w-4 h-4" }),
            /* @__PURE__ */ jsxRuntime.jsxs(Text, { size: "xs", weight: "medium", className: "text-mastra-el-6 capitalize", children: [
              label,
              " workflow"
            ] })
          ] }),
          switching ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(Spinner, {}) }) : /* @__PURE__ */ jsxRuntime.jsx(react$2.ReactFlowProvider, { children: /* @__PURE__ */ jsxRuntime.jsx(WorkflowNestedGraph, { stepGraph, open: openDialog, workflowName: fullStep }) })
        ] }) }) })
      ]
    }
  );
}

function WorkflowNestedNode({
  data,
  parentWorkflowName
}) {
  const [isInputOpen, setIsInputOpen] = React.useState(false);
  const [isOutputOpen, setIsOutputOpen] = React.useState(false);
  const [isErrorOpen, setIsErrorOpen] = React.useState(false);
  const [isMapConfigOpen, setIsMapConfigOpen] = React.useState(false);
  const { steps, isRunning } = useCurrentRun();
  const { showNestedGraph } = React.useContext(WorkflowNestedGraphContext);
  const { label, description, withoutTopHandle, withoutBottomHandle, stepGraph, mapConfig } = data;
  const fullLabel = parentWorkflowName ? `${parentWorkflowName}.${label}` : label;
  const step = steps[fullLabel];
  const dialogContentClass = "bg-surface2 rounded-lg border-sm border-border1 max-w-4xl w-full px-0";
  const dialogTitleClass = "border-b-sm border-border1 pb-4 px-6";
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    !withoutTopHandle && /* @__PURE__ */ jsxRuntime.jsx(react$2.Handle, { type: "target", position: react$2.Position.Top, style: { visibility: "hidden" } }),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: cn(
          "bg-surface3 rounded-lg w-[274px] border-sm border-border1 pt-2",
          step?.status === "success" && "ring-2 ring-accent1",
          step?.status === "failed" && "ring-2 ring-accent2"
        ),
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: cn("flex items-center gap-2 px-3", !description && "pb-2"), children: [
            isRunning && /* @__PURE__ */ jsxRuntime.jsxs(Icon, { children: [
              step?.status === "failed" && /* @__PURE__ */ jsxRuntime.jsx(CrossIcon, { className: "text-accent2" }),
              step?.status === "success" && /* @__PURE__ */ jsxRuntime.jsx(CheckIcon, { className: "text-accent1" }),
              step?.status === "suspended" && /* @__PURE__ */ jsxRuntime.jsx(lucideReact.PauseIcon, { className: "text-icon3" }),
              step?.status === "running" && /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "text-icon6 animate-spin" }),
              !step && /* @__PURE__ */ jsxRuntime.jsx(lucideReact.CircleDashed, { className: "text-icon2" })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs(Txt, { variant: "ui-lg", className: "text-icon6 font-medium inline-flex items-center gap-1 justify-between w-full", children: [
              label,
              " ",
              step?.startedAt && /* @__PURE__ */ jsxRuntime.jsx(Clock, { startedAt: step.startedAt, endedAt: step.endedAt })
            ] })
          ] }),
          description && /* @__PURE__ */ jsxRuntime.jsx(Txt, { variant: "ui-sm", className: "text-icon3 px-3 pb-2", children: description }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center bg-surface4 border-t-sm border-border1 px-2 py-1 gap-2 rounded-b-lg", children: [
            /* @__PURE__ */ jsxRuntime.jsx(Button, { onClick: () => showNestedGraph({ label, fullStep: fullLabel, stepGraph }), children: "View workflow" }),
            mapConfig && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
              /* @__PURE__ */ jsxRuntime.jsx(Button, { onClick: () => setIsMapConfigOpen(true), children: "Map config" }),
              /* @__PURE__ */ jsxRuntime.jsx(Dialog, { open: isMapConfigOpen, onOpenChange: setIsMapConfigOpen, children: /* @__PURE__ */ jsxRuntime.jsxs(DialogContent, { className: dialogContentClass, children: [
                /* @__PURE__ */ jsxRuntime.jsxs(DialogTitle, { className: dialogTitleClass, children: [
                  label,
                  " map config"
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-4 overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx(CodeDialogContent, { data: mapConfig }) })
              ] }) })
            ] }),
            step?.input && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
              /* @__PURE__ */ jsxRuntime.jsx(Button, { onClick: () => setIsInputOpen(true), children: "Input" }),
              /* @__PURE__ */ jsxRuntime.jsx(Dialog, { open: isInputOpen, onOpenChange: setIsInputOpen, children: /* @__PURE__ */ jsxRuntime.jsxs(DialogContent, { className: dialogContentClass, children: [
                /* @__PURE__ */ jsxRuntime.jsxs(DialogTitle, { className: dialogTitleClass, children: [
                  label,
                  " input"
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-4 overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx(CodeDialogContent, { data: step.input }) })
              ] }) })
            ] }),
            step?.output && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
              /* @__PURE__ */ jsxRuntime.jsx(Button, { onClick: () => setIsOutputOpen(true), children: "Output" }),
              /* @__PURE__ */ jsxRuntime.jsx(Dialog, { open: isOutputOpen, onOpenChange: setIsOutputOpen, children: /* @__PURE__ */ jsxRuntime.jsxs(DialogContent, { className: dialogContentClass, children: [
                /* @__PURE__ */ jsxRuntime.jsxs(DialogTitle, { className: dialogTitleClass, children: [
                  label,
                  " output"
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-4 overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx(CodeDialogContent, { data: step.output }) })
              ] }) })
            ] }),
            step?.error && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
              /* @__PURE__ */ jsxRuntime.jsx(Button, { onClick: () => setIsErrorOpen(true), children: "Error" }),
              /* @__PURE__ */ jsxRuntime.jsx(Dialog, { open: isErrorOpen, onOpenChange: setIsErrorOpen, children: /* @__PURE__ */ jsxRuntime.jsxs(DialogContent, { className: dialogContentClass, children: [
                /* @__PURE__ */ jsxRuntime.jsxs(DialogTitle, { className: dialogTitleClass, children: [
                  label,
                  " error"
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-4 overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx(CodeDialogContent, { data: step?.error }) })
              ] }) })
            ] })
          ] })
        ]
      }
    ),
    !withoutBottomHandle && /* @__PURE__ */ jsxRuntime.jsx(react$2.Handle, { type: "source", position: react$2.Position.Bottom, style: { visibility: "hidden" } })
  ] });
}

function WorkflowGraphInner({ workflow, onShowTrace }) {
  const { nodes: initialNodes, edges: initialEdges } = constructNodesAndEdges(workflow);
  const [nodes, _, onNodesChange] = react$2.useNodesState(initialNodes);
  const [edges] = react$2.useEdgesState(initialEdges);
  const { steps, runId } = useCurrentRun();
  const nodeTypes = {
    "default-node": (props) => /* @__PURE__ */ jsxRuntime.jsx(WorkflowDefaultNode, { onShowTrace, ...props }),
    "condition-node": WorkflowConditionNode,
    "after-node": WorkflowAfterNode,
    "loop-result-node": WorkflowLoopResultNode,
    "nested-node": WorkflowNestedNode
  };
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full h-full bg-surface1", children: /* @__PURE__ */ jsxRuntime.jsxs(
    react$2.ReactFlow,
    {
      nodes,
      edges: edges.map((e) => ({
        ...e,
        style: {
          ...e.style,
          stroke: steps[e.data?.previousStepId]?.status === "success" && steps[e.data?.nextStepId] ? "#22c55e" : void 0
        }
      })),
      nodeTypes,
      onNodesChange,
      fitView: true,
      fitViewOptions: {
        maxZoom: 1
      },
      minZoom: 0.01,
      maxZoom: 1,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(ZoomSlider, { position: "bottom-left" }),
        /* @__PURE__ */ jsxRuntime.jsx(react$2.MiniMap, { pannable: true, zoomable: true, maskColor: "#121212", bgColor: "#171717", nodeColor: "#2c2c2c" }),
        /* @__PURE__ */ jsxRuntime.jsx(react$2.Background, { variant: react$2.BackgroundVariant.Dots, gap: 12, size: 0.5 })
      ]
    }
  ) });
}

function WorkflowGraph({ workflowId, onShowTrace, workflow, isLoading }) {
  const { snapshot } = React.useContext(WorkflowRunContext);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "h-full" }) });
  }
  if (!workflow) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid h-full place-items-center", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(lucideReact.AlertCircleIcon, {}),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        "We couldn't find ",
        lodashTitleCase(workflowId),
        " workflow."
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(WorkflowNestedGraphProvider, { children: /* @__PURE__ */ jsxRuntime.jsx(react$2.ReactFlowProvider, { children: /* @__PURE__ */ jsxRuntime.jsx(
    WorkflowGraphInner,
    {
      workflow: snapshot?.serializedStepGraph ? { stepGraph: snapshot?.serializedStepGraph } : workflow,
      onShowTrace
    }
  ) }) }, snapshot?.runId ?? workflowId);
}

function WorkflowTrigger({
  workflowId,
  setRunId,
  workflow,
  isLoading,
  createWorkflowRun,
  startWorkflowRun,
  resumeWorkflow,
  watchWorkflow,
  watchResult,
  isWatchingWorkflow,
  isResumingWorkflow
}) {
  const { runtimeContext } = usePlaygroundStore();
  const { result, setResult, payload, setPayload } = React.useContext(WorkflowRunContext);
  const [suspendedSteps, setSuspendedSteps] = React.useState([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const triggerSchema = workflow?.inputSchema;
  const handleExecuteWorkflow = async (data) => {
    try {
      if (!workflow) return;
      setIsRunning(true);
      setResult(null);
      const { runId } = await createWorkflowRun({ workflowId });
      setRunId?.(runId);
      watchWorkflow({ workflowId, runId });
      startWorkflowRun({ workflowId, runId, input: data, runtimeContext });
    } catch (err) {
      setIsRunning(false);
      sonner.toast.error("Error executing workflow");
    }
  };
  const handleResumeWorkflow = async (step) => {
    if (!workflow) return;
    const { stepId, runId: prevRunId, resumeData } = step;
    const { runId } = await createWorkflowRun({ workflowId, prevRunId });
    watchWorkflow({ workflowId, runId });
    await resumeWorkflow({
      step: stepId,
      runId,
      resumeData,
      workflowId,
      runtimeContext
    });
  };
  const watchResultToUse = result ?? watchResult;
  React.useEffect(() => {
    setIsRunning(isWatchingWorkflow);
  }, [isWatchingWorkflow]);
  React.useEffect(() => {
    if (!watchResultToUse?.payload?.workflowState?.steps || !result?.runId) return;
    const suspended = Object.entries(watchResultToUse.payload.workflowState.steps).filter(([_, { status }]) => status === "suspended").map(([stepId, { payload: payload2 }]) => ({
      stepId,
      runId: result.runId,
      suspendPayload: payload2,
      isLoading: false
    }));
    setSuspendedSteps(suspended);
  }, [watchResultToUse, result]);
  React.useEffect(() => {
    if (watchResult) {
      setResult(watchResult);
    }
  }, [watchResult]);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntime.jsx(ScrollArea, { className: "h-[calc(100vh-126px)] pt-2 px-4 pb-4 text-xs", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "h-10" }),
      /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "h-10" })
    ] }) });
  }
  if (!workflow) return null;
  const isSuspendedSteps = suspendedSteps.length > 0;
  const zodInputSchema = triggerSchema ? resolveSerializedZodOutput(jsonSchemaToZod(superjson.parse(triggerSchema))) : null;
  const { sanitizedOutput, ...restResult } = result || {};
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "h-full pt-3 pb-12", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "space-y-4 px-5 pb-5 border-b-sm border-border1", children: [
      (isResumingWorkflow || isSuspendedSteps && isWatchingWorkflow) && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "py-2 px-5 flex items-center gap-2 bg-surface5 -mx-5 -mt-5 border-b-sm border-border1", children: [
        /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "animate-spin text-icon6" }) }),
        /* @__PURE__ */ jsxRuntime.jsx(Txt, { children: "Resuming workflow" })
      ] }),
      !isSuspendedSteps && /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: zodInputSchema ? /* @__PURE__ */ jsxRuntime.jsx(
        DynamicForm,
        {
          schema: zodInputSchema,
          defaultValues: payload,
          isSubmitLoading: isWatchingWorkflow,
          submitButtonLabel: "Run",
          onSubmit: (data) => {
            setPayload(data);
            handleExecuteWorkflow(data);
          }
        }
      ) : /* @__PURE__ */ jsxRuntime.jsx(
        Button,
        {
          className: "w-full",
          variant: "light",
          disabled: isRunning,
          onClick: () => handleExecuteWorkflow(null),
          children: isRunning ? /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Loader2, { className: "animate-spin" }) }) : "Trigger"
        }
      ) }),
      !isWatchingWorkflow && isSuspendedSteps && suspendedSteps?.map((step) => {
        const stepDefinition = workflow.steps[step.stepId];
        const stepSchema = stepDefinition?.resumeSchema ? resolveSerializedZodOutput(jsonSchemaToZod(superjson.parse(stepDefinition.resumeSchema))) : z.z.record(z.z.string(), z.z.any());
        return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col px-4", children: [
          /* @__PURE__ */ jsxRuntime.jsx(Text, { variant: "secondary", className: "text-mastra-el-3", size: "xs", children: step.stepId }),
          step.suspendPayload && /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(
            CodeBlockDemo,
            {
              className: "w-full overflow-x-auto p-2",
              code: JSON.stringify(step.suspendPayload, null, 2),
              language: "json"
            }
          ) }),
          /* @__PURE__ */ jsxRuntime.jsx(
            DynamicForm,
            {
              schema: stepSchema,
              isSubmitLoading: isResumingWorkflow,
              submitButtonLabel: "Resume",
              onSubmit: (data) => {
                handleResumeWorkflow({
                  stepId: step.stepId,
                  runId: step.runId,
                  suspendPayload: step.suspendPayload,
                  resumeData: data});
              }
            }
          )
        ] });
      })
    ] }),
    result && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-5 border-b-sm border-border1", children: /* @__PURE__ */ jsxRuntime.jsx(WorkflowJsonDialog, { result: restResult }) }),
    result && /* @__PURE__ */ jsxRuntime.jsx(WorkflowResultSection, { result, workflow })
  ] });
}
const WorkflowResultSection = ({ result, workflow }) => {
  const workflowState = result.payload.workflowState;
  const hasResult = Object.keys(workflowState.steps || {}).length > 0;
  if (!hasResult) return null;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "p-5", children: [
    /* @__PURE__ */ jsxRuntime.jsx(Txt, { variant: "ui-sm", className: "text-icon3", children: "Final Output" }),
    /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "pt-4", children: Object.entries(workflowState.steps || {}).map(([stepId, stepResult]) => {
      const stepDefinition = workflow.steps[stepId];
      if (!stepDefinition) return null;
      return /* @__PURE__ */ jsxRuntime.jsx(
        "li",
        {
          className: "border-b-sm border-dashed border-border1 last:border-b-0 py-4 first:pt-0 last:pb-0",
          children: /* @__PURE__ */ jsxRuntime.jsx(WorkflowResultFinishedStep, { stepResult: stepResult.output, stepDefinition })
        },
        stepId
      );
    }) })
  ] });
};
const WorkflowResultFinishedStep = ({ stepResult, stepDefinition }) => {
  const id = React.useId();
  try {
    const zodObjectSchema = resolveSerializedZodOutput(jsonSchemaToZod(superjson.parse(stepDefinition.outputSchema)));
    if (zodObjectSchema?._def?.typeName === "ZodString") {
      return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-1", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Footprints, { className: "text-icon3" }) }),
          /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "label", htmlFor: id, variant: "ui-sm", className: "text-icon3", children: stepDefinition.description || stepDefinition.id })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(Input, { id, defaultValue: stepResult, readOnly: true })
      ] });
    }
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2 pb-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Footprints, { className: "text-icon3" }) }),
        /* @__PURE__ */ jsxRuntime.jsx(Txt, { variant: "ui-sm", className: "text-icon3", children: stepDefinition.description || stepDefinition.id })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(
        DynamicForm,
        {
          schema: zodObjectSchema,
          defaultValues: stepResult,
          readOnly: true
        },
        JSON.stringify(stepResult)
      )
    ] });
  } catch (err) {
    console.error("Error parsing output schema", err);
    return /* @__PURE__ */ jsxRuntime.jsx(Txt, { children: "An error occured. Please open an issue on GitHub." });
  }
};
const WorkflowJsonDialog = ({ result }) => {
  const [open, setOpen] = React.useState(false);
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(Button, { variant: "light", onClick: () => setOpen(true), className: "w-full", size: "lg", children: [
      /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Braces, { className: "text-icon3" }) }),
      "Open Workflow Execution (JSON)"
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntime.jsx(DialogPortal, { children: /* @__PURE__ */ jsxRuntime.jsxs(DialogContent, { className: "max-w-6xl max-h-[90vh] overflow-y-auto overflow-x-hidden bg-surface2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(DialogTitle, { children: "Workflow Execution (JSON)" }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full h-full overflow-x-scroll", children: /* @__PURE__ */ jsxRuntime.jsx(SyntaxHighlighter$1, { data: result, className: "p-4" }) })
    ] }) }) })
  ] });
};

const WorkflowRuns = ({ workflowId, runId, isLoading, runs, onPressRun }) => {
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "h-[600px]" }) });
  }
  if (runs.length === 0) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntime.jsx(Txt, { variant: "ui-md", className: "text-icon6 text-center", children: "No previous run" }) });
  }
  return /* @__PURE__ */ jsxRuntime.jsx("ol", { className: "pb-10", children: runs.map((run) => /* @__PURE__ */ jsxRuntime.jsx("li", { children: /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      onClick: () => onPressRun({ workflowId, runId: run.runId }),
      className: clsx("px-3 py-2 border-b-sm border-border1 block w-full hover:bg-surface4 text-left", {
        "bg-surface4": run.runId === runId
      }),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(Txt, { variant: "ui-lg", className: "font-medium text-icon6 truncate", as: "p", children: run.runId }),
        /* @__PURE__ */ jsxRuntime.jsx(Txt, { variant: "ui-sm", className: "font-medium text-icon3 truncate", as: "p", children: typeof run?.snapshot === "string" ? "" : run?.snapshot?.timestamp ? dateFns.formatDate(run?.snapshot?.timestamp, "MMM d, yyyy h:mm a") : "" })
      ]
    }
  ) }, run.runId)) });
};

const DataTable = ({
  columns,
  data,
  pagination,
  gotoNextPage,
  gotoPreviousPage,
  getRowId,
  selectedRowId,
  isLoading,
  emptyText,
  onClick
}) => {
  const [sorting, setSorting] = React.useState([]);
  const [{ pageIndex, pageSize }, setPagination] = React.useState({
    pageIndex: pagination ? Math.floor(pagination.offset / pagination.limit) : 0,
    pageSize: pagination?.limit ?? 10
  });
  const [rowSelection, setRowSelection] = React.useState({});
  const table = reactTable.useReactTable({
    data,
    columns,
    getCoreRowModel: reactTable.getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination ? Math.ceil(pagination.total / pagination.limit) : -1,
    state: {
      sorting,
      pagination: {
        pageIndex,
        pageSize
      },
      rowSelection
    },
    getRowId,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableRowSelection: true,
    enableMultiRowSelection: false,
    onRowSelectionChange: setRowSelection
  });
  const emptyNode = /* @__PURE__ */ jsxRuntime.jsx(Row, { children: /* @__PURE__ */ jsxRuntime.jsx(Cell, { colSpan: columns.length, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "py-12 text-center w-full", children: [
    "No ",
    emptyText || "results"
  ] }) }) });
  const ths = table.getHeaderGroups()[0];
  const rows = table.getRowModel().rows;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(Table, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(Thead, { className: "sticky top-0 bg-surface2", children: ths.headers.map((header) => {
        const size = header.column.getSize();
        const meta = header.column.columnDef.meta;
        return /* @__PURE__ */ jsxRuntime.jsx(Th, { style: { width: meta?.width || size || "auto" }, children: header.isPlaceholder ? null : reactTable.flexRender(header.column.columnDef.header, header.getContext()) }, header.id);
      }) }),
      /* @__PURE__ */ jsxRuntime.jsx(Tbody, { children: isLoading ? /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: Array.from({ length: 3 }).map((_, rowIndex) => /* @__PURE__ */ jsxRuntime.jsx(Row, { onClick: () => {
      }, children: Array.from({ length: columns.length }).map((_2, cellIndex) => /* @__PURE__ */ jsxRuntime.jsx(Cell, { children: /* @__PURE__ */ jsxRuntime.jsx(Skeleton, { className: "h-4 w-1/2" }) }, `row-${rowIndex}-cell-${cellIndex}`)) }, rowIndex)) }) : rows?.length > 0 ? rows.map((row) => /* @__PURE__ */ jsxRuntime.jsx(
        Row,
        {
          "data-state": (row.getIsSelected() || row.id === selectedRowId) && "selected",
          onClick: () => onClick?.(row.original),
          children: row.getVisibleCells().map((cell) => reactTable.flexRender(cell.column.columnDef.cell, cell.getContext()))
        },
        row.id
      )) : emptyNode })
    ] }),
    pagination && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-4 flex items-center justify-between px-2", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-muted-foreground text-sm", children: [
        "Showing ",
        pagination.offset + 1,
        " to ",
        Math.min(pagination.offset + data.length, pagination.total),
        " of",
        " ",
        pagination.total,
        " results"
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center space-x-6 lg:space-x-8", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(Button$1, { variant: "outline", size: "sm", onClick: gotoPreviousPage, disabled: !pagination.offset, children: "Previous" }),
        /* @__PURE__ */ jsxRuntime.jsx(Button$1, { variant: "outline", size: "sm", onClick: gotoNextPage, disabled: !pagination.hasMore, children: "Next" })
      ] }) })
    ] })
  ] });
};

function MainContentLayout({
  children,
  className,
  style
}) {
  const devStyleRequested = devUIStyleRequested("MainContentLayout");
  return /* @__PURE__ */ jsxRuntime.jsx(
    "main",
    {
      className: cn(`grid grid-rows-[auto_1fr] h-full items-start content-start`, className),
      style: { ...style, ...devStyleRequested ? { border: "3px dotted red" } : {} },
      children
    }
  );
}
function MainContentContent({
  children,
  className,
  isCentered = false,
  isDivided = false,
  hasLeftServiceColumn = false,
  style
}) {
  const devStyleRequested = devUIStyleRequested("MainContentContent");
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: cn(
        `grid overflow-y-auto h-full `,
        `overflow-x-auto min-w-[min-content]`,
        {
          "items-start content-start": !isCentered && !isDivided && !hasLeftServiceColumn,
          "grid place-items-center": isCentered,
          "grid-cols-[1fr_1fr]": isDivided && !hasLeftServiceColumn,
          "grid-cols-[auto_1fr_1fr]": isDivided && hasLeftServiceColumn,
          "grid-cols-[auto_1fr]": !isDivided && hasLeftServiceColumn
        },
        className
      ),
      style: { ...style, ...devStyleRequested ? { border: "3px dotted orange" } : {} },
      children
    }
  );
}
function devUIStyleRequested(name) {
  try {
    const raw = localStorage.getItem("add-dev-style-to-components");
    if (!raw) return false;
    const components = raw.split(",").map((c) => c.trim()).filter(Boolean);
    return components.includes(name);
  } catch (error) {
    console.error("Error reading or parsing localStorage:", error);
    return false;
  }
}

const Threads = ({ children }) => {
  return /* @__PURE__ */ jsxRuntime.jsx("nav", { className: "bg-surface2 border-r-sm border-border1 min-h-full overflow-hidden", children });
};
const ThreadLink = ({ children, as: Component = "a", href, className, prefetch, to }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    Component,
    {
      href,
      prefetch,
      to,
      className: clsx("text-ui-sm flex h-full w-full flex-col justify-center font-medium", className),
      children
    }
  );
};
const ThreadList = ({ children }) => {
  return /* @__PURE__ */ jsxRuntime.jsx("ol", { children });
};
const ThreadItem = ({ children, isActive }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "li",
    {
      className: clsx(
        "border-b-sm border-border1 hover:bg-surface3 group flex h-[54px] items-center justify-between gap-2 pl-5 py-2",
        isActive && "bg-surface4"
      ),
      children
    }
  );
};
const ThreadDeleteButton = ({ onClick }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    Button,
    {
      className: "shrink-0 border-none bg-transparent opacity-0 transition-all group-focus-within:opacity-100 group-hover:opacity-100",
      onClick,
      children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { children: /* @__PURE__ */ jsxRuntime.jsx(lucideReact.X, { "aria-label": "delete thread", className: "text-icon3" }) })
    }
  );
};

const Breadcrumb = ({ children, label }) => {
  return /* @__PURE__ */ jsxRuntime.jsx("nav", { "aria-label": label, children: /* @__PURE__ */ jsxRuntime.jsx("ol", { className: "gap-sm flex items-center", children }) });
};
const Crumb = ({ className, as, isCurrent, ...props }) => {
  const Root = as || "span";
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx("li", { className: "flex h-full items-center", children: /* @__PURE__ */ jsxRuntime.jsx(
      Root,
      {
        "aria-current": isCurrent ? "page" : void 0,
        className: clsx("text-ui-lg leading-ui-lg font-medium", isCurrent ? "text-white" : "text-icon3", className),
        ...props
      }
    ) }),
    !isCurrent && /* @__PURE__ */ jsxRuntime.jsx("li", { role: "separator", className: "flex h-full items-center", children: /* @__PURE__ */ jsxRuntime.jsx(Icon, { className: "text-icon3", children: /* @__PURE__ */ jsxRuntime.jsx(SlashIcon, {}) }) })
  ] });
};

const DarkLogo = (props) => /* @__PURE__ */ jsxRuntime.jsxs("svg", { width: "100", height: "100", viewBox: "0 0 100 100", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M49.9996 13.1627C29.6549 13.1627 13.1622 29.6553 13.1622 50.0001C13.1622 70.3449 29.6549 86.8375 49.9996 86.8375C70.3444 86.8375 86.8371 70.3449 86.8371 50.0001C86.8371 29.6553 70.3444 13.1627 49.9996 13.1627ZM10 50.0001C10 27.9089 27.9084 10.0005 49.9996 10.0005C72.0908 10.0005 89.9992 27.9089 89.9992 50.0001C89.9992 72.0913 72.0908 89.9997 49.9996 89.9997C27.9084 89.9997 10 72.0913 10 50.0001Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M43.3709 19.4582C35.493 17.9055 28.4985 19.4076 23.954 23.9521C19.4094 28.4967 17.9073 35.4911 19.46 43.3691C21.0103 51.235 25.5889 59.7924 32.8993 67.1028C40.2097 74.4132 48.7671 78.9918 56.633 80.5421C64.511 82.0948 71.5054 80.5927 76.05 76.0481C80.5945 71.5036 82.0966 64.5091 80.5439 56.6312C78.9936 48.7653 74.415 40.2079 67.1046 32.8975C59.7942 25.5871 51.2368 21.0085 43.3709 19.4582ZM43.9824 16.3557C52.5432 18.043 61.6476 22.9685 69.3406 30.6615C77.0336 38.3545 81.9591 47.4589 83.6464 56.0197C85.3313 64.5685 83.8044 72.7657 78.286 78.2841C72.7675 83.8026 64.5704 85.3295 56.0216 83.6446C47.4607 81.9573 38.3563 77.0317 30.6633 69.3388C22.9704 61.6458 18.0448 52.5414 16.3575 43.9805C14.6726 35.4317 16.1995 27.2346 21.718 21.7161C27.2364 16.1977 35.4336 14.6708 43.9824 16.3557Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M65.8864 51.719H34.314V48.5568H65.8864V51.719Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M59.2351 43.2352L43.194 59.2763L40.958 57.0403L56.9991 40.9992L59.2351 43.2352Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M43.1969 40.9992L59.2379 57.0403L57.002 59.2763L40.9609 43.2352L43.1969 40.9992Z",
      fill: "currentColor"
    }
  ),
  /* @__PURE__ */ jsxRuntime.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M23.7151 33.0924C17.0466 37.565 13.1629 43.573 13.1629 49.9999C13.1629 56.4269 17.0466 62.4349 23.7151 66.9075C30.3734 71.3733 39.662 74.1867 50.0004 74.1867C60.3388 74.1867 69.6274 71.3733 76.2857 66.9075C82.9541 62.4349 86.8378 56.4269 86.8378 49.9999C86.8378 43.573 82.9541 37.565 76.2857 33.0924C69.6274 28.6266 60.3388 25.8132 50.0004 25.8132C39.662 25.8132 30.3734 28.6266 23.7151 33.0924ZM21.9537 30.4662C29.2002 25.6059 39.1209 22.651 50.0004 22.651C60.8799 22.651 70.8006 25.6059 78.0471 30.4662C85.2834 35.3197 90 42.1957 90 49.9999C90 57.8042 85.2834 64.6802 78.0471 69.5337C70.8006 74.394 60.8799 77.3489 50.0004 77.3489C39.1209 77.3489 29.2002 74.394 21.9537 69.5337C14.7174 64.6802 10.0008 57.8042 10.0008 49.9999C10.0008 42.1957 14.7174 35.3197 21.9537 30.4662Z",
      fill: "currentColor"
    }
  )
] });

const Entity = ({ children, className, onClick }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      tabIndex: onClick ? 0 : void 0,
      onKeyDown: (e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      },
      className: clsx(
        "flex gap-3 group/entity bg-surface3 rounded-lg border-sm border-border1 py-3 px-4",
        onClick && "cursor-pointer hover:bg-surface4 transition-all",
        className
      ),
      onClick,
      children
    }
  );
};
const EntityIcon = ({ children, className }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(Icon, { size: "lg", className: clsx("text-icon3 mt-1", className), children });
};
const EntityName = ({ children, className }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "p", variant: "ui-lg", className: clsx("text-icon6 font-medium", className), children });
};
const EntityDescription = ({ children, className }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(Txt, { as: "p", variant: "ui-sm", className: clsx("text-icon3", className), children });
};
const EntityContent = ({ children, className }) => {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className, children });
};

const EmptyState = ({
  iconSlot,
  titleSlot,
  descriptionSlot,
  actionSlot,
  as: Component = "div"
}) => {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex w-[340px] flex-col items-center justify-center text-center", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-auto [&>svg]:w-[126px]", children: iconSlot }),
    /* @__PURE__ */ jsxRuntime.jsx(Component, { className: "text-icon6 pt-[34px] font-serif text-[1.75rem] font-semibold", children: titleSlot }),
    /* @__PURE__ */ jsxRuntime.jsx(Txt, { variant: "ui-lg", className: "text-icon3 pb-[34px]", children: descriptionSlot }),
    actionSlot
  ] });
};

function usePolling({
  fetchFn,
  interval = 3e3,
  enabled = false,
  onSuccess,
  onError,
  shouldContinue = () => true,
  restartPolling = false
}) {
  const [isPolling, setIsPolling] = React.useState(enabled);
  const [error, setError] = React.useState(null);
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [firstCallLoading, setFirstCallLoading] = React.useState(false);
  const timeoutRef = React.useRef(null);
  const mountedRef = React.useRef(true);
  const [restart, setRestart] = React.useState(restartPolling);
  const cleanup = React.useCallback(() => {
    console.log("cleanup");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  const stopPolling = React.useCallback(() => {
    console.log("stopPolling");
    setIsPolling(false);
    cleanup();
  }, [cleanup]);
  const startPolling = React.useCallback(() => {
    console.log("startPolling");
    setIsPolling(true);
    setError(null);
  }, []);
  const executePoll = React.useCallback(
    async (refetch2 = true) => {
      if (!mountedRef.current) return;
      setIsLoading(true);
      try {
        const result = await fetchFn();
        setData(result);
        setError(null);
        onSuccess?.(result);
        if (shouldContinue(result) && refetch2) {
          timeoutRef.current = setTimeout(executePoll, interval);
        } else {
          stopPolling();
        }
      } catch (err) {
        if (!mountedRef.current) return;
        setError(err);
        onError?.(err);
        stopPolling();
      } finally {
        if (mountedRef.current) {
          setFirstCallLoading(false);
          setIsLoading(false);
        }
      }
    },
    [fetchFn, interval, onSuccess, onError, shouldContinue, stopPolling]
  );
  const refetch = React.useCallback(
    (withPolling = false) => {
      console.log("refetch", { withPolling });
      if (withPolling) {
        setIsPolling(true);
      } else {
        executePoll(false);
      }
      setError(null);
    },
    [executePoll]
  );
  React.useEffect(() => {
    mountedRef.current = true;
    if (enabled && isPolling) {
      executePoll(true);
    }
    return () => {
      console.log("cleanup poll");
      mountedRef.current = false;
      cleanup();
    };
  }, [enabled, isPolling, executePoll, cleanup]);
  React.useEffect(() => {
    setRestart(restartPolling);
  }, [restartPolling]);
  React.useEffect(() => {
    if (restart && !isPolling) {
      setIsPolling(true);
      executePoll();
      setRestart(false);
    }
  }, [restart]);
  return {
    isPolling,
    isLoading,
    error,
    data,
    startPolling,
    stopPolling,
    firstCallLoading,
    refetch
  };
}

exports.AgentChat = AgentChat;
exports.AgentCoinIcon = AgentCoinIcon;
exports.AgentContext = AgentContext;
exports.AgentEvals = AgentEvals;
exports.AgentIcon = AgentIcon;
exports.AgentNetworkCoinIcon = AgentNetworkCoinIcon;
exports.AgentProvider = AgentProvider;
exports.AgentTraces = AgentTraces;
exports.AiIcon = AiIcon;
exports.ApiIcon = ApiIcon;
exports.Badge = Badge$1;
exports.BranchIcon = BranchIcon;
exports.Breadcrumb = Breadcrumb;
exports.Button = Button;
exports.Cell = Cell;
exports.CheckIcon = CheckIcon;
exports.ChevronIcon = ChevronIcon;
exports.CommitIcon = CommitIcon;
exports.CrossIcon = CrossIcon;
exports.Crumb = Crumb;
exports.DarkLogo = DarkLogo;
exports.DataTable = DataTable;
exports.DateTimeCell = DateTimeCell;
exports.DbIcon = DbIcon;
exports.DebugIcon = DebugIcon;
exports.DeploymentIcon = DeploymentIcon;
exports.DividerIcon = DividerIcon;
exports.DocsIcon = DocsIcon;
exports.DynamicForm = DynamicForm;
exports.EmptyState = EmptyState;
exports.Entity = Entity;
exports.EntityContent = EntityContent;
exports.EntityDescription = EntityDescription;
exports.EntityIcon = EntityIcon;
exports.EntityName = EntityName;
exports.EntryCell = EntryCell;
exports.EnvIcon = EnvIcon;
exports.EvaluatorCoinIcon = EvaluatorCoinIcon;
exports.FiltersIcon = FiltersIcon;
exports.FolderIcon = FolderIcon;
exports.GithubCoinIcon = GithubCoinIcon;
exports.GithubIcon = GithubIcon;
exports.GoogleIcon = GoogleIcon;
exports.Header = Header;
exports.HeaderAction = HeaderAction;
exports.HeaderGroup = HeaderGroup;
exports.HeaderTitle = HeaderTitle;
exports.HomeIcon = HomeIcon;
exports.Icon = Icon;
exports.InfoIcon = InfoIcon;
exports.JudgeIcon = JudgeIcon;
exports.LatencyIcon = LatencyIcon;
exports.LegacyWorkflowGraph = LegacyWorkflowGraph;
exports.LegacyWorkflowTrigger = LegacyWorkflowTrigger;
exports.LogsIcon = LogsIcon;
exports.MainContentContent = MainContentContent;
exports.MainContentLayout = MainContentLayout;
exports.MastraClientProvider = MastraClientProvider;
exports.MastraResizablePanel = MastraResizablePanel;
exports.McpCoinIcon = McpCoinIcon;
exports.McpServerIcon = McpServerIcon;
exports.MemoryIcon = MemoryIcon;
exports.NetworkChat = NetworkChat;
exports.NetworkContext = NetworkContext;
exports.NetworkProvider = NetworkProvider;
exports.OpenAIIcon = OpenAIIcon;
exports.PromptIcon = PromptIcon;
exports.RepoIcon = RepoIcon;
exports.Row = Row;
exports.ScoreIcon = ScoreIcon;
exports.SettingsIcon = SettingsIcon;
exports.SlashIcon = SlashIcon;
exports.Table = Table;
exports.Tbody = Tbody;
exports.Th = Th;
exports.Thead = Thead;
exports.ThreadDeleteButton = ThreadDeleteButton;
exports.ThreadItem = ThreadItem;
exports.ThreadLink = ThreadLink;
exports.ThreadList = ThreadList;
exports.Threads = Threads;
exports.ToolCoinIcon = ToolCoinIcon;
exports.ToolsIcon = ToolsIcon;
exports.TraceIcon = TraceIcon;
exports.TsIcon = TsIcon;
exports.Txt = Txt;
exports.TxtCell = TxtCell;
exports.UnitCell = UnitCell;
exports.VariablesIcon = VariablesIcon;
exports.WorkflowCoinIcon = WorkflowCoinIcon;
exports.WorkflowGraph = WorkflowGraph;
exports.WorkflowIcon = WorkflowIcon;
exports.WorkflowRunContext = WorkflowRunContext;
exports.WorkflowRunProvider = WorkflowRunProvider;
exports.WorkflowRuns = WorkflowRuns;
exports.WorkflowTraces = WorkflowTraces;
exports.WorkflowTrigger = WorkflowTrigger;
exports.useCurrentRun = useCurrentRun;
exports.useMastraClient = useMastraClient;
exports.usePlaygroundStore = usePlaygroundStore;
exports.usePolling = usePolling;
exports.useSpeechRecognition = useSpeechRecognition;
//# sourceMappingURL=index.cjs.js.map
