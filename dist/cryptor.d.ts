import { AuthApi } from "./api/auth";
import { Services } from "./services";
import { EncryptionKey } from "./types";
import { KeyManager } from "./keyManager";
import { KeyRequest } from "./types/key";
export declare class Cryptor {
    private auth;
    private services;
    constructor(auth: AuthApi, services: Services);
    generateEncryptionKey(receivers?: string[]): Promise<EncryptionKey>;
    /**
     * This function ensures the nonce is 12 bytes long (23 bytes is AES-GCM standard practice)
     * this function hashes and truncates the objectId to make it 12 bytes if the objectId length is different
     * @param objectId
     */
    normalizeNonce(objectId: string): Promise<Uint8Array>;
    /**
     * Encrypts data using AES-GCM
     * @param {Uint8Array} data
     * @param {KeyRequest} requestData
     * @param isB64
     * @param isCacheable
     */
    encrypt(data: Uint8Array, requestData: KeyRequest, isB64?: boolean, isCacheable?: boolean): Promise<{
        data: string;
        keyManager: KeyManager;
    }>;
    /**
     * Decrypts data using AES-GCM
     * @param {Uint8Array} encryptedData
     * @param {KeyRequest} requestData
     */
    decrypt(encryptedData: Uint8Array, requestData?: KeyRequest, isCacheable?: boolean): Promise<{
        data: Uint8Array;
        keyManager: KeyManager;
    }>;
    load(encryptedData: Uint8Array): Promise<KeyManager>;
}
//# sourceMappingURL=cryptor.d.ts.map