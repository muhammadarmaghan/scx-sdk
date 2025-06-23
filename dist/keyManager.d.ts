import { AclUser, EncryptionKey } from "./types";
import { Services } from "./services";
import { AuthApi } from "./api/auth";
import { KeyRequest, KeyResponse, Reader, ReadersListing } from "./types/key";
/**
 * Manages encryption keys and ACL (Access Control List) users.
 */
export declare class KeyManager {
    private encKey;
    private aclEntities;
    private auth;
    private services;
    /**
     * Initializes a new instance of the KeyManager class.
     * @param services The service instance to interact with backend APIs.
     * @param auth The authentication API instance.
     * @param encKey Optional initial encryption key.
     */
    constructor(services: Services, auth: AuthApi, encKey?: EncryptionKey);
    /**
     * Gets the currently loaded encryption key details.
     * @returns The encryption key, or undefined if not set.
     */
    getEncKey(): EncryptionKey | undefined;
    /**
     * Loads an encryption key by its ID.
     * @param id The ID of the encryption key to load.
     * @returns The loaded encryption key.
     * @throws Will throw an error if the key response is invalid.
     */
    loadKey(id: string, isCacheable?: boolean): Promise<EncryptionKey>;
    /**
     * Adds a new reader to the ACL list.
     * @param _newAcl The new reader to add.
     * @returns The updated ACL list.
     * @throws Will throw an error if there is a failure in adding the ACL user.
     */
    addToAcl(_newAcl: Reader): AclUser[];
    /**
     * Removes a user from the ACL list or marks their status as inactive.
     * @param identifier The email or ID of the user to remove or update.
     * @returns The updated ACL list.
     */
    removeFromAcl(identifier: string): AclUser[];
    /**
     * Gets the current list of ACL users.
     * @returns The list of ACL users.
     */
    getAcl(): AclUser[];
    /**
     * Creates a new encryption key and adds readers to the ACL.
     * @param keyRequest The request object containing reader details.
     * @returns The response containing the new encryption key and readers.
     * @throws Will throw an error if the key creation fails.
     */
    create(keyRequest: KeyRequest, isCacheable?: boolean): Promise<KeyResponse>;
    /**
     * Updates existing encryption key readers and ACL.
     * @param id The ID of the encryption key to update.
     * @param keyRequest The request object containing updated reader details.
     * @returns The response containing the updated encryption key and readers.
     * @throws Will throw an error if the update fails.
     */
    update(id: string, keyRequest: KeyRequest): Promise<AclUser[]>;
    /**
     * Saves changes made to ACL users and updates the backend.
     * Only users with a status change will be sent to the backend.
     * @returns The updated list of ACL users.
     * @throws Will throw an error if no users have had their status changed or if the save fails.
     */
    save(): Promise<AclUser[]>;
    /**
     * Loads the ACL list from the backend based on the current encryption key.
     * @returns The response containing the list of ACL readers.
     * @throws Will throw an error if the ACL cannot be loaded.
     */
    loadAcl(): Promise<ReadersListing>;
}
//# sourceMappingURL=keyManager.d.ts.map