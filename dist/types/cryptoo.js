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
Object.defineProperty(exports, "__esModule", { value: true });
const js_base64_1 = require("js-base64");
class BaseSxFileImpl {
    constructor({ name, type, data }) {
        this.name = name;
        this.type = type;
        this.data = data;
    }
    /**
     * creates a base64 string of file name, type and data(in base64)
     */
    toEncryptFormat() {
        const data = typeof this.data === 'string' ? new TextEncoder().encode(this.data) : this.data;
        return {
            name: this.name,
            type: this.type,
            data: js_base64_1.Base64.fromUint8Array(data)
        };
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
            try {
                const fileObj = JSON.parse(decFile);
                return new BaseSxFileImpl({
                    name: fileObj.name,
                    type: fileObj.type,
                    data: js_base64_1.Base64.decode(fileObj.data)
                });
            }
            catch (e) {
                throw new Error("Not a valid encrypted file");
            }
        });
    }
}
exports.default = BaseSxFileImpl;
