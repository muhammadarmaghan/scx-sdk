/**
 * This decorator restricts access based on user's authentication
 * The decorated method or function can only be accessed if the user is logged in
 *
 * @throws Error - Throws an error if the condition is not met.
 * @returns A decorator function that checks and restricts access
 *
 * @example
 * ```typescript
 * class RestrictedClass {
 *     @isLoggedIn()
 *     restrictedMethod() {
 *         // This method can only be accessed if the user is logged in.
 *         console.log("Access granted.");
 *     }
 * }
 * ```
 */
declare function isLoggedIn(): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export default isLoggedIn;
//# sourceMappingURL=isLoggedIn.d.ts.map