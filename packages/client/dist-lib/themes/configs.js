"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.themes = void 0;
// Import themes from their individual folders
const default_1 = require("./default");
const neowave_1 = require("./neowave");
const techno_1 = require("./techno");
const oldschool_1 = require("./oldschool");
const alien_1 = require("./alien");
// Export themes registry
exports.themes = {
    default: default_1.defaultTheme,
    neowave: neowave_1.neowaveTheme,
    techno: techno_1.technoTheme,
    oldschool: oldschool_1.oldschoolTheme,
    alien: alien_1.alienTheme,
};
//# sourceMappingURL=configs.js.map