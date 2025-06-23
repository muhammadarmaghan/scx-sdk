import { AuthApi } from "../api/auth";
import { Services } from "../services";
import { Cryptor } from "../cryptor";
import { KeyManager } from "../keyManager";
import { KeyRequest } from "../types/key";
import { mockEncKey, mockKeyResponse, mockUserInfo } from "./testMockData";
import { AclUser } from "../types";

jest.mock("../keyManager", () => {
  return {
    KeyManager: jest.fn(),
  };
});

describe("Cryptor Class", () => {
  let cryptor: Cryptor;
  let mockAuthApi: AuthApi;
  let mockServices: Services;

  beforeEach(() => {
    // Mock the AuthApi and Services classes
    mockAuthApi = {
      isLoggedIn: jest.fn(),
    } as unknown as AuthApi;

    mockServices = {
      getUserInfo: jest.fn(),
      addReaders: jest.fn(),
    } as unknown as Services;

    cryptor = new Cryptor(mockAuthApi, mockServices);
  });

  it("should initialize Crypto with auth and services", () => {
    expect(cryptor).toBeDefined();
    expect(cryptor).toHaveProperty("auth");
    expect(cryptor).toHaveProperty("services");
  });

  it("should throw an error if the user is not logged in", async () => {
    (mockAuthApi.isLoggedIn as jest.Mock).mockResolvedValue(false);

    await expect(cryptor.generateEncryptionKey()).rejects.toThrow(
      "Token expired !"
    );
  });

  describe("Cryptor - Generate Encryption Key", () => {
    it("should generate an encryption key when user is logged in", async () => {
      (mockAuthApi.isLoggedIn as jest.Mock).mockResolvedValue(true);
      (mockServices.getUserInfo as jest.Mock).mockResolvedValue(mockUserInfo);
      (mockServices.addReaders as jest.Mock).mockResolvedValue(mockKeyResponse);

      const key = await cryptor.generateEncryptionKey(["receiver1@email.com"]);

      expect(mockServices.getUserInfo).toHaveBeenCalled();
      expect(mockServices.addReaders).toHaveBeenCalledWith(mockUserInfo.id, [
        "receiver1@email.com",
      ]);
      expect(key).toBe(mockEncKey);
    });

    it("should handle errors in key generation", async () => {
      // Mock console.error to suppress log output during the test
      const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => { });

      // Mocking the `isLoggedIn` method to resolve to `true`
      (mockAuthApi.isLoggedIn as jest.Mock).mockResolvedValue(true);

      // Mocking `getUserInfo` to throw an error
      (mockServices.getUserInfo as jest.Mock).mockRejectedValue(new Error("User info error"));

      // Execute the function and assert the error is thrown
      await expect(cryptor.generateEncryptionKey()).rejects.toThrow("Failed to generate encryption key");

      // Restore console.error after the test
      consoleErrorMock.mockRestore();
    });

  });

  describe("Cryptor - normalizeNonce", () => {
    let cryptor: Cryptor;

    beforeEach(() => {
      cryptor = new Cryptor(mockAuthApi, mockServices);
    });

    it("should return a 12-byte Uint8Array for objectIds longer than 12 characters or exactly 12 characters", async () => {
      // Case 1: Longer than 12 characters
      const longObjectId = "12345678901234567890";
      const longNonce = await cryptor.normalizeNonce(longObjectId);
      expect(longNonce).toBeInstanceOf(Uint8Array);
      expect(longNonce.length).toBe(12); // Should be truncated
      expect(longNonce).toEqual(new TextEncoder().encode("123456789012"));

      // Case 2: Exactly 12 characters
      const exactObjectId = "123456789012";
      const exactNonce = await cryptor.normalizeNonce(exactObjectId);
      expect(exactNonce).toBeInstanceOf(Uint8Array);
      expect(exactNonce.length).toBe(12);
      expect(exactNonce).toEqual(new TextEncoder().encode(exactObjectId));
    });

    it("should return a Uint8Array matching the length of objectIds shorter than 12 characters or empty Uint8Array for empty objectId", async () => {
      // Case 1: Shorter than 12 characters
      const shortObjectId = "12345";
      const shortNonce = await cryptor.normalizeNonce(shortObjectId);
      expect(shortNonce).toBeInstanceOf(Uint8Array);
      expect(shortNonce.length).toBe(5);
      expect(shortNonce).toEqual(new TextEncoder().encode(shortObjectId));

      // Case 2: Empty objectId
      const emptyObjectId = "";
      const emptyNonce = await cryptor.normalizeNonce(emptyObjectId);
      expect(emptyNonce).toBeInstanceOf(Uint8Array);
      expect(emptyNonce.length).toBe(0);
      expect(emptyNonce).toEqual(new Uint8Array(0));
    });
  });

  describe("Cryptor - encrypt", () => {
    let cryptor: Cryptor;

    let createMock: jest.Mock;
    let getEncKeyMock: jest.Mock;

    beforeEach(() => {
      createMock = jest.fn().mockResolvedValue(mockKeyResponse);
      getEncKeyMock = jest.fn().mockReturnValue(mockEncKey);

      (KeyManager as jest.Mock).mockImplementation(() => ({
        create: createMock,
        getEncKey: getEncKeyMock,
      }));

      mockAuthApi = {
        isLoggedIn: jest.fn(),
      } as unknown as AuthApi;

      mockServices = {
        getUserInfo: jest.fn(),
        addReaders: jest.fn(),
        generateEncryptionKey: jest
          .fn()
          .mockResolvedValue({ keyResponse: mockEncKey }), // Mock generateEncryptionKey
      } as unknown as Services;

      cryptor = new Cryptor(mockAuthApi, mockServices);

      jest
        .spyOn(cryptor, "normalizeNonce")
        .mockResolvedValue(new Uint8Array(12));
    });

    it("should encrypt data and return an encoded string", async () => {
      const data = new Uint8Array([1, 2, 3, 4]);
      const requestData = {
        readers: [
          {
            value: "test1@gmail.com",
            type: "EMAIL",
          },
        ],
      } as KeyRequest;

      const result = await cryptor.encrypt(data, requestData);

      expect(createMock).toHaveBeenCalledWith(requestData);
      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("keyManager");
      expect(result.data).toContain("SCXD01");
    });
  });

  describe("Cryptor - decrypt", () => {
    let loadKeyMock: jest.Mock;
    let getEncKeyMock: jest.Mock;

    beforeEach(() => {
      mockAuthApi = {
        isLoggedIn: jest.fn().mockResolvedValue(true),
      } as unknown as AuthApi;

      loadKeyMock = jest
        .fn()
        .mockResolvedValue("29448a9d-15b3-49c7-9c3c-e3354c2b7732");
      getEncKeyMock = jest.fn().mockReturnValue(mockEncKey);

      (KeyManager as jest.Mock).mockImplementation(() => ({
        loadKey: loadKeyMock,
        getEncKey: getEncKeyMock,
      }));

      cryptor = new Cryptor(mockAuthApi, mockServices);
    });

    it("should decrypt data and return the correct Uint8Array", async () => {
      const encryptedData =
        "SCXD01:B:d2a4dc19-5261-4446-9a64-62f924e44a7d:xH3lTBR94XPKhPcuHWirNw";
      const encryptedUint8Array = new TextEncoder().encode(encryptedData);

      const result = await cryptor.decrypt(encryptedUint8Array);

      expect(result).toHaveProperty("data");
      expect(result).toHaveProperty("keyManager");
      expect(result.data).toBeInstanceOf(Uint8Array);
    });
  });

  describe("Cryptor - load", () => {
    let mockKeyManager: KeyManager;

    beforeEach(() => {
      mockAuthApi = {
        isLoggedIn: jest.fn(),
      } as unknown as AuthApi;

      cryptor = new Cryptor(mockAuthApi, mockServices);

      // Mock KeyManager instance and its methods
      mockKeyManager = {
        loadKey: jest.fn(),
        loadAcl: jest.fn(),
      } as unknown as KeyManager;

      (KeyManager as jest.Mock).mockImplementation(() => mockKeyManager);
    });

    it("should throw an error if the user is not logged in", async () => {
      // Mock the isLoggedIn method to return false (user not logged in)
      (mockAuthApi.isLoggedIn as jest.Mock).mockResolvedValue(false);

      const encryptedData = new TextEncoder().encode(
        "SCXD01:B:objectId123:encryptedText"
      );

      await expect(cryptor.load(encryptedData)).rejects.toThrow(
        "Token expired !"
      );
    });

    it("should successfully load key and ACL when the user is logged in", async () => {
      // Mock the isLoggedIn method to return true (user is logged in)
      (mockAuthApi.isLoggedIn as jest.Mock).mockResolvedValue(true);

      const encryptedData = new TextEncoder().encode(
        "SCXD01:B:objectId123:encryptedText"
      );

      const result = await cryptor.load(encryptedData);

      // Ensure the keyManager methods were called
      expect(mockKeyManager.loadKey).toHaveBeenCalledWith("objectId123");
      expect(mockKeyManager.loadAcl).toHaveBeenCalled();
      expect(result).toBe(mockKeyManager); // Ensure the returned keyManager is the mock instance
    });

    it("should correctly decode and extract objectId from encryptedData", async () => {
      // Mock the isLoggedIn method to return true (user is logged in)
      (mockAuthApi.isLoggedIn as jest.Mock).mockResolvedValue(true);

      const encryptedData = new TextEncoder().encode(
        "SCXD01:B:objectIdToExtract:encryptedText"
      );

      await cryptor.load(encryptedData);

      // Ensure loadKey was called with the correct objectId
      expect(mockKeyManager.loadKey).toHaveBeenCalledWith("objectIdToExtract");
    });
  });

  describe("Cryptor - searchEntities", () => {
    let cryptor: Cryptor;
    let mockAuthApi: AuthApi;
    let mockServices: Services;

    beforeEach(() => {
      // Mock AuthApi and Services
      mockAuthApi = {
        isLoggedIn: jest.fn(),
      } as unknown as AuthApi;

      mockServices = {
        searchEntitiesByKeywords: jest.fn(),
      } as unknown as Services;

      cryptor = new Cryptor(mockAuthApi, mockServices);
    });

    it("should return a list of entities when the search is successful", async () => {
      // Mock isLoggedIn to return true (user is logged in)
      (mockAuthApi.isLoggedIn as jest.Mock).mockResolvedValue(true);

      const keywords = "test keywords";
      const mockEntities = [
        { entityId: "user123" },
        { entityId: "user456" },
      ] as AclUser[];

      // Mock searchEntitiesByKeywords to return a list of entities
      (mockServices.searchEntitiesByKeywords as jest.Mock).mockResolvedValue(
        mockEntities
      );

      const result = await cryptor.searchEntities(keywords);

      expect(result).toEqual(mockEntities);
      expect(mockServices.searchEntitiesByKeywords).toHaveBeenCalledWith(
        keywords
      );
    });

    it("should throw a custom error if the search fails", async () => {
      // Mock console.error to suppress log output during the test
      const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => { });

      // Mock isLoggedIn to return true (user is logged in)
      (mockAuthApi.isLoggedIn as jest.Mock).mockResolvedValue(true);

      const keywords = "test keywords";

      // Mock searchEntitiesByKeywords to throw an error
      (mockServices.searchEntitiesByKeywords as jest.Mock).mockRejectedValue(
        new Error("Service error")
      );

      // Execute the function and assert the error is thrown
      await expect(cryptor.searchEntities(keywords)).rejects.toThrow(
        "Failed to search entities by keywords"
      );

      // Restore console.error after the test
      consoleErrorMock.mockRestore();
    });

  });
});
