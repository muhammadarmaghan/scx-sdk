import { AuthApi } from "./api/auth";
import { Services } from "./services";
import { AclUser, DecryptionKey, EncryptionKey, UserInfo } from "./types";
import { Base64 } from "js-base64";
import { gcm } from "@noble/ciphers/aes";
import { KeyManager } from "./keyManager";
import { KeyRequest } from "./types/key";

export class Cryptor {
  private auth: AuthApi;
  private services: Services;

  constructor(auth: AuthApi, services: Services) {
    this.auth = auth;
    this.services = services;
  }

  async generateEncryptionKey(
    receivers: string[] = []
  ): Promise<EncryptionKey> {
    if (!(await this.auth.isLoggedIn())) throw new Error("Token expired !");
    try {
      const meInfo: UserInfo = await this.services.getUserInfo();
      const keyInfo: DecryptionKey = await this.services.addReaders(
        meInfo?.id,
        receivers
      );
      return keyInfo?.keyResponse;
    } catch (error) {
      console.error("Error generating encryption key:", error);
      throw new Error("Failed to generate encryption key");
    }
  }

  /**
   * This function ensures the nonce is 12 bytes long (23 bytes is AES-GCM standard practice)
   * this function hashes and truncates the objectId to make it 12 bytes if the objectId length is different
   * @param objectId
   */

  async normalizeNonce(objectId: string): Promise<Uint8Array> {
    const nonceSize = 12;
    let nonce = new TextEncoder().encode(objectId);
    nonce = nonce.slice(0, nonceSize);
    return nonce;
  }

  /**
   * Encrypts data using AES-GCM
   * @param {Uint8Array} data
   * @param {KeyRequest} requestData
   * @param isB64
   * @param isCacheable
   */
  async encrypt(
    data: Uint8Array,
    requestData: KeyRequest,
    isB64: boolean = true,
    isCacheable: boolean = false
  ): Promise<{
    data: string;
    keyManager: KeyManager;
  }> {
    const keyManager = new KeyManager(this.services, this.auth);
    await keyManager.create(requestData, isCacheable);
    const encKey = keyManager.getEncKey();
    const nonce = await this.normalizeNonce(encKey!.id);
    let inputData: Uint8Array;
    if (data instanceof ArrayBuffer) {
      inputData = new Uint8Array(data);
    } else {
      inputData = data;
    }

    const encryptedData = gcm(Base64.toUint8Array(encKey!.key), nonce).encrypt(
      inputData
    );

    return {
      data: `SCXD01:${isB64 ? "B" : ""}:${encKey?.id}:${Base64.fromUint8Array(
        encryptedData,
        true
      )}`,
      keyManager,
    };
  }

  /**
   * Decrypts data using AES-GCM
   * @param {Uint8Array} encryptedData
   * @param {KeyRequest} requestData
   */
  async decrypt(
    encryptedData: Uint8Array,
    requestData?: KeyRequest,
    isCacheable: boolean = false
  ): Promise<{
    data: Uint8Array;
    keyManager: KeyManager;
  }> {
    if (!(await this.auth.isLoggedIn())) throw new Error("Token expired !");
    const rawContent = new TextDecoder().decode(encryptedData);
    const [encVer, encodingType, objectId, encryptedText] =
      rawContent.split(":");
    let encryptedBytes;
    const keyManager = new KeyManager(this.services, this.auth);

    if (requestData) {
      await keyManager.update(objectId, requestData);
    } else {
      await keyManager.loadKey(objectId, isCacheable);
    }

    const encKey = keyManager.getEncKey();
    if (encodingType?.toLowerCase() === "b") {
      encryptedBytes = Base64.toUint8Array(encryptedText);
    } else {
      encryptedBytes = new Uint8Array(
        encryptedData.slice((encVer + encodingType + objectId).length + 3)
      );
    }
    const nonce = await this.normalizeNonce(encKey!.id);
    const stream = gcm(Base64.toUint8Array(encKey!.key), nonce).decrypt(
      encryptedBytes
    );
    return {
      data: stream,
      keyManager,
    };
  }

  async load(encryptedData: Uint8Array): Promise<KeyManager> {
    if (!(await this.auth.isLoggedIn())) throw new Error("Token expired !");
    const rawContent = new TextDecoder().decode(encryptedData);
    const [, , objectId] = rawContent.split(":");
    const keyManager = new KeyManager(this.services, this.auth);
    await keyManager.loadKey(objectId);
    await keyManager.loadAcl();
    return keyManager;
  }

  async searchEntities(keywords: string): Promise<AclUser[]> {
    if (!(await this.auth.isLoggedIn())) {
      throw new Error("Token expired!");
    }

    try {
      return await this.services.searchEntitiesByKeywords(keywords);
    } catch (error) {
      console.error("Error searching entities:", error);
      throw new Error("Failed to search entities by keywords");
    }
  }
}
