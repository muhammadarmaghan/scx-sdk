"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchApi = void 0;
/**
 * Makes an API request using the Fetch API, with optional authentication.
 * @param {string} url - The URL to which the request is sent.
 * @param {FetchOptions} [options={}] - Options for the request, including method, headers, and body.
 * @param {AuthApi} auth - An instance of the `Auth` class to provide the authentication token.
 * @returns {Promise<Response>} - The response object from the fetch call.
 * @throws {Error} - Throws an error if the HTTP request fails.
 */
function fetchApi(url, options = {}, auth) {
    return __awaiter(this, void 0, void 0, function* () {
        const authToken = auth.getToken();
        const defaultHeaders = Object.assign({ 'Accept': '*/*', 'Content-Type': 'application/json' }, (options.authRequired && authToken && { 'Authorization': `Bearer ${authToken}` }));
        const fetchOptions = Object.assign(Object.assign({}, options), { headers: Object.assign(Object.assign({}, defaultHeaders), options.headers) });
        const response = yield fetch(url, fetchOptions);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response;
    });
}
exports.fetchApi = fetchApi;
