/**
 * checks if the current environment is a browser or a server side one
 */
export default function isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}