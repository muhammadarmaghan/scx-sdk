import { AclUser, EncryptionKey } from "./types";
import { Services } from "./services";
import { AuthApi } from "./api/auth";
import { KeyRequest, KeyResponse, Reader, ReadersListing } from "./types/key";
import { getCacheStorage } from "./utils/storage";

/**
 * Manages encryption keys and ACL (Access Control List) users.
 */
export class KeyManager {
  private encKey: EncryptionKey | undefined;
  private aclEntities: AclUser[] = [];
  private auth: AuthApi;
  private services: Services;

  /**
   * Initializes a new instance of the KeyManager class.
   * @param services The service instance to interact with backend APIs.
   * @param auth The authentication API instance.
   * @param encKey Optional initial encryption key.
   */
  constructor(services: Services, auth: AuthApi, encKey?: EncryptionKey) {
    this.auth = auth;
    this.services = services;
    this.encKey = encKey;
  }

  /**
   * Gets the currently loaded encryption key details.
   * @returns The encryption key, or undefined if not set.
   */
  public getEncKey(): EncryptionKey | undefined {
    return this.encKey;
  }

  /**
   * Loads an encryption key by its ID.
   * @param id The ID of the encryption key to load.
   * @returns The loaded encryption key.
   * @throws Will throw an error if the key response is invalid.
   */
  public async loadKey(
    id: string,
    isCacheable: boolean = false
  ): Promise<EncryptionKey> {
    const localKey = getCacheStorage().getItem(id);
    if (localKey) {
      this.encKey = JSON.parse(localKey);
      return this.encKey as EncryptionKey;
    }
    const resp: EncryptionKey = await this.services.getKeyById(id);
    if (!resp?.id) {
      throw new Error(`Failed to create encryption key: Invalid key response.`);
    }
    this.encKey = resp;
    if (isCacheable) {
      getCacheStorage().setItem("LOCAL_KEY", resp.id);
      getCacheStorage().setItem(resp.id, JSON.stringify(resp));
    }
    return resp;
  }

  /**
   * Adds a new reader to the ACL list.
   * @param _newAcl The new reader to add.
   * @returns The updated ACL list.
   * @throws Will throw an error if there is a failure in adding the ACL user.
   */
  public addToAcl(_newAcl: Reader): AclUser[] {
    try {
      const newAcl: AclUser = {
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
    } catch (error) {
      console.error("Failed to add to ACL:", error);
      throw error;
    }
  }

  /**
   * Removes a user from the ACL list or marks their status as inactive.
   * @param identifier The email or ID of the user to remove or update.
   * @returns The updated ACL list.
   */
  public removeFromAcl(identifier: string): AclUser[] {
    this.aclEntities = this.aclEntities.filter((user) => {
      const { value, id } = user.details?.identity || {};

      if (!id && value === identifier) {
        return false;
      }

      if (id === identifier || value === identifier) {
        user.details!.identity!.status = "REMOVED"; // Set status to removed
      }

      return true; // Return user if it's not null
    });

    return this.getAcl();
  }

  /**
   * Gets the current list of ACL users.
   * @returns The list of ACL users.
   */
  public getAcl(): AclUser[] {
    return this.aclEntities;
  }

  /**
   * Creates a new encryption key and adds readers to the ACL.
   * @param keyRequest The request object containing reader details.
   * @returns The response containing the new encryption key and readers.
   * @throws Will throw an error if the key creation fails.
   */
  public async create(
    keyRequest: KeyRequest,
    isCacheable: boolean = false
  ): Promise<KeyResponse> {
    let localKeyId = getCacheStorage().getItem("LOCAL_KEY");
    if (isCacheable && localKeyId) {
      const keyResponse = await this.loadKey(localKeyId);
      return {
        keyResponse: keyResponse,
        readers: [],
        failedToInviteReaders: [],
      };
    }
    const resp: KeyResponse = await this.services.generateEncryptionKey(
      keyRequest
    );

    if (!resp.keyResponse?.id) {
      throw new Error(`Failed to create encryption key: Invalid key response.`);
    }

    this.encKey = resp.keyResponse;
    if (isCacheable) {
      getCacheStorage().setItem("LOCAL_KEY", resp.keyResponse.id);
      getCacheStorage().setItem(
        resp.keyResponse.id,
        JSON.stringify(resp.keyResponse)
      );
    }
    if (!this.encKey || !this.encKey.id) {
      throw new Error("Encryption key not properly initialized.");
    }

    return resp;
  }

  /**
   * Updates existing encryption key readers and ACL.
   * @param id The ID of the encryption key to update.
   * @param keyRequest The request object containing updated reader details.
   * @returns The response containing the updated encryption key and readers.
   * @throws Will throw an error if the update fails.
   */
  public async update(id: string, keyRequest: KeyRequest): Promise<AclUser[]> {
    try {
      await this.services.updateKeyReaders(id, keyRequest);

      // Refresh ACL list
      await this.loadAcl();

      // Return updated ACL
      return this.getAcl();
    } catch (error) {
      console.error("Failed to save changed users:", error);
      throw error;
    }
  }

  /**
   * Saves changes made to ACL users and updates the backend.
   * Only users with a status change will be sent to the backend.
   * @returns The updated list of ACL users.
   * @throws Will throw an error if no users have had their status changed or if the save fails.
   */
  public async save(): Promise<AclUser[]> {
    const changedUsers =
      this.aclEntities.filter(
        (user) =>
          user.hasStatusChanged || user.details.identity.status !== "REMOVED"
      ) || [];

    const keyRequest: KeyRequest = {
      readers: changedUsers.map((user) => ({
        value: user.details!.identity!.value!,
        type: user.details!.identity!.type!,
      })),
    };

    try {
      await this.services.updateKeyReaders(this.encKey!.id, keyRequest);

      // Refresh ACL list
      await this.loadAcl();

      // Return updated ACL
      return this.getAcl();
    } catch (error) {
      console.error("Failed to save changed users:", error);
      throw error;
    }
  }

  /**
   * Loads the ACL list from the backend based on the current encryption key.
   * @returns The response containing the list of ACL readers.
   * @throws Will throw an error if the ACL cannot be loaded.
   */
  async loadAcl(): Promise<ReadersListing> {
    const resp: ReadersListing = await this.services.getAclReadersByKey(
      this.encKey!.id
    );
    this.aclEntities = resp.content;
    return resp;
  }
}
