"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.deserializeUser = exports.serializeUser = void 0;
const User_1 = __importDefault(require("./DAO/Entity/User/User"));
const serializeUser = (user, done) => {
    // console.log(`serialize user... user-id: ${user.id}`);
    done(null, user.id);
};
exports.serializeUser = serializeUser;
const deserializeUser = (userId, done) => {
    // console.log(`deserializing... user-id: ${userId}`);
    User_1.default.findById(userId).then((success) => {
        if (!success) {
            console.log("success but not deserialized");
            return;
        }
        ;
        console.log("deserialized");
        done(null, success);
    }).catch((err) => {
        console.log("serialize process failed");
    });
};
exports.deserializeUser = deserializeUser;
// export const signup: VerifyFunctionWithRequest = async (req, username, _, done) => {
//     const errorOrigin = "Error from passport signup strategy";
//     let userFound: {
//         username: boolean;
//         email: boolean;
//     } | null;
//     const userExists = await RegistrationFactory.findByUsernameAndEmail(username, req.body.email).catch((err) => {
//         done(err, false);
//     });
//     if (userExists === undefined) {
//         return;
//     };
//     const registrationPending = await RegistrationFactory.findByUsernameAndEmail(username, req.body.email).catch((err) => {
//         done(err, false);
//     });
//     if (registrationPending === undefined) {
//         return;
//     };
//     userFound = userExists ? userExists : registrationPending ? registrationPending : null;
//     if (userFound) {
//         if (userFound.username || userFound.email) {
//             const fieldUsed = userFound.username ? "username" : userFound.email ? "email" : "";
//             return done(`${errorOrigin} - ${fieldUsed} is already in use`, false);
//         } else if (userFound.username && userFound.email) {
//             return done(`${errorOrigin} - username and email are already in use`, false);
//         };
//     };
//     const signupUser = await RegistrationFactory.postOne(req.body).catch((err) => {
//         done(err, false);
//     });
//     if (!signupUser) {
//         return;
//     };
//     done(null, signupUser);
// };
const login = async (req, username, password, done) => {
    const errorOrigin = "Error from passport login strategy";
    const loginUser = await User_1.default.findByUsername(username).catch((err) => {
        done(err, false);
    });
    if (loginUser === undefined) {
        return;
    }
    ;
    if (loginUser === null) {
        // return done(`${errorOrigin} - there is not a user with the current username`, false);
        return done(null, false);
    }
    ;
    //password validation
    if (loginUser.password !== password) {
        // return done(`${errorOrigin} - the password is incorrect`, false, {"message": "Incorrect password"});
        return done(null, false);
    }
    else {
        console.log("login-user:", loginUser);
        console.log("password:", loginUser.password, "-", password);
        req.session.userId = loginUser.id;
        return done(null, loginUser);
    }
    ;
};
exports.login = login;
