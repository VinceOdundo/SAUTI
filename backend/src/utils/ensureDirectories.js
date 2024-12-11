const fs = require("fs");
const path = require("path");

const ensureDirectories = () => {
  const dirs = [
    path.join(__dirname, "../../uploads"),
    path.join(__dirname, "../../uploads/posts"),
    path.join(__dirname, "../../uploads/organizations"),
    path.join(__dirname, "../../uploads/users"),
    path.join(__dirname, "../../uploads/representatives"),
    path.join(__dirname, "../../uploads/temp"),
    path.join(__dirname, "../../logs"),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

module.exports = ensureDirectories;
