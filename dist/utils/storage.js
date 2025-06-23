"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheStorage = exports.createStorage = exports.NodeStorage = exports.BrowserStorage = void 0;
const isBrowser_1 = __importDefault(require("./isBrowser"));
/**
 * This class creates a storage adapter for browser using `localStorage`
 */
class BrowserStorage {
    constructor() {
        // this.prefix = `SCX_${Math.random().toString(36).substring(2, 9)}_`;
        this.prefix = `_`; // reload on app causing issues of fail identification of token in localStorage
    }
    getItem(key) {
        return localStorage.getItem(this.prefix + key);
    }
    setItem(key, value) {
        localStorage.setItem(this.prefix + key, value);
    }
    removeItem(key) {
        localStorage.removeItem(this.prefix + key);
    }
}
exports.BrowserStorage = BrowserStorage;
class NodeStorage {
    constructor() {
        this.storage = {};
    }
    getItem(key) {
        return this.storage[key] || null;
    }
    setItem(key, value) {
        this.storage[key] = value;
    }
    removeItem(key) {
        delete this.storage[key];
    }
}
exports.NodeStorage = NodeStorage;
/**
 * Creates a storage adapter for browser or node.js.
 * If called from a browser, it'll use `localStorage`, otherwise for node.js, it'll use an in-memory object.
 * @returns { StorageAdapter }
 */
function createStorage() {
    if ((0, isBrowser_1.default)()) {
        return new BrowserStorage();
    }
    else {
        return new NodeStorage();
    }
}
exports.createStorage = createStorage;
let cacheStorage;
function getCacheStorage() {
    if (!cacheStorage) {
        cacheStorage = new NodeStorage();
    }
    return cacheStorage;
}
exports.getCacheStorage = getCacheStorage;
