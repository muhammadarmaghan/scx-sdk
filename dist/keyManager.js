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
exports.KeyManager = void 0;
const storage_1 = require("./utils/storage");
/**
 * Manages encryption keys and ACL (Access Control List) users.
 */
class KeyManager {
    /**
     * Initializes a new instance of the KeyManager class.
     * @param services The service instance to interact with backend APIs.
     * @param auth The authentication API instance.
     * @param encKey Optional initial encryption key.
     */
    constructor(services, auth, encKey) {
        this.aclEntities = [];
        this.auth = auth;
        this.services = services;
        this.encKey = encKey;
    }
    /**
     * Gets the currently loaded encryption key details.
     * @returns The encryption key, or undefined if not set.
     */
    getEncKey() {
        return this.encKey;
    }
    /**
     * Loads an encryption key by its ID.
     * @param id The ID of the encryption key to load.
     * @returns The loaded encryption key.
     * @throws Will throw an error if the key response is invalid.
     */
    loadKey(id, isCacheable = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const localKey = (0, storage_1.getCacheStorage)().getItem(id);
            if (localKey) {
                this.encKey = JSON.parse(localKey);
                return this.encKey;
            }
            const resp = yield this.services.getKeyById(id);
            if (!(resp === null || resp === void 0 ? void 0 : resp.id)) {
                throw new Error(`Failed to create encryption key: Invalid key response.`);
            }
            this.encKey = resp;
            if (isCacheable) {
                (0, storage_1.getCacheStorage)().setItem("LOCAL_KEY", resp.id);
                (0, storage_1.getCacheStorage)().setItem(resp.id, JSON.stringify(resp));
            }
            return resp;
        });
    }
    /**
     * Adds a new reader to the ACL list.
     * @param _newAcl The new reader to add.
     * @returns The updated ACL list.
     * @throws Will throw an error if there is a failure in adding the ACL user.
     */
    addToAcl(_newAcl) {
        try {
            const newAcl = {
                details: {
                    identity: {
                        type: _newAcl.type,
                        value: _newAcl.value,
                    },
                },
                createdAt: Date.now().toString(),
                hasStatusChanged: true,
            };
            this.aclEntities.push(newAcl);
            return this.getAcl();
        }
        catch (error) {
            console.error("Failed to add to ACL:", error);
            throw error;
        }
    }
    /**
     * Removes a user from the ACL list or marks their status as inactive.
     * @param identifier The email or ID of the user to remove or update.
     * @returns The updated ACL list.
     */
    removeFromAcl(identifier) {
        this.aclEntities = this.aclEntities.filter((user) => {
            var _a;
            const { value, id } = ((_a = user.details) === null || _a === void 0 ? void 0 : _a.identity) || {};
            if (!id && value === identifier) {
                return false;
            }
            if (id === identifier || value === identifier) {
                user.details.identity.status = "REMOVED"; // Set status to removed
            }
            return true; // Return user if it's not null
        });
        return this.getAcl();
    }
    /**
     * Gets the current list of ACL users.
     * @returns The list of ACL users.
     */
    getAcl() {
        return this.aclEntities;
    }
    /**
     * Creates a new encryption key and adds readers to the ACL.
     * @param keyRequest The request object containing reader details.
     * @returns The response containing the new encryption key and readers.
     * @throws Will throw an error if the key creation fails.
     */
    create(keyRequest, isCacheable = false) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let localKeyId = (0, storage_1.getCacheStorage)().getItem("LOCAL_KEY");
            if (isCacheable && localKeyId) {
                const keyResponse = yield this.loadKey(localKeyId);
                return {
                    keyResponse: keyResponse,
                    readers: [],
                    failedToInviteReaders: [],
                };
            }
            const resp = yield this.services.generateEncryptionKey(keyRequest);
            if (!((_a = resp.keyResponse) === null || _a === void 0 ? void 0 : _a.id)) {
                throw new Error(`Failed to create encryption key: Invalid key response.`);
            }
            this.encKey = resp.keyResponse;
            if (isCacheable) {
                (0, storage_1.getCacheStorage)().setItem("LOCAL_KEY", resp.keyResponse.id);
                (0, storage_1.getCacheStorage)().setItem(resp.keyResponse.id, JSON.stringify(resp.keyResponse));
            }
            if (!this.encKey || !this.encKey.id) {
                throw new Error("Encryption key not properly initialized.");
            }
            return resp;
        });
    }
    /**
     * Updates existing encryption key readers and ACL.
     * @param id The ID of the encryption key to update.
     * @param keyRequest The request object containing updated reader details.
     * @returns The response containing the updated encryption key and readers.
     * @throws Will throw an error if the update fails.
     */
    update(id, keyRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.services.updateKeyReaders(id, keyRequest);
                // Refresh ACL list
                yield this.loadAcl();
                // Return updated ACL
                return this.getAcl();
            }
            catch (error) {
                console.error("Failed to save changed users:", error);
                throw error;
            }
        });
    }
    /**
     * Saves changes made to ACL users and updates the backend.
     * Only users with a status change will be sent to the backend.
     * @returns The updated list of ACL users.
     * @throws Will throw an error if no users have had their status changed or if the save fails.
     */
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            const changedUsers = this.aclEntities.filter((user) => user.hasStatusChanged || user.details.identity.status !== "REMOVED") || [];
            const keyRequest = {
                readers: changedUsers.map((user) => ({
                    value: user.details.identity.value,
                    type: user.details.identity.type,
                })),
            };
            try {
                yield this.services.updateKeyReaders(this.encKey.id, keyRequest);
                // Refresh ACL list
                yield this.loadAcl();
                // Return updated ACL
                return this.getAcl();
            }
            catch (error) {
                console.error("Failed to save changed users:", error);
                throw error;
            }
        });
    }
    /**
     * Loads the ACL list from the backend based on the current encryption key.
     * @returns The response containing the list of ACL readers.
     * @throws Will throw an error if the ACL cannot be loaded.
     */
    loadAcl() {
        return __awaiter(this, void 0, void 0, function* () {
            const resp = yield this.services.getAclReadersByKey(this.encKey.id);
            this.aclEntities = resp.content;
            return resp;
        });
    }
}
exports.KeyManager = KeyManager;
