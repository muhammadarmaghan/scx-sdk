"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scx = exports.AuthApi = exports.Cryptor = void 0;
const auth_1 = require("./api/auth");
Object.defineProperty(exports, "AuthApi", { enumerable: true, get: function () { return auth_1.AuthApi; } });
const cryptor_1 = require("./cryptor");
Object.defineProperty(exports, "Cryptor", { enumerable: true, get: function () { return cryptor_1.Cryptor; } });
const scx_1 = require("./scx");
Object.defineProperty(exports, "Scx", { enumerable: true, get: function () { return scx_1.Scx; } });
/**
 usage:

import scx from 'ScipherX';
 scx.crypto.encrypt('something');
     // if loggedin:
     returns encrypted object to be sent
     // if logged out / not loggedin
     throws error
 scx.crypto.decrypt('something else');
     // if loggedin:
     returns decrypted object to be sent
     // if logged out / not loggedin
     throws error

 scx.auth.login();
 scx.auth.logout();
 scx.auth.sessionClear();

 scx.identity.create();
 scx.identity.get();
 scx.identity.list();
 scx.identity.setToPending();
 scx.identity.setToActive();

 scx.user.activate(): boolean;
 scx.user.getProfile(): usrObj;
 scx.user.updateProfile(usrObj);
 scx.user.register(usrObj);
 scx.user.verify(PHONE|EMAIL, uid, code);
 */ 
