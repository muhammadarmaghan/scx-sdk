import { BaseSxFile } from './crypto';
import {Base64} from "js-base64";

class BaseSxFileImpl implements BaseSxFile {
    name?: string;
    type?: string;
    data: string | Uint8Array;

    constructor({name, type, data}: BaseSxFile) {
        this.name = name;
        this.type = type;
        this.data = data;
    }

    /**
     * creates a base64 string of file name, type and data(in base64)
     */
    toEncryptFormat(): BaseSxFile {
        const data = typeof this.data === 'string' ? new TextEncoder().encode(this.data) : this.data;
        return {
            name: this.name,
            type: this.type,
            data: Base64.fromUint8Array(data)
        };
    }

    /**
     * checks if string provided is actually a file or not
     * @param decFile
     */
    static isEncryptedFile(decFile: string): boolean {
        try {
            const fileObj: any = JSON.parse(decFile);
            return fileObj?.name && fileObj.data && fileObj.type;
        } catch (e) {
            return false;
        }
    }
    static async fromEncryptFormat(decFile: string) {
        try {
            const fileObj = JSON.parse(decFile);
            return new BaseSxFileImpl({
                name: fileObj.name,
                type: fileObj.type,
                data: Base64.decode(fileObj.data)
            });
        }
        catch (e) {
            throw new Error("Not a valid encrypted file");
        }
    }
}

export default BaseSxFileImpl;