var fs = require("fs");

module.exports = {
	main: fs.readFileSync(__dirname + "/main.html", "utf8")
};
