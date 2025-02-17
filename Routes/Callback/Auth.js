"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OnlyAuthorized = (req, res, next) => {
    if (!req.isAuthenticated()) {
        console.log(`${req.url.split("/")[1].toUpperCase()} - User is not authorized`);
        //status = 401
        // return res.status(200).json({ "state": "Unauthorized" });
        return;
    }
    ;
    next();
};
exports.default = OnlyAuthorized;
