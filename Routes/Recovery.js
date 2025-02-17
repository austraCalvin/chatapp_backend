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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const Recovery_1 = require("./Callback/Recovery");
const recoveryRouter = (0, express_1.Router)();
recoveryRouter.post("/", express_1.default.text(), (req, res, next) => {
    const unAuthorizedRequest = req;
    (0, Recovery_1.requestRecoveryCallback)(unAuthorizedRequest, res, next);
});
recoveryRouter.get("/:id", (req, res, next) => {
    const unAuthorizedRequest = req;
    (0, Recovery_1.checkRecoveryCallback)(unAuthorizedRequest, res, next);
});
recoveryRouter.post("/:id", express_1.default.text(), (req, res, next) => {
    const unAuthorizedRequest = req;
    (0, Recovery_1.validateRecoveryCodeCallback)(unAuthorizedRequest, res, next);
});
recoveryRouter.post("/confirm/:id", express_1.default.json(), (req, res, next) => {
    const unAuthorizedRequest = req;
    (0, Recovery_1.confirmRecoveryCallback)(unAuthorizedRequest, res, next);
});
recoveryRouter.get("/cancel/:id", (req, res, next) => {
    const unAuthorizedRequest = req;
    (0, Recovery_1.cancelRecoveryCallback)(unAuthorizedRequest, res, next);
});
exports.default = recoveryRouter;
