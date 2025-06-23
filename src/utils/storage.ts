import isBrowser from './isBrowser';

interface StorageAdapter {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

/**
 * This class creates a storage adapter for browser using `localStorage`
 */
class BrowserStorage implements StorageAdapter {
    // since this is object based, if we use `localStorage` as is,
    // multiple objects will be sharing same data. Let's avoid that by using random string as prefix
    prefix: string;
    constructor() {
        // this.prefix = `SCX_${Math.random().toString(36).substring(2, 9)}_`;
        this.prefix = `_`; // reload on app causing issues of fail identification of token in localStorage
    }
    getItem(key: string): string | null {
        return localStorage.getItem(this.prefix + key);
    }

    setItem(key: string, value: string): void {
        localStorage.setItem(this.prefix + key, value);
    }

    removeItem(key: string): void {
        localStorage.removeItem(this.prefix + key);
    }
}

class NodeStorage implements StorageAdapter {
    private storage: Record<string, string> = {};

    getItem(key: string): string | null {
        return this.storage[key] || null;
    }

    setItem(key: string, value: string): void {
        this.storage[key] = value;
    }

    removeItem(key: string): void {
        delete this.storage[key];
    }
}

/**
 * Creates a storage adapter for browser or node.js.
 * If called from a browser, it'll use `localStorage`, otherwise for node.js, it'll use an in-memory object.
 * @returns { StorageAdapter }
 */
function createStorage(): StorageAdapter {
    if (isBrowser()) {
        return new BrowserStorage();
    } else {
        return new NodeStorage();
    }
}

let cacheStorage:StorageAdapter;
function getCacheStorage(): StorageAdapter {
    if (!cacheStorage) {
        cacheStorage = new NodeStorage();
    }
    return cacheStorage;
}

export { StorageAdapter, BrowserStorage, NodeStorage, createStorage, getCacheStorage };