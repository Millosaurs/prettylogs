const { createLogger } = require("../dist/index.js");

const logger = createLogger({
  logFile: "./logs/server.log",
  timestamps: true,
  logFormat: "json",
});

// Simulate database function
async function getUsersFromDatabase() {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 100));
  return [
    { id: 1, name: "John" },
    { id: 2, name: "Jane" },
    { id: 3, name: "Bob" },
  ];
}

// Main function to run the logging demo
async function main() {
  // Create request-specific logger
  const requestLogger = logger.child(`req-${Date.now()}`);

  // Log incoming request
  requestLogger.info("Incoming request", {
    method: "GET",
    url: "/users",
    ip: "127.0.0.1",
  });

  // Start timer for database fetch
  const timer = requestLogger.startTimer("fetch-users");

  try {
    // Fetch users
    const users = await getUsersFromDatabase();
    const duration = timer();

    // Log success
    requestLogger.success("Users fetched", {
      count: users.length,
      duration,
    });

    console.log("Response:", users);
  } catch (error) {
    // Log error
    requestLogger.error("Failed to fetch users", {
      error: error.message,
    });
  }
}

// Run the main function
main();
