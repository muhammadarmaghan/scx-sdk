declare class BaseSxFile {
  /**
   * file name
   */
  name?: string;
  /**
   * MIME type
   */
  type?: string;
  /**
   *
   */
  data: string | Uint8Array;
}

declare type SxFile = File | BaseSxFile;

type ToEncrypt = {
  from: string;
  to: string[];
  cc: string[];
  subject: string;
  date: Date;
  body: string;
  attachments: (string | BaseSxFile)[];
};

type EncryptionKey = {
  id: string;
  key: string;
  ownerEntityId: string;
  createdAt: string;
  updatedAt?: string | null;
  keyOrigin?: string;
  intent: string;
};

type DecryptionKey = {
  failedToInviteReaders: string[];
  readers: string[];
  keyResponse: EncryptionKey;
};

interface AclUser {
  entityId?: string;
  entityType?: string;
  corporateId?: string;
  details: {
    identity: {
      id?: string;
      type: "EMAIL" | "PHONE" | "OTHER";
      value: string;
      status?: string | "REMOVED";
      userId?: string;
    };
    user?: {
      id?: string;
      keycloakId?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      username?: string;
      email?: string;
      status?: string;
    };
    role?: {
      id?: string;
      name?: string;
    };
    permission?: {
      id?: string;
      name?: string;
    };
  };
  createdAt?: string;
  hasStatusChanged?: boolean;
}

export { BaseSxFile, SxFile, EncryptionKey, DecryptionKey, ToEncrypt, AclUser };
