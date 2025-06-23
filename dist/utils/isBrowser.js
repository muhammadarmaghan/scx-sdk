"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * checks if the current environment is a browser or a server side one
 */
function isBrowser() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}
exports.default = isBrowser;
