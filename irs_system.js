const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const flash = require("connect-flash");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const { createClient } = require("redis");
const useragent = require("useragent");
const { registerGlobals } = require("./src/bootstrap/globals");
const { logSystemEvent } = require("./util");

const webRoutes = require("./src/routes/web.js");

const app = express();
const port = process.env.PORT || 8087;
const url = process.env.APP_URL || "http://localhost";

// Redis
const redisClient = createClient({
  url: "redis://localhost:6379",
  legacyMode: false,
});

redisClient
  .connect()
  .then(() => console.log("Redis connected successfully."))
  .catch(console.error);

// Core middlewares
app.use(helmet.frameguard());
app.use(cookieParser());
app.use(flash());
app.set("trust proxy", 1);

app.use(
  session({
    secret: "201-S3cr3t@#",
    resave: true,
    saveUninitialized: true,
    httpOnly: true,
    secure: true,
    ephemeral: true,
    store: new RedisStore({ client: redisClient }),
  }),
);

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.set("view engine", "ejs");

function clientInfoMiddleware(req, res, next) {
  const ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  const agent = useragent.parse(req.headers["user-agent"]);
  const browserInfo = {
    browser: agent.toAgent(),
    os: agent.os.toString(),
    platform: agent.device.toString(),
  };

  req.body.clientInfo = {
    ip: ipAddress,
    browserInfo,
  };

  if (req.session && req.session.email) {
    const { email, cheoName, userName, officeName } = req.session;
    const { browser, os, platform } = browserInfo;

    console.log("\n************User Info*******************\n");
    console.log(
      "URL: " + req.hostname + req.url,
      "\nBrowser" + browser,
      "\nOS:" + os,
      "\nPlatform:" + platform,
      "\nIP: " + ipAddress,
      "\nEmail:" + email,
      "\nCheo: " + cheoName,
      "\nUsername: " + userName,
      "\nOfisi: " + officeName,
    );
    console.log("\n*************End******************\n");
  }

  next();
}

registerGlobals(app);

app.use(clientInfoMiddleware);

app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    if (Number(res.statusCode || 0) < 400) return;
    if (String(req?.originalUrl || "").includes("/SystemLogsClientError")) return;

    logSystemEvent(req, {
      level: res.statusCode >= 500 ? "critical" : "error",
      module: "ui-server",
      event_type: "http-response-error",
      message: `${req.method} ${req.originalUrl} imerudisha status ${res.statusCode}.`,
      source: "sas-admin/irs_system.js:response-monitor",
      context: {
        duration_ms: Date.now() - startedAt,
        params: req?.params || null,
        query: req?.query || null,
      },
      error_details: null,
    });
  });
  next();
});

// Frontend routes are registered via web.js
app.use("/", webRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);

  if (req) {
    logSystemEvent(req, {
      level: "critical",
      module: "ui-server",
      event_type: "express-error",
      message: err?.message || "Unhandled UI server error.",
      source: "sas-admin/irs_system.js:error-middleware",
      context: {
        pathname: req?.originalUrl || req?.url || null,
        method: req?.method || null,
        params: req?.params || null,
        query: req?.query || null,
      },
      error_details: {
        name: err?.name || null,
        stack: typeof err?.stack === "string" ? err.stack.slice(0, 4000) : null,
      },
    });
  }

  if (res.headersSent) {
    return next(err);
  }
  return res.redirect("/404");
});

app.listen(port, () => {
  console.log(`Hello IRS, Client Server is running at ${url}${port ? ":" + port : ""} on ${new Date()} `);
});
