import { AclUser, EncryptionKey } from "./crypto";
type Reader = {
    value: string;
    type: "EMAIL" | "PHONE" | "OTHER";
};
type KeyRequest = {
    readers?: Reader[];
    entityReaders?: string[];
    intent?: string;
};
type AclEntity = {
    id: string;
    entityType: string;
};
type KeyResponse = {
    keyResponse: EncryptionKey;
    readers: AclEntity[];
    failedToInviteReaders: string[];
};
type ReadersListing = {
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    pageNumber: number;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
    content: AclUser[];
};
export { Reader, KeyRequest, AclEntity, KeyResponse, ReadersListing };
//# sourceMappingURL=key.d.ts.map