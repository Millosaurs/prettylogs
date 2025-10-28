const express = require("express");
const { createEnvironmentLogger } = require("@millosaurs/prettylogs");

// Create environment-aware logger
const logger = createEnvironmentLogger();
const requestLogger = logger.child("request");
const dbLogger = logger.child("database");
const authLogger = logger.child("auth");

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const start = Date.now();

  // Attach logger with request ID to request object
  req.logger = requestLogger.child(requestId);
  req.requestId = requestId;

  req.logger.info("Incoming request", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    contentLength: req.get("Content-Length") || 0,
  });

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? "error" : "info";

    req.logger[level]("Request completed", {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get("Content-Length") || 0,
    });
  });

  next();
});

// Simulated database
const users = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "admin" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "user" },
  {
    id: 3,
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "moderator",
  },
];

// Simulated database operations with logging
const db = {
  async findUser(id) {
    const timer = dbLogger.startTimer(`find-user-${id}`);

    // Simulate database delay
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 100 + 50),
    );

    const user = users.find((u) => u.id === parseInt(id));
    const duration = timer();

    if (user) {
      dbLogger.info("User found", { userId: id, duration });
    } else {
      dbLogger.warn("User not found", { userId: id, duration });
    }

    return user;
  },

  async createUser(userData) {
    const timer = dbLogger.startTimer("create-user");

    // Simulate database delay
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 200 + 100),
    );

    const newUser = {
      id: users.length + 1,
      ...userData,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    const duration = timer();

    dbLogger.success("User created", {
      userId: newUser.id,
      email: newUser.email,
      duration,
    });

    return newUser;
  },

  async updateUser(id, updates) {
    const timer = dbLogger.startTimer(`update-user-${id}`);

    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 150 + 75),
    );

    const userIndex = users.findIndex((u) => u.id === parseInt(id));
    if (userIndex === -1) {
      dbLogger.warn("Update failed - user not found", { userId: id });
      return null;
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const duration = timer();

    dbLogger.success("User updated", {
      userId: id,
      updatedFields: Object.keys(updates),
      duration,
    });

    return users[userIndex];
  },

  async deleteUser(id) {
    const timer = dbLogger.startTimer(`delete-user-${id}`);

    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 100 + 50),
    );

    const userIndex = users.findIndex((u) => u.id === parseInt(id));
    if (userIndex === -1) {
      dbLogger.warn("Delete failed - user not found", { userId: id });
      return false;
    }

    const deletedUser = users.splice(userIndex, 1)[0];
    const duration = timer();

    dbLogger.info("User deleted", {
      userId: id,
      email: deletedUser.email,
      duration,
    });

    return true;
  },
};

// Authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    authLogger.warn("Authentication failed - no token", {
      requestId: req.requestId,
      ip: req.ip,
    });
    return res.status(401).json({ error: "Authorization header required" });
  }

  const token = authHeader.split(" ")[1];

  // Simulated token validation
  if (token === "valid-token-123") {
    authLogger.success("Authentication successful", {
      requestId: req.requestId,
      token: token.substr(0, 8) + "...",
    });
    req.user = { id: 1, role: "admin" };
    next();
  } else {
    authLogger.error("Authentication failed - invalid token", {
      requestId: req.requestId,
      token: token.substr(0, 8) + "...",
      ip: req.ip,
    });
    res.status(401).json({ error: "Invalid token" });
  }
};

// Routes
app.get("/", (req, res) => {
  req.logger.info("Health check endpoint accessed");

  logger.box(
    "🚀 PrettyLogs Web Server\nExample application running",
    "SUCCESS",
  );

  res.json({
    message: "PrettyLogs Web Server Example",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET / - This endpoint",
      "GET /users - List all users",
      "GET /users/:id - Get user by ID",
      "POST /users - Create new user (requires auth)",
      "PUT /users/:id - Update user (requires auth)",
      "DELETE /users/:id - Delete user (requires auth)",
    ],
  });
});

// Get all users
app.get("/users", async (req, res) => {
  req.logger.info("Fetching all users");

  try {
    // Simulate some processing time
    const timer = req.logger.startTimer("fetch-users");
    await new Promise((resolve) => setTimeout(resolve, 50));
    const duration = timer();

    req.logger.success("Users fetched successfully", {
      count: users.length,
      duration,
    });

    // Display users in table format for development
    if (process.env.NODE_ENV !== "production") {
      req.logger.table(
        users.map((u) => ({
          id: u.id,
          name: u.name,
          role: u.role,
        })),
      );
    }

    res.json(users);
  } catch (error) {
    req.logger.error("Failed to fetch users", { error: error.message });
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user by ID
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  req.logger.info("Fetching user by ID", { userId: id });

  try {
    const user = await db.findUser(id);

    if (!user) {
      req.logger.warn("User not found", { userId: id });
      return res.status(404).json({ error: "User not found" });
    }

    req.logger.success("User retrieved successfully", { userId: id });
    res.json(user);
  } catch (error) {
    req.logger.error("Failed to fetch user", {
      userId: id,
      error: error.message,
    });
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create new user (protected route)
app.post("/users", authenticate, async (req, res) => {
  const userData = req.body;

  req.logger.info("Creating new user", { email: userData.email });

  try {
    // Validation
    req.logger.assert(userData.name, "Name is required");
    req.logger.assert(userData.email, "Email is required");
    req.logger.assert(
      userData.email.includes("@"),
      "Valid email format required",
    );

    req.logger.group("User Creation Process", () => {
      req.logger.info("Step 1: Validating user data");
      req.logger.debug("User data", userData);
      req.logger.success("Validation passed");

      req.logger.info("Step 2: Checking for duplicate email");
      const existingUser = users.find((u) => u.email === userData.email);
      if (existingUser) {
        throw new Error("Email already exists");
      }
      req.logger.success("No duplicates found");
    });

    const newUser = await db.createUser({
      name: userData.name,
      email: userData.email,
      role: userData.role || "user",
    });

    req.logger.success("User created successfully", {
      userId: newUser.id,
      email: newUser.email,
    });

    res.status(201).json(newUser);
  } catch (error) {
    req.logger.error("User creation failed", {
      email: userData.email,
      error: error.message,
    });

    const status = error.message.includes("already exists") ? 409 : 500;
    res.status(status).json({ error: error.message });
  }
});

// Update user (protected route)
app.put("/users/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  req.logger.info("Updating user", {
    userId: id,
    updates: Object.keys(updates),
  });

  try {
    const updatedUser = await db.updateUser(id, updates);

    if (!updatedUser) {
      req.logger.warn("Update failed - user not found", { userId: id });
      return res.status(404).json({ error: "User not found" });
    }

    req.logger.success("User updated successfully", {
      userId: id,
      updatedFields: Object.keys(updates),
    });

    res.json(updatedUser);
  } catch (error) {
    req.logger.error("User update failed", {
      userId: id,
      error: error.message,
    });
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete user (protected route)
app.delete("/users/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  req.logger.info("Deleting user", { userId: id });

  try {
    const deleted = await db.deleteUser(id);

    if (!deleted) {
      req.logger.warn("Delete failed - user not found", { userId: id });
      return res.status(404).json({ error: "User not found" });
    }

    req.logger.success("User deleted successfully", { userId: id });
    res.status(204).send();
  } catch (error) {
    req.logger.error("User deletion failed", {
      userId: id,
      error: error.message,
    });
    res.status(500).json({ error: "Internal server error" });
  }
});

// Error handling middleware
app.use((error, req, res) => {
  const errorId = `error-${Date.now()}`;

  req.logger.error("Unhandled application error", {
    errorId,
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
  });

  res.status(500).json({
    error: "Internal server error",
    errorId,
  });
});

// 404 handler
app.use((req, res) => {
  req.logger.warn("Route not found", {
    url: req.originalUrl,
    method: req.method,
  });

  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(port, () => {
  logger.box(
    `🚀 PrettyLogs Web Server Example\n` +
      `Server running on http://localhost:${port}\n` +
      `Environment: ${process.env.NODE_ENV || "development"}\n` +
      `Node.js: ${process.version}`,
    "SUCCESS",
  );

  logger.divider("=", 60);

  logger.info("Server configuration", {
    port,
    environment: process.env.NODE_ENV || "development",
    nodeVersion: process.version,
    logLevel: logger.getConfig().minLevel,
  });

  logger.divider();

  logger.info("Available test commands:");
  console.log("  curl http://localhost:3000/");
  console.log("  curl http://localhost:3000/users");
  console.log("  curl http://localhost:3000/users/1");
  console.log('  curl -H "Authorization: Bearer valid-token-123" \\');
  console.log('       -H "Content-Type: application/json" \\');
  console.log(
    '       -d \'{"name":"John Doe","email":"john@example.com"}\' \\',
  );
  console.log("       http://localhost:3000/users");

  logger.divider();
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");

  // Flush any pending logs
  await logger.flush();

  logger.success("Server shutdown complete");
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");

  await logger.flush();

  logger.success("Server shutdown complete");
  process.exit(0);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", {
    reason: reason.toString(),
    stack: reason.stack,
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.fatal("Uncaught Exception", {
    message: error.message,
    stack: error.stack,
  });
});
