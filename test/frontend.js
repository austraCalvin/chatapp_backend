"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_client_1 = require("socket.io-client");
const currentUser = (0, socket_io_client_1.io)("ws://127.0.0.1:27017", { "withCredentials": true });
// "message-to-deliver"
// "message-to-read"
// "contact-online"
// "contact-offline"
// "message-status"
currentUser.on("message-to-deliver", (message) => {
});
