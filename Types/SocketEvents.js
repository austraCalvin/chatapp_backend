"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
;
;
;
/*

export interface IClientToServerEvents {
NOT YET
"add-friend": (data: IPOSTUserContactsUser, callback: RequestStatusCallback) => void;
"remove-friend": (id: IUserContactsUser["id"], callback: RequestStatusCallback) => void;
"edit-friend": (data: IEDITUserContactsUser, callback: RequestStatusCallback) => void;
"remove-group": (id: IGroup["id"], callback: RequestStatusCallback) => void;
"edit-group": (data: IEDITGroup, callback: RequestStatusCallback) => void;

"quit-group": (id: IUserJoinsGroup["id"], callback: RequestStatusCallback) => void;
"edit-join-group": (data: IEDITUserJoinsGroup, callback: RequestStatusCallback) => void;
}

*/
/*

message pending --- from client
when user reconnected event triggers and
sends message over and over again
message (id || body) and files optional*
(userId, date, chatType, chatId, replyType, replyId)

message sent --- from server
until the message is delivered to the server
the user-sends-message object is posted to the se|rver
it goes back to the client by its id (userId, chatType, chatId, date)
(id, userId, messageId, date, chatType, chatId)

message-to-deliver --- from server
when chatId participants reconnected event triggers and
sends the message to deliver by the user over and over again
(userId, message(id, body), senderId, chat(id, type), fileIds, reply(id, type))

message delivered --- from client
until it's confirmed by the chatId participants
the message was delivered
the user-receives-message object is posted to the server
it's sent to the server
(userId, messageId, senderId, date, chatType, chatId)

message fetch --- from client
when user reconnected event triggers and
sends the file id if exists over and over again
/message/id/file/id

message fetch --- from client
until the user sends the file id and
the server deletes each file deleting
the message object afterwards
since the server will keep the file

message read --- from client
when chatId participants reconnected
sends its last online to the server
(userId, chatType, chatId, date)

message status --- from server
when user reconnected event triggers and
the user-sends-message object is sent by the server
(id, date, chatType, chatId, deliveredDate, readDate)
and the user-receives-messages
id, userId, messageId, senderId, date, chatType, chatId, readDate

message status --- from client
until the user sends the user-sends-message ID
(id)

*/ 
