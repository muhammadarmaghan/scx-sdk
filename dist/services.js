"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Services = void 0;
const scx_1 = require("./scx");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const fetchApi_1 = require("./utils/fetchApi");
class Services {
    constructor(auth) {
        this.auth = auth;
    }
    getUserInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.auth.isLoggedIn()))
                throw new Error("Token expired!");
            try {
                const response = yield (0, cross_fetch_1.default)(`${scx_1.Scx.API_BASE}/auth/user-account-management/users/me`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${this.auth.getToken()}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch user information`);
                }
                return yield response.json();
            }
            catch (err) {
                throw new Error("Failed to fetch user information");
            }
        });
    }
    getKeyInfo(keyId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.auth.isLoggedIn()))
                throw new Error("Token expired!");
            try {
                const response = yield (0, cross_fetch_1.default)(`${scx_1.Scx.API_BASE}/keys/read/${keyId}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${this.auth.getToken()}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`Failed to read encryption key ${response.status}`);
                }
                return yield response.json();
            }
            catch (error) {
                console.error("Error reading encryption key:", error);
                throw new Error("Failed to read encryption key");
            }
        });
    }
    getReaders(keyId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.auth.isLoggedIn()))
                throw new Error("Token expired!");
            try {
                const response = yield (0, cross_fetch_1.default)(`${scx_1.Scx.API_BASE}/keys/read/readers/${keyId}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${this.auth.getToken()}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch assigned access list ${response.status}`);
                }
                return yield response.json();
            }
            catch (err) {
                throw new Error("Failed to fetch assigned access list");
            }
        });
    }
    addReaders(userId, receivers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.auth.isLoggedIn()))
                throw new Error("Token expired!");
            try {
                if (!userId || !Array.isArray(receivers))
                    throw Error("Invalid parameters");
                const response = yield (0, cross_fetch_1.default)(`${scx_1.Scx.API_BASE}/keys/manage/add`, {
                    method: "POST",
                    headers: {
                        Accept: "*/*",
                        Authorization: `Bearer ${this.auth.getToken()}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ownerUserId: userId,
                        identities: receivers.map((email) => ({
                            value: email,
                            type: "EMAIL",
                        })),
                    }),
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch encryption key ${response.status}`);
                }
                return yield response.json();
            }
            catch (err) {
                throw new Error("Failed to fetch encryption key");
            }
        });
    }
    updateReaders(keyId, receiver) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.auth.isLoggedIn()))
                throw new Error("Token expired!");
            try {
                if (!keyId || !receiver)
                    throw Error("Invalid parameters");
                const response = yield (0, cross_fetch_1.default)(`${scx_1.Scx.API_BASE}/keys/manage/readers/add/${keyId}`, {
                    method: "PUT",
                    headers: {
                        Accept: "*/*",
                        Authorization: `Bearer ${this.auth.getToken()}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify([{ value: receiver, type: "EMAIL" }]),
                });
                if (!response.ok) {
                    throw new Error(`Failed to assign access to ${receiver} ${response.status}`);
                }
                return yield response.json();
            }
            catch (err) {
                throw new Error("Failed to assign access to " + receiver);
            }
        });
    }
    deleteReader(keyId, receivers) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.auth.isLoggedIn()))
                throw new Error("Token expired!");
            try {
                const response = yield (0, cross_fetch_1.default)(`${scx_1.Scx.API_BASE}/keys/manage/readers/delete/${keyId}`, {
                    method: "PUT",
                    headers: {
                        Accept: "*/*",
                        Authorization: `Bearer ${this.auth.getToken()}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(receivers.map((email) => ({ value: email, type: "EMAIL" }))),
                });
                if (!response.ok) {
                    throw new Error(`Failed to remove access ${response.status}`);
                }
                return response.status === 200;
            }
            catch (err) {
                console.error("Error parsing JSON:", err);
                throw new Error("Failed to remove access");
            }
        });
    }
    deleteReaders(keyId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.auth.isLoggedIn()))
                throw new Error("Token expired!");
            try {
                const response = yield (0, cross_fetch_1.default)(`${scx_1.Scx.API_BASE}/keys/readers/delete/${keyId}`, {
                    method: "DELETE",
                    headers: {
                        Accept: "*/*",
                        Authorization: `Bearer ${this.auth.getToken()}`,
                        "Content-Type": "application/json",
                    },
                });
                if (!response.ok) {
                    throw new Error(`Failed to remove assigned access list ${response.status}`);
                }
                return yield response.json();
            }
            catch (err) {
                throw new Error("Failed to remove assigned access list");
            }
        });
    }
    // Creates key and adds readers by emails and entityIds
    generateEncryptionKey(reqData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, fetchApi_1.fetchApi)(`${scx_1.Scx.API_BASE}/keys`, {
                    method: "POST",
                    body: JSON.stringify(reqData),
                    authRequired: true,
                }, this.auth);
                return yield response.json();
            }
            catch (err) {
                throw new Error("Failed to fetch encryption key");
            }
        });
    }
    // Update key readers
    updateKeyReaders(id, reqData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, fetchApi_1.fetchApi)(`${scx_1.Scx.API_BASE}/keys/${id}/acl`, {
                    method: "PUT",
                    body: JSON.stringify(reqData),
                    authRequired: true,
                }, this.auth);
                return yield response.json();
            }
            catch (err) {
                throw new Error("Failed to update readers");
            }
        });
    }
    getKeyById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, fetchApi_1.fetchApi)(`${scx_1.Scx.API_BASE}/keys/${id}`, {
                    authRequired: true,
                }, this.auth);
                return yield response.json();
            }
            catch (error) {
                console.error("Error reading encryption key:", error);
                throw new Error("Failed to read encryption key");
            }
        });
    }
    // get ACL users details
    getAclUsersDetails(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const queryParams = new URLSearchParams();
                ids.forEach((entity) => queryParams.append("entities", entity));
                const response = yield (0, fetchApi_1.fetchApi)(`${scx_1.Scx.API_BASE}/scipherx/entity-management/entities/details?${queryParams.toString()}`, {
                    authRequired: true,
                }, this.auth);
                return yield response.json();
            }
            catch (error) {
                console.error("Error reading encryption key:", error);
                throw new Error("Failed to read encryption key");
            }
        });
    }
    getAclReadersByKey(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, fetchApi_1.fetchApi)(`${scx_1.Scx.API_BASE}/keys/${id}/acl`, {
                    authRequired: true,
                }, this.auth);
                return yield response.json();
            }
            catch (error) {
                console.error("Error reading acl readers", error);
                throw new Error("Failed to read acl readers");
            }
        });
    }
}
exports.Services = Services;
