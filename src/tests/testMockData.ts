import { EncryptionKey, UserInfo } from "../types";
import { KeyResponse } from "../types/key";

export const mockUserInfo: UserInfo = {
  id: "c2d22f94-2199-47b4-a791-ef6350d18f3b",
  firstName: "first_name",
  lastName: "last_name",
  phone: "12345678910",
  email: "test@email.com",
  role: null,
  entityIds: ["e1afb704-81d7-427e-8036-e5f23e286da5"],
  corporateId: "385ce702-3634-4160-98e0-3b40eddf1f56",
  tempPasswordUpdate: false,
};

export const mockEncKey: EncryptionKey = {
  id: "d2a4dc19-5261-4446-9a64-62f924e44a7d",
  key: "1KQIUKlpNl8NCVJVhtoDCowCmh7MLsPnWB17GsSAZOw=",
  ownerEntityId: "80e8458f-e82a-4a9d-b50a-e5c7a2db5d03",
  createdAt: "2024-09-24T13:47:29.692275882",
  updatedAt: null,
  intent: "FILE",
};

export const mockKeyResponse: KeyResponse = {
  keyResponse: mockEncKey,
  readers: [{ id: "test_id", entityType: "string" }],
  failedToInviteReaders: [],
};
