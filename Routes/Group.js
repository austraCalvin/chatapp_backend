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
const routescb_1 = require("../routescb");
const Auth_1 = __importDefault(require("./Callback/Auth"));
const groupRouter = (0, express_1.Router)();
groupRouter.post("/", Auth_1.default, express_1.default.json(), (req, res, next) => {
    const authorizedRequest = req;
    (0, routescb_1.postGroupHandler)(authorizedRequest, res, next);
});
groupRouter.get("/:id", Auth_1.default, async (req, res, next) => {
    const authorizedRequest = req;
    (0, routescb_1.getJoinListHandler)(authorizedRequest, res, next);
});
groupRouter.get("/", Auth_1.default, async (req, res, next) => {
    const authorizedRequest = req;
    (0, routescb_1.getGroupListHandler)(authorizedRequest, res, next);
});
exports.default = groupRouter;
