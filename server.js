const express = require("express");
const app = express();
const path = require("path");
const PORT = process.env.PORT || 3500;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const { logger } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

// always use at the first
app.use(logger);

app.use(cors(corsOptions));
// middleware for json
app.use(express.json());

// middleware for parsing cookies
app.use(cookieParser);

// static file middleware
app.use("/", express.static(path.join(__dirname, "/public")));

// Routes
app.use("/", require("./routes/root"));

//404 route
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 not found" });
  } else {
    res.type("text").send("404 Not Found");
  }
});

// always use at the end
app.use(errorHandler);
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
