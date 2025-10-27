import { logger, createLogger } from "../src/logFunction";

// Helper to add delays between tests
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
    console.log("\n" + "=".repeat(70));
    console.log("Testing Advanced Logger Package - Full Feature Suite");
    console.log("=".repeat(70) + "\n");

    // Test 1: All log levels
    console.log("  Test 1: All Log Levels");
    logger.info("This is an info message");
    logger.debug("This is a debug message");
    logger.warn("This is a warning message");
    logger.error("This is an error message");
    logger.success("This is a success message");
    logger.trace("This is a trace message (verbose mode only)");
    await sleep(1500);

    // Test 2: Multiple arguments with objects
    console.log("\n  Test 2: Multiple Arguments & Objects");
    logger.info("User logged in:", {
        userId: 123,
        email: "test@example.com",
        role: "admin",
    });
    logger.success("Operation completed", "with", 3, "items processed");
    logger.debug("Request payload:", { method: "POST", path: "/api/users" });
    await sleep(1500);

    // Test 3: Timestamps with different formats
    console.log("\n  Test 3: Timestamp Formats");

    const isoLogger = createLogger({ timestamps: true, dateFormat: "iso" });
    isoLogger.info("ISO format timestamp");

    const localeLogger = createLogger({
        timestamps: true,
        dateFormat: "locale",
    });
    localeLogger.info("Locale format timestamp");

    const unixLogger = createLogger({ timestamps: true, dateFormat: "unix" });
    unixLogger.info("Unix timestamp");
    await sleep(1500);

    // Test 4: Log level filtering
    console.log("\n  Test 4: Custom Log Levels (Only INFO, ERROR, FATAL)");
    const filteredLogger = createLogger({ levels: ["INFO", "ERROR", "FATAL"] });
    filteredLogger.info("✓ This will show");
    filteredLogger.debug("✗ This will NOT show");
    filteredLogger.warn("✗ This will NOT show");
    filteredLogger.error("✓ This will show");
    filteredLogger.success("✗ This will NOT show");
    await sleep(1500);

    // Test 5: Nested child loggers
    console.log("\n  Test 5: Child Loggers with Namespaces");
    const dbLogger = logger.child("database");
    const authLogger = logger.child("auth");
    const apiLogger = logger.child("api");

    dbLogger.info("Connected to MongoDB on port 27017");
    authLogger.success("JWT token validated");
    apiLogger.warn("Rate limit: 95/100 requests");

    const queryLogger = dbLogger.child("query");
    const cacheLogger = dbLogger.child("cache");
    queryLogger.debug("SELECT * FROM users WHERE active = true");
    cacheLogger.info("Cache hit for key: user:123");
    await sleep(1500);

    // Test 6: Grouped logs
    console.log("\n  Test 6: Grouped Logs");
    logger.group("🔐 User Authentication Flow", () => {
        logger.info("Step 1: Validating credentials");
        logger.success("Credentials valid");
        logger.info("Step 2: Checking permissions");
        logger.success("User has required permissions");
        logger.info("Step 3: Generating session token");
        logger.success("Token generated: abc123xyz");
    });
    await sleep(1500);

    // Test 7: Table output
    console.log("\n  Test 7: Table Output");
    const users = [
        {
            id: 1,
            name: "Alice Johnson",
            role: "Admin",
            status: "active",
            lastLogin: "2025-10-26",
        },
        {
            id: 2,
            name: "Bob Smith",
            role: "User",
            status: "active",
            lastLogin: "2025-10-27",
        },
        {
            id: 3,
            name: "Charlie Brown",
            role: "Moderator",
            status: "inactive",
            lastLogin: "2025-10-20",
        },
    ];
    logger.info("Current users in system:");
    logger.table(users);
    await sleep(1500);

    // Test 8: Assertions
    console.log("\n  Test 8: Assertions");
    const userId = 90;
    const username = "john_doe";
    logger.assert(userId > 0, "User ID must be positive");
    logger.assert(
        username.length >= 3,
        "Username must be at least 3 characters",
    );
    logger.assert(userId < 100, "User ID must be less than 100"); // This will fail
    await sleep(1500);

    // Test 9: Spinner animations
    console.log("\n  Test 9: Loading Spinners");

    const spinner1 = logger.spinner("Fetching user data from database...");
    await sleep(2000);
    spinner1();
    logger.success("User data loaded successfully");

    const spinner2 = logger.spinner("Processing payment transaction...");
    await sleep(1500);
    spinner2();
    logger.success("Payment processed");

    const spinner3 = logger.spinner("Sending verification email...");
    await sleep(1000);
    spinner3();
    logger.success("Email sent");
    await sleep(500);

    // Test 10: Performance timers
    console.log("\n  Test 10: Performance Timers");

    // Method 1: time/timeEnd
    logger.time("database-query");
    await sleep(500);
    logger.timeEnd("database-query");

    // Method 2: startTimer
    const stopTimer = logger.startTimer("api-request");
    await sleep(300);
    const duration = stopTimer();
    logger.info(`Request completed in ${duration.toFixed(2)}ms`);
    await sleep(1000);

    // Test 11: Box messages
    console.log("\n  Test 11: Box Messages");
    logger.box(
        "Server started successfully!\nListening on port 3000\nEnvironment: production",
        "SUCCESS",
    );
    await sleep(500);
    logger.box(
        "WARNING: Database migration required\nPlease run: npm run migrate",
        "WARN",
    );
    await sleep(500);
    logger.box(
        "CRITICAL ERROR\nMemory usage exceeded 90%\nImmediate action required!",
        "ERROR",
    );
    await sleep(1500);

    // Test 12: JSON output
    console.log("\n  Test 12: JSON Formatting");
    const complexData = {
        user: {
            id: 123,
            name: "John Doe",
            email: "john@example.com",
            settings: {
                theme: "dark",
                notifications: true,
                language: "en-US",
            },
        },
        metadata: {
            createdAt: new Date(),
            lastModified: new Date(),
            version: "1.2.3",
        },
    };
    logger.json(complexData);
    await sleep(1500);

    // Test 13: Dividers
    console.log("\n  Test 13: Dividers");
    logger.divider();
    logger.info("Section 1: Configuration");
    logger.divider("=", 40);
    logger.info("Section 2: Data Processing");
    logger.divider("*", 50);
    logger.info("Section 3: Results");
    logger.divider();
    await sleep(1500);

    // Test 14: Verbose mode
    console.log("\n  Test 14: Verbose Mode");
    const verboseLogger = createLogger({ mode: "verbose" });
    verboseLogger.info("Info message in verbose mode");
    verboseLogger.debug("Debug messages are visible");
    verboseLogger.trace("Trace messages are also visible");
    verboseLogger.warn("Warning message");
    await sleep(1500);

    // Test 15: Silent mode
    console.log("\n  Test 15: Silent Mode");
    console.log("(The following logs should NOT appear)");
    const silentLogger = createLogger({ mode: "silent" });
    silentLogger.info("This will NOT show");
    silentLogger.error("This will NOT show either");
    silentLogger.success("Silent mode is active");
    console.log("✓ Silent mode test complete");
    await sleep(1500);

    // Test 16: File logging with JSON format
    console.log("\n  Test 16: File Logging (JSON Format)");
    const fileLogger = createLogger({
        logFile: "./logs/app.log",
        timestamps: true,
        logFormat: "json",
    });
    fileLogger.info("Application started");
    fileLogger.error("Sample error for logging", {
        code: 500,
        message: "Internal server error",
    });
    fileLogger.success("Data saved to database");
    console.log("✓ Check './logs/app.log' for JSON formatted output");
    await sleep(1500);

    // Test 17: Dynamic configuration
    console.log("\n  Test 17: Dynamic Configuration Updates");
    const dynamicLogger = createLogger();
    dynamicLogger.info("Initial message without timestamps");

    dynamicLogger.setConfig({ timestamps: true, dateFormat: "iso" });
    dynamicLogger.info("Now with ISO timestamps");

    dynamicLogger.setConfig({ colorize: false });
    dynamicLogger.info("Colors disabled");

    dynamicLogger.setConfig({ colorize: true, timestamps: false });
    dynamicLogger.info("Colors enabled, timestamps disabled");
    await sleep(1500);

    // Test 18: Non-colorized output
    console.log("\n  Test 18: Non-Colorized Output");
    const plainLogger = createLogger({ colorize: false, timestamps: true });
    plainLogger.info("Plain text info message");
    plainLogger.error("Plain text error message");
    plainLogger.success("Plain text success message");
    await sleep(1500);

    // Test 19: Real-world API scenario
    console.log("\n  Test 19: Real-World Scenario - Complete API Request Flow");
    const requestLogger = logger.child("api");

    logger.divider("=", 70);
    requestLogger.info("Incoming request: POST /api/v1/users");

    const requestTimer = requestLogger.startTimer("request-processing");

    requestLogger.group("Request Details", () => {
        requestLogger.info("Headers:", {
            "content-type": "application/json",
            authorization: "Bearer ***",
            "user-agent": "Mozilla/5.0",
        });
        requestLogger.debug("Body:", {
            name: "Jane Doe",
            email: "jane@example.com",
            role: "user",
        });
    });

    const dbSpinner = requestLogger.spinner("Validating user data...");
    await sleep(800);
    dbSpinner();
    requestLogger.success("Validation passed");

    const saveSpinner = requestLogger.spinner("Saving to database...");
    await sleep(1200);
    saveSpinner();
    requestLogger.success("User created with ID: 456");

    const emailSpinner = requestLogger.spinner("Sending welcome email...");
    await sleep(600);
    emailSpinner();
    requestLogger.success("Welcome email sent");

    const totalDuration = requestTimer();

    requestLogger.group("Response", () => {
        requestLogger.success("Status: 201 Created");
        requestLogger.info(`Total time: ${totalDuration.toFixed(2)}ms`);
        requestLogger.table([
            {
                userId: 456,
                name: "Jane Doe",
                email: "jane@example.com",
                createdAt: new Date().toISOString(),
            },
        ]);
    });

    logger.divider("=", 70);
    await sleep(1500);

    // Test 20: Error handling scenario
    console.log("\n  Test 20: Error Handling Scenario");
    const errorLogger = logger.child("error-handler");

    try {
        errorLogger.info("Attempting risky operation...");
        throw new Error("Connection timeout after 30s");
    } catch (error: any) {
        errorLogger.error("Operation failed:", error.message);
        errorLogger.json(
            {
                error: error.message,
                stack: error.stack?.split("\n").slice(0, 3),
                timestamp: new Date().toISOString(),
            },
            "ERROR",
        );
        errorLogger.box(
            "Recovery action required\nPlease check connection settings",
            "WARN",
        );
    }
    await sleep(1500);

    // Test 21: Log file utilities
    console.log("\n  Test 21: Log File Utilities");
    const utilLogger = createLogger({ logFile: "./logs/test.log" });
    utilLogger.info("Test log entry 1");
    utilLogger.info("Test log entry 2");

    const fileSize = utilLogger.getLogFileSize();
    logger.info(`Current log file size: ${fileSize} bytes`);

    // Uncomment to test clearing log file
    // utilLogger.clearLogFile();
    // logger.success("Log file cleared");

    console.log("\n" + "=".repeat(70));
    logger.box(
        "All tests completed successfully! 🎉\n" +
            `Total features tested: 21\n` +
            `Logger is production ready!`,
        "SUCCESS",
    );
    console.log("=".repeat(70) + "\n");
}

// Run all tests
runTests().catch(console.error);
