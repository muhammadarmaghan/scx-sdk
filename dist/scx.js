"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scx = void 0;
const cryptor_1 = require("./cryptor");
const auth_1 = require("./api/auth");
const services_1 = require("./services");
const storage_1 = require("./utils/storage");
class Scx {
    constructor() {
        this.scxStorage = (0, storage_1.createStorage)();
        this.auth = new auth_1.AuthApi(this.scxStorage);
        this.services = new services_1.Services(this.auth);
        this.crypto = new cryptor_1.Cryptor(this.auth, this.services);
    }
}
exports.Scx = Scx;
Scx.API_BASE = process.env.REACT_APP_API_BASE;
