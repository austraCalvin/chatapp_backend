"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const Contact_1 = require("./Callback/Contact");
const Auth_1 = __importDefault(require("./Callback/Auth"));
const contactRouter = (0, express_1.Router)();
contactRouter.get("/", Auth_1.default, async (req, res, next) => {
    const authorizedRequest = req;
    (0, Contact_1.getContactListHandler)(authorizedRequest, res, next);
});
contactRouter.post("/add", Auth_1.default, express_1.default.text(), (req, res, next) => {
    const authorizedRequest = req;
    (0, Contact_1.addContactHandler)(authorizedRequest, res, next);
});
contactRouter.get("/:id", Auth_1.default, (req, res, next) => {
    const authorizedRequest = req;
    (0, Contact_1.getContactHandler)(authorizedRequest, res, next);
});
exports.default = contactRouter;
