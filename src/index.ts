import { AuthApi } from './api/auth';
import { Cryptor } from './cryptor';
import { Scx } from './scx';

export { Cryptor, AuthApi, Scx };
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