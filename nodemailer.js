"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const transport = nodemailer_1.default.createTransport({
    "service": "gmail",
    "auth": {
        "user": "alexandrerivero16@gmail.com",
        "pass": "suwi crha obwq lmox"
    }
});
exports.default = transport;
