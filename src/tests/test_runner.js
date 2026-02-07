let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const results = [];

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(
            (message || "Equality check failed") +
            ` — expected: ${JSON.stringify(expected)}, got: ${JSON.stringify(actual)}`
        );
    }
}

function assertDeepEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(
            (message || "Deep equality check failed") +
            ` — expected: ${JSON.stringify(expected)}, got: ${JSON.stringify(actual)}`
        );
    }
}

function assertThrows(fn, message) {
    let threw = false;
    try {
        fn();
    } catch {
        threw = true;
    }
    if (!threw) {
        throw new Error(message || "Expected function to throw, but it did not");
    }
}

async function runTest(name, fn) {
    totalTests++;
    try {
        await fn();
        passedTests++;
        results.push({ name, status: "PASS" });
        console.log(`  ✓ ${name}`);
    } catch (err) {
        failedTests++;
        results.push({ name, status: "FAIL", error: err.message });
        console.error(`  ✗ ${name}`);
        console.error(`    ${err.message}`);
    }
}

function printSummary() {
    console.log("\n─────────────────────────────");
    console.log(`Tests: ${totalTests} total, ${passedTests} passed, ${failedTests} failed`);
    console.log("─────────────────────────────\n");
    return failedTests === 0;
}

function resetCounters() {
    totalTests = 0;
    passedTests = 0;
    failedTests = 0;
    results.length = 0;
}

export {
    assert,
    assertEqual,
    assertDeepEqual,
    assertThrows,
    runTest,
    printSummary,
    resetCounters,
    results
};
