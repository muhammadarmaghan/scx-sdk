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
exports.Cryptor = void 0;
const js_base64_1 = require("js-base64");
const aes_1 = require("@noble/ciphers/aes");
const keyManager_1 = require("./keyManager");
class Cryptor {
    constructor(auth, services) {
        this.auth = auth;
        this.services = services;
    }
    generateEncryptionKey(receivers = []) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.auth.isLoggedIn()))
                throw new Error("Token expired !");
            try {
                const meInfo = yield this.services.getUserInfo();
                const keyInfo = yield this.services.addReaders(meInfo === null || meInfo === void 0 ? void 0 : meInfo.id, receivers);
                return keyInfo === null || keyInfo === void 0 ? void 0 : keyInfo.keyResponse;
            }
            catch (error) {
                console.error("Error generating encryption key:", error);
                throw new Error("Failed to generate encryption key");
            }
        });
    }
    /**
     * This function ensures the nonce is 12 bytes long (23 bytes is AES-GCM standard practice)
     * this function hashes and truncates the objectId to make it 12 bytes if the objectId length is different
     * @param objectId
     */
    normalizeNonce(objectId) {
        return __awaiter(this, void 0, void 0, function* () {
            const nonceSize = 12;
            let nonce = new TextEncoder().encode(objectId);
            nonce = nonce.slice(0, 12);
            return nonce;
        });
    }
    /**
     * Encrypts data using AES-GCM
     * @param {Uint8Array} data
     * @param {KeyRequest} requestData
     * @param isB64
     * @param isCacheable
     */
    encrypt(data, requestData, isB64 = true, isCacheable = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const keyManager = new keyManager_1.KeyManager(this.services, this.auth);
            yield keyManager.create(requestData, isCacheable);
            const encKey = keyManager.getEncKey();
            const nonce = yield this.normalizeNonce(encKey.id);
            let inputData;
            if (data instanceof ArrayBuffer) {
                inputData = new Uint8Array(data);
            }
            else {
                inputData = data;
            }
            const encryptedData = (0, aes_1.gcm)(js_base64_1.Base64.toUint8Array(encKey.key), nonce).encrypt(inputData);
            return {
                data: `SCXD01:${isB64 ? "B" : ""}:${encKey === null || encKey === void 0 ? void 0 : encKey.id}:${js_base64_1.Base64.fromUint8Array(encryptedData, true)}`,
                keyManager,
            };
        });
    }
    /**
     * Decrypts data using AES-GCM
     * @param {Uint8Array} encryptedData
     * @param {KeyRequest} requestData
     */
    decrypt(encryptedData, requestData, isCacheable = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.auth.isLoggedIn()))
                throw new Error("Token expired !");
            const rawContent = new TextDecoder().decode(encryptedData);
            const [encVer, encodingType, objectId, encryptedText] = rawContent.split(":");
            let encryptedBytes;
            const keyManager = new keyManager_1.KeyManager(this.services, this.auth);
            if (requestData) {
                yield keyManager.update(objectId, requestData);
            }
            else {
                yield keyManager.loadKey(objectId, isCacheable);
            }
            const encKey = keyManager.getEncKey();
            if ((encodingType === null || encodingType === void 0 ? void 0 : encodingType.toLowerCase()) === "b") {
                encryptedBytes = js_base64_1.Base64.toUint8Array(encryptedText);
            }
            else {
                encryptedBytes = new Uint8Array(encryptedData.slice((encVer + encodingType + objectId).length + 3));
            }
            const nonce = yield this.normalizeNonce(encKey.id);
            const stream = (0, aes_1.gcm)(js_base64_1.Base64.toUint8Array(encKey.key), nonce).decrypt(encryptedBytes);
            return {
                data: stream,
                keyManager,
            };
        });
    }
    load(encryptedData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.auth.isLoggedIn()))
                throw new Error("Token expired !");
            const rawContent = new TextDecoder().decode(encryptedData);
            const [, , objectId] = rawContent.split(":");
            const keyManager = new keyManager_1.KeyManager(this.services, this.auth);
            yield keyManager.loadKey(objectId);
            yield keyManager.loadAcl();
            return keyManager;
        });
    }
}
exports.Cryptor = Cryptor;
