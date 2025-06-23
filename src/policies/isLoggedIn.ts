function checkUserLoggedIn() {
    // TODO: needs implementation
    return false;
}

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
function isLoggedIn() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log(`Request for ${target.constructor.name}.${propertyKey}`);
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            if (checkUserLoggedIn()) {
                return originalMethod.apply(this, args);
            } else {
                throw new Error("Access denied. Please login to continue.");
            }
        };
        return descriptor;
    };
}

export default isLoggedIn;