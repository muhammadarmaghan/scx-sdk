import { Cryptor } from "./cryptor";
import { AuthApi } from "./api/auth";
import { Services } from "./services";
import { StorageAdapter } from "./utils/storage";
export declare class Scx {
    auth: AuthApi;
    crypto: Cryptor;
    services: Services;
    scxStorage: StorageAdapter;
    static API_BASE: string;
    constructor();
}
//# sourceMappingURL=scx.d.ts.map