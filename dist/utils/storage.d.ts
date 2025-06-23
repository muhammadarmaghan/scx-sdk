interface StorageAdapter {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}
/**
 * This class creates a storage adapter for browser using `localStorage`
 */
declare class BrowserStorage implements StorageAdapter {
    prefix: string;
    constructor();
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}
declare class NodeStorage implements StorageAdapter {
    private storage;
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}
/**
 * Creates a storage adapter for browser or node.js.
 * If called from a browser, it'll use `localStorage`, otherwise for node.js, it'll use an in-memory object.
 * @returns { StorageAdapter }
 */
declare function createStorage(): StorageAdapter;
declare function getCacheStorage(): StorageAdapter;
export { StorageAdapter, BrowserStorage, NodeStorage, createStorage, getCacheStorage };
//# sourceMappingURL=storage.d.ts.map