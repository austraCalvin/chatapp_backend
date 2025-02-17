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
const http = __importStar(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const express_session_1 = __importDefault(require("express-session"));
const path_1 = __importDefault(require("path"));
const Config_1 = __importDefault(require("./DAO/DataBase/Config"));
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = __importDefault(require("passport-local"));
const UserConnection_1 = __importDefault(require("./DAO/Entity/User/UserConnection"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const web_push_1 = __importDefault(require("web-push"));
const routescb_1 = require("./routescb");
const passportCallback = __importStar(require("./passport"));
const Registration_1 = __importDefault(require("./Routes/Registration"));
const Recovery_1 = __importDefault(require("./Routes/Recovery"));
const Auth_1 = __importDefault(require("./Routes/Callback/Auth"));
const Contact_1 = __importDefault(require("./Routes/Contact"));
const Group_1 = __importDefault(require("./Routes/Group"));
const Notification_1 = __importDefault(require("./Routes/Notification"));
const MessageRequest_1 = __importDefault(require("./Routes/MessageRequest"));
const User_1 = __importDefault(require("./Routes/User"));
const appVapidKeys = {
    "public": "BPKZs4zBSew-sYH3EAt9sdxFRoTUL_rpraR23wG3UtAZg9_1OgGJqyUuVJ493rt9tPquPiSM3D3xK0z_oPUelg0",
    "private": "Us-iMeIfHok02D3yjAgAuA8LKC7k5WT5FxNnznWqO8c"
}, appPort = process.env.PORT || process.env.app_port || 27018, appIP = process.env.IP || process.env.app_ip || "localhost";
web_push_1.default.setVapidDetails("mailto: alexandrerivero16@gmail.com", appVapidKeys.public, appVapidKeys.private);
const app = (0, express_1.default)();
// passport.use("signup", new passportStrategy.Strategy({ "passReqToCallback": true }, passportCallback.signup));
passport_1.default.use("login", new passport_local_1.default.Strategy({ "passReqToCallback": true }, passportCallback.login));
passport_1.default.serializeUser(passportCallback.serializeUser);
passport_1.default.deserializeUser(passportCallback.deserializeUser);
const sessionConfig = {
    "name": "chatapp",
    "secret": "diosa",
    "resave": false,
    "rolling": true,
    "saveUninitialized": true,
    "cookie": {
        "maxAge": 10 * 60 * 1000,
        "httpOnly": false,
        "secure": false,
        "sameSite": false,
        "path": "/",
        "domain": "localhost"
    }
};
const customSession = (0, express_session_1.default)(sessionConfig);
// app.use(express.urlencoded({ "extended": true }));
app.use(express_1.default.static(path_1.default.join(__dirname, "/upload")));
app.use(express_1.default.json());
// app.use(express.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)("diosa"));
app.use(customSession);
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// app.use(cors(corsConfig));
app.use((0, cors_1.default)((req, done) => {
    const { headers: { origin }, method } = req;
    console.log("origin from cors callback --->");
    // console.log("cors origin:", origin);
    // console.log("cors method:", method);
    console.table({ "origin": origin, "url": req.url, "method": method });
    console.log("credentials header:", req.headers["access-control-allow-credentials"]);
    done(null, {
        "origin": true,
        "credentials": true,
        "methods": ["get", "post", "patch", "put", "delete"]
    });
}));
// type CustomRequest<isAuth extends boolean = false, Params = {}, ReqBody = any> = Request<Params, any, ReqBody, QueryString.ParsedQs, Record<string, any>> & (isAuth extends true ? { user: Express.User } : { user?: undefined });
app.use("/user", User_1.default);
app.use("/registration", Registration_1.default);
app.use("/recovery", Recovery_1.default);
app.use("/contact", Contact_1.default);
app.use("/group", Group_1.default);
app.use("/notification", Notification_1.default);
app.use("/messagerequest", MessageRequest_1.default);
app.post("/logout", (req, res) => {
    req.logOut((err) => {
        if (err) {
            res.json({ "state": "Fail" });
            return;
        }
        ;
        res.json({ "state": "Success" });
    });
});
app.get("/isAuthenticated", (req, res) => {
    const currentSession = req.session;
    const previousCount = req.session.count || 0;
    console.log("checking authentication");
    console.log("session:", req.session);
    console.log("server session-id:", req.session.id);
    currentSession.count = previousCount + 1;
    // currentSession.userId = "random";
    console.log("current user:", !!req.user ? req.user : "none");
    console.log(!!req.isAuthenticated);
    // console.log("credentials header:", req.headers["access-control-allow-credentials"]);
    const userId = req.session.userId;
    console.log("session user-id:", userId ? userId : "none");
    if (req.isAuthenticated()) {
        console.log("the current user is authenticated");
        res.status(200).json({ "state": "Authorized" });
    }
    else {
        console.log("the current user is NOT authenticated");
        res.status(200).json({ "state": "Unauthorized" });
    }
    ;
    console.log("count:", previousCount);
});
app.post("/login", express_1.default.json(), passport_1.default.authenticate("login"), (req, res) => {
    if (req.isAuthenticated()) {
        console.log("User has been logged in");
        console.log("User:", req.user ? req.user : "none");
        req.session.userId = req.user.id;
        res.status(200).send("Correct");
    }
    else {
        console.log("User has NOT been logged in");
        res.status(401).send("Incorrect");
    }
    ;
});
app.get("/backup/chat/:chatId", Auth_1.default, (req, res, next) => {
    const authorizedRequest = req;
    (0, routescb_1.backupChatCallback)(authorizedRequest, res, next);
});
app.all("*", (req, res) => {
    req.session;
    console.log("origin:", req.headers.origin);
    console.log("url", req.url);
    res.sendStatus(404);
});
const httpServer = http.createServer({}, app);
const socketIOServer = new socket_io_1.Server(httpServer, {
    "cors": {
        "origin": ["http://localhost:3000"],
        "methods": ["GET", "POST"],
        "credentials": true
    },
});
socketIOServer.engine.use(customSession);
socketIOServer.engine.use(passport_1.default.session());
// socketIOServer.engine.use(cors({ "origin": ["http://localhost:3000"], "credentials": true }));
socketIOServer.on("connection", (userSocket) => {
    const userSession = userSocket.request;
    console.log("SOCKET CONNECTION ----->");
    console.log("user:", userSession.user);
    console.log("session:", userSession.session);
    if (!userSession.user) {
        console.log("socket ---> user is NOT authenticated - user object does NOT exist");
        return;
    }
    ;
    if (userSession.isAuthenticated()) {
        console.log("socket ---> user is authenticated");
        UserConnection_1.default.listen(userSession.user.id, userSocket).then((e) => {
            console.log("socket is listening to events");
        }).catch((err) => {
            console.log("UserConnection failed connecting!");
            console.log("Error message:", err);
        });
    }
    else {
        console.log("socket ---> user is NOT authenticated");
    }
    ;
});
Config_1.default.isOnline().then((success) => {
    console.log(`successfully connected to ${success.dbName}`);
    httpServer.listen(appPort, () => {
        console.log(`server is listening at http://${appIP}:${appPort}`);
    });
    // socketIOServer.listen(httpServer);
}).catch((err) => {
    console.log("connection to database failed - ", err);
});
