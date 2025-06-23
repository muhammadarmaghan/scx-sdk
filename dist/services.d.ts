import { AuthApi } from "./api/auth";
import { AclUser, DecryptionKey, EncryptionKey, UserInfo } from "./types";
import { KeyRequest, KeyResponse, ReadersListing } from "./types/key";
export declare class Services {
    private auth;
    constructor(auth: AuthApi);
    getUserInfo(): Promise<UserInfo>;
    getKeyInfo(keyId: string): Promise<EncryptionKey>;
    getReaders(keyId: string): Promise<any>;
    addReaders(userId: string, receivers: string[]): Promise<DecryptionKey>;
    updateReaders(keyId: string, receiver: string): Promise<DecryptionKey>;
    deleteReader(keyId: string, receivers: string[]): Promise<boolean>;
    deleteReaders(keyId: string): Promise<any>;
    generateEncryptionKey(reqData: KeyRequest): Promise<KeyResponse>;
    updateKeyReaders(id: string, reqData: KeyRequest): Promise<KeyResponse>;
    getKeyById(id: string): Promise<EncryptionKey>;
    getAclUsersDetails(ids: string[]): Promise<AclUser[]>;
    getAclReadersByKey(id: string): Promise<ReadersListing>;
}
//# sourceMappingURL=services.d.ts.map