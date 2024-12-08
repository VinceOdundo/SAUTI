const app = require("./app");
const config = require("./config/env");
const logger = require("./config/logger");
const connectDB = require("./config/db");

connectDB();

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
