
let fetchFunction;

async function initializeFetchFunction() {
    if (globalThis?.fetch) {
        fetchFunction = globalThis.fetch;
    } else {
        fetchFunction = globalThis.fetch;
    }
}

// Immediately invoke the initialization function
initializeFetchFunction().catch(error => {
    console.error('Failed to initialize fetch function:', error);
    // Handle error or rethrow as needed
});

export default fetchFunction;
