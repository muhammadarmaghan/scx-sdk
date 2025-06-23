import {Cryptor} from "./cryptor";
import {AuthApi} from "./api/auth";
import { Services } from "./services";
import {createStorage, StorageAdapter} from "./utils/storage";

export class Scx {
    auth: AuthApi;
    crypto: Cryptor;
    services: Services;
    scxStorage: StorageAdapter;
    static API_BASE = process.env.REACT_APP_API_BASE;

    constructor() {
        this.scxStorage = createStorage();
        this.auth = new AuthApi(this.scxStorage);
        this.services = new Services(this.auth);
        this.crypto = new Cryptor(this.auth, this.services);
    }
}