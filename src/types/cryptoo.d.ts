import { BaseSxFile } from './crypto';
declare class BaseSxFileImpl implements BaseSxFile {
    name?: string;
    type?: string;
    data: string | Uint8Array;
    constructor({ name, type, ...props }: BaseSxFile);
    /**
     * creates a base64 string of file name, type and data(in base64)
     */
    toEncryptFormat(): string;
    /**
     * checks if string provided is actually a file or not
     * @param decFile
     */
    static isEncryptedFile(decFile: string): boolean;
    static fromEncryptFormat(decFile: string): Promise<BaseSxFileImpl>;
}
export default BaseSxFileImpl;
//# sourceMappingURL=cryptoo.d.ts.map