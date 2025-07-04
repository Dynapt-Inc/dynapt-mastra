'use strict';

// src/runtime-context/index.ts
var RuntimeContext = class {
  registry = /* @__PURE__ */ new Map();
  constructor(iterable) {
    this.registry = new Map(iterable);
  }
  /**
   * set a value with strict typing if `Values` is a Record and the key exists in it.
   */
  set(key, value) {
    this.registry.set(key, value);
  }
  /**
   * Get a value with its type
   */
  get(key) {
    return this.registry.get(key);
  }
  /**
   * Check if a key exists in the container
   */
  has(key) {
    return this.registry.has(key);
  }
  /**
   * Delete a value by key
   */
  delete(key) {
    return this.registry.delete(key);
  }
  /**
   * Clear all values from the container
   */
  clear() {
    this.registry.clear();
  }
  /**
   * Get all keys in the container
   */
  keys() {
    return this.registry.keys();
  }
  /**
   * Get all values in the container
   */
  values() {
    return this.registry.values();
  }
  /**
   * Get all entries in the container
   */
  entries() {
    return this.registry.entries();
  }
  /**
   * Get the size of the container
   */
  size() {
    return this.registry.size;
  }
  /**
   * Execute a function for each entry in the container
   */
  forEach(callbackfn) {
    this.registry.forEach(callbackfn);
  }
};

exports.RuntimeContext = RuntimeContext;
