import {AuthApi} from "../api/auth";

/**
 * Options for the `fetchApi` function, extending the standard `RequestInit`.
 * @typedef {object} FetchOptions
 * @property {'GET' | 'POST' | 'PUT' | 'DELETE'} [method] - The HTTP method to use for the request.
 * @property {HeadersInit} [headers] - Custom headers to include in the request.
 * @property {boolean} [authRequired] - Whether the request requires authentication.
 * @property {BodyInit | null} [body] - The body of the request. This can be a string, `FormData`, `Blob`, `ArrayBuffer`, etc.
 */
interface FetchOptions extends RequestInit {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; // Specify valid HTTP methods
    headers?: HeadersInit;
    authRequired?: boolean;
    body?: BodyInit | null; // Accept different types of request bodies
}



/**
 * Makes an API request using the Fetch API, with optional authentication.
 * @param {string} url - The URL to which the request is sent.
 * @param {FetchOptions} [options={}] - Options for the request, including method, headers, and body.
 * @param {AuthApi} auth - An instance of the `Auth` class to provide the authentication token.
 * @returns {Promise<Response>} - The response object from the fetch call.
 * @throws {Error} - Throws an error if the HTTP request fails.
 */
export async function fetchApi(url: string, options: FetchOptions = {}, auth: AuthApi): Promise<Response> {
    const authToken = auth.getToken();
    const defaultHeaders: HeadersInit = {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        ...(options.authRequired && authToken && { 'Authorization': `Bearer ${authToken}` }),
    };

    const fetchOptions: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response;
}
