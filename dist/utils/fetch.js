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
let fetchFunction;
function initializeFetchFunction() {
    return __awaiter(this, void 0, void 0, function* () {
        if (globalThis === null || globalThis === void 0 ? void 0 : globalThis.fetch) {
            fetchFunction = globalThis.fetch;
        }
        else {
            fetchFunction = globalThis.fetch;
        }
    });
}
// Immediately invoke the initialization function
initializeFetchFunction().catch(error => {
    console.error('Failed to initialize fetch function:', error);
    // Handle error or rethrow as needed
});
exports.default = fetchFunction;
