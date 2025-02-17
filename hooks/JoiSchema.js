"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileJoiSchema = exports.messageRequestJoiSchema = exports.recoveryJoiSchema = exports.registrationJoiSchema = exports.groupJoiSchema = exports.userSendsMessageJoiSchema = exports.userReceivesMessageJoiSchema = exports.userJoinsGroupSchema = exports.userContactsUserJoiSchema = exports.messageJoiSchema = exports.userJoiSchema = exports.userConfigJoiSchema = exports.usernameCustomJoi = exports.dateJoiSchema = exports.idJoiSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.idJoiSchema = joi_1.default.string();
exports.dateJoiSchema = joi_1.default.date();
const replyTypeJoiSchema = joi_1.default.string().valid("send", "receive");
const replyIdJoiSchema = exports.idJoiSchema.when(joi_1.default.ref("replyType"), {
    "then": joi_1.default.required()
});
const chatConfigurationSwitchValue = joi_1.default.boolean();
exports.usernameCustomJoi = joi_1.default.extend((joi) => {
    return {
        "type": "username",
        "base": joi.string().trim(),
        "messages": {
            "username.whitespace": "{{#label}} must not have more than one whitespace together"
        },
        "validate": (value, helpers) => {
            if (/\s{2,}/.test(value)) {
                return helpers.error("username.whitespace");
            }
            ;
            return value;
        }
    };
});
exports.userConfigJoiSchema = joi_1.default.object({
    "online": joi_1.default.string().valid("everyone", "lastOnline").alter({
        "post": (schema) => schema.default("lastOnline"),
        "patch": (schema) => schema.optional()
    }),
    "writing": chatConfigurationSwitchValue.alter({
        "post": (schema) => schema.default(true),
        "patch": (schema) => schema.optional()
    }),
    "lastOnline": joi_1.default.string().valid("everyone", "contact", "none").alter({
        "post": (schema) => schema.default("everyone"),
        "patch": (schema) => schema.optional()
    }),
    "read": chatConfigurationSwitchValue.alter({
        "post": (schema) => schema.default(true),
        "patch": (schema) => schema.optional()
    }),
    "approve": joi_1.default.string().valid("contact", "group", "both", "none").alter({
        "post": (schema) => schema.default("none"),
        "patch": (schema) => schema.optional()
    }),
    "notify": chatConfigurationSwitchValue.alter({
        "post": (schema) => schema.default(true),
        "patch": (schema) => schema.optional()
    }),
    "push": chatConfigurationSwitchValue.alter({
        "post": (schema) => schema.default(false),
        "patch": (schema) => schema.optional()
    }),
    "email": chatConfigurationSwitchValue.alter({
        "post": (schema) => schema.default(true),
        "patch": (schema) => schema.optional()
    })
});
exports.userJoiSchema = joi_1.default.object({
    "email": joi_1.default.string().email().alter({
        "signup": (schema) => schema.required(),
        "login": (schema) => schema.optional()
    }),
    // "username": (usernameCustomJoi.username() as Joi.StringSchema<string>).when(Joi.ref("email"), { "then": Joi.required() }),
    "name": joi_1.default.string().alter({
        "signup": (schema) => schema.required(),
        "login": (schema) => schema.optional()
    }),
    "username": joi_1.default.string().alter({
        "signup": (schema) => schema.required(),
        "login": (schema) => schema.required()
    }),
    "password": joi_1.default.string().regex(/^(?=(?:.*[0-9]){5})(?=(?:.*[a-z]){2})(?=(?:.*[A-Z]){1})(?=(?:.*[_.*\-]){1})[0-9a-zA-Z_.*\-]{9,}$/).alter({
        "signup": (schema) => schema.required(),
        "login": (schema) => schema.required()
    })
});
// "password": Joi.string().regex(/^(?=(?:.*[a-z]){2})(?!.*[a-z]{4})(?=(?:.*[A-Z]){2})(?!.*[A-Z]{3})(?=(?:.*[0-9]){3})(?!.*[0-9]{4})(?=(?:.*[_.*\-]){1})(?!.*[_.*\-]{2})[a-zA-Z0-9_.*\-]{8,}$/).alter({
//     "signup": (schema) => schema.required(),
//     "login": (schema) => schema.required()
// })
exports.messageJoiSchema = joi_1.default.object({
    "body": joi_1.default.string().trim().min(1).when(joi_1.default.ref("fileId"), { "then": joi_1.default.optional(), "otherwise": joi_1.default.required() }),
    "fileId": joi_1.default.string()
});
// userId
// contactId
// name
// notify
// read
// verified
// blocked
exports.userContactsUserJoiSchema = joi_1.default.object({
    "userId": exports.idJoiSchema.alter({
        "post": (schema) => schema.required()
    }),
    "contactId": exports.idJoiSchema.alter({
        "post": (schema) => schema.required()
    }),
    "name": joi_1.default.string(),
    "notify": chatConfigurationSwitchValue.default(true),
    "read": chatConfigurationSwitchValue.default(true),
    "verified": chatConfigurationSwitchValue.default(true),
    "blocked": chatConfigurationSwitchValue.default(false)
});
exports.userJoinsGroupSchema = joi_1.default.object({
    "userId": exports.idJoiSchema.alter({
        "post": (schema) => schema.required()
    }),
    "groupId": exports.idJoiSchema.alter({
        "post": (schema) => schema.required()
    }),
    "notify": chatConfigurationSwitchValue.default(true),
    "read": chatConfigurationSwitchValue.default(true),
    "blocked": chatConfigurationSwitchValue.default(false),
    "admin": chatConfigurationSwitchValue.default(false)
});
exports.userReceivesMessageJoiSchema = joi_1.default.object({
    "userId": exports.idJoiSchema.alter({
        "post": (schema) => schema.required()
    }),
    // "messageId": idJoiSchema.alter({
    //     "post": (schema) => schema.required()
    // }),
    // "senderId": Joi.string().alter({
    //     "post": (schema) => schema.required()
    // }),
    "sendId": joi_1.default.string().alter({
        "post": (schema) => schema.required()
    }),
    "chatType": joi_1.default.string().valid("contact", "group").alter({
        "post": (schema) => schema.required()
    }),
    "chatId": joi_1.default.string().alter({
        "post": (schema) => schema.required()
    }),
    "replyType": replyTypeJoiSchema,
    "replyId": replyIdJoiSchema
});
exports.userSendsMessageJoiSchema = joi_1.default.object({
    "userId": exports.idJoiSchema.alter({
        "post": (schema) => schema.required()
    }),
    "messageId": exports.idJoiSchema.alter({
        "post": (schema) => schema.required()
    }),
    "date": joi_1.default.string().alter({
        "post": (schema) => schema.required()
    }),
    "chatType": joi_1.default.string().valid("contact", "group").alter({
        "post": (schema) => schema.required()
    }),
    "chatId": joi_1.default.string().alter({
        "post": (schema) => schema.required()
    }),
    "replyType": replyTypeJoiSchema,
    "replyId": replyIdJoiSchema
});
exports.groupJoiSchema = joi_1.default.object({
    "description": joi_1.default.string(),
    "name": joi_1.default.string(),
    "configurable": chatConfigurationSwitchValue.default(true),
    "messages": chatConfigurationSwitchValue.default(true),
    "joinable": chatConfigurationSwitchValue.default(true),
    "approve": chatConfigurationSwitchValue.default(true)
});
exports.registrationJoiSchema = joi_1.default.object({
    "id": joi_1.default.string().optional(),
    "email": joi_1.default.string().email().alter({
        "post": (schema) => schema.required(),
        "confirm": (schema) => schema.required()
    }),
    "code": joi_1.default.number().integer().alter({
        "post": (schema) => schema.optional(),
        "confirm": (schema) => schema.required()
    }),
    "ttl": joi_1.default.date().optional()
});
exports.recoveryJoiSchema = joi_1.default.object({
    "id": joi_1.default.string().alter({
        "post": (schema) => schema.optional()
    }),
    "userEmail": joi_1.default.string().email().alter({
        "post": (schema) => schema.required()
    }),
    "type": joi_1.default.string().valid("email", "username", "password").alter({
        "post": (schema) => schema.required()
    }),
    "ttl": joi_1.default.date().alter({
        "post": (schema) => schema.optional()
    }),
    "code": joi_1.default.number().integer().alter({
        "post": (schema) => schema.optional()
    }),
});
exports.messageRequestJoiSchema = joi_1.default.object({
    "id": exports.idJoiSchema.alter({
        "post": (schema) => schema.optional()
    }),
    "userId": exports.idJoiSchema.alter({
        "post": (schema) => schema.required()
    }),
    "messageId": exports.idJoiSchema.alter({
        "post": (schema) => schema.required()
    }),
    "contactId": exports.idJoiSchema.alter({
        "post": (schema) => schema.required()
    })
});
exports.fileJoiSchema = joi_1.default.object({
    "type": joi_1.default.string().alter({
        "post": (schema) => schema.required()
    }),
    "name": joi_1.default.string().alter({
        "post": (schema) => schema.required()
    }),
    "ext": joi_1.default.string().alter({
        "post": (schema) => schema.required()
    }),
    "size": joi_1.default.number().alter({
        "post": (schema) => schema.required()
    }),
    "content": joi_1.default.binary().alter({
        "post": (schema) => schema.required()
    })
});
