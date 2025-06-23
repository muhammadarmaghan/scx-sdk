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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const libsodium_wrappers_1 = __importDefault(require("libsodium-wrappers"));
class BaseSxFileImpl {
    constructor(_a) {
        var { name, type } = _a, props = __rest(_a, ["name", "type"]);
        this.name = name;
        this.type = type;
        this.data = JSON.stringify(props);
    }
    /**
     * creates a base64 string of file name, type and data(in base64)
     */
    toEncryptFormat() {
        return libsodium_wrappers_1.default.to_base64(JSON.stringify({
            name: this.name,
            type: this.type,
            data: libsodium_wrappers_1.default.to_base64(this.data, libsodium_wrappers_1.default.base64_variants.URLSAFE)
        }), libsodium_wrappers_1.default.base64_variants.URLSAFE);
    }
    /**
     * checks if string provided is actually a file or not
     * @param decFile
     */
    static isEncryptedFile(decFile) {
        try {
            const fileObj = JSON.parse(decFile);
            return (fileObj === null || fileObj === void 0 ? void 0 : fileObj.name) && fileObj.data && fileObj.type;
        }
        catch (e) {
            return false;
        }
    }
    static fromEncryptFormat(decFile) {
        return __awaiter(this, void 0, void 0, function* () {
            yield libsodium_wrappers_1.default.ready;
            try {
                const fileObj = JSON.parse(decFile);
                return new BaseSxFileImpl({
                    name: fileObj.name,
                    type: fileObj.type,
                    data: libsodium_wrappers_1.default.from_base64(fileObj.data, libsodium_wrappers_1.default.base64_variants.URLSAFE)
                });
            }
            catch (e) {
                throw new Error("Not a valid encrypted file");
            }
        });
    }
}
exports.default = BaseSxFileImpl;
