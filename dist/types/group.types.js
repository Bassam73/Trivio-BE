"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinStatus = exports.GroupStatus = exports.GroupRole = exports.GroupPrivacy = void 0;
var GroupPrivacy;
(function (GroupPrivacy) {
    GroupPrivacy["public"] = "public";
    GroupPrivacy["private"] = "private";
})(GroupPrivacy || (exports.GroupPrivacy = GroupPrivacy = {}));
var GroupRole;
(function (GroupRole) {
    GroupRole["admin"] = "admin";
    GroupRole["moderator"] = "moderator";
    GroupRole["member"] = "member";
})(GroupRole || (exports.GroupRole = GroupRole = {}));
var GroupStatus;
(function (GroupStatus) {
    GroupStatus["active"] = "active";
    GroupStatus["banned"] = "banned";
})(GroupStatus || (exports.GroupStatus = GroupStatus = {}));
var JoinStatus;
(function (JoinStatus) {
    JoinStatus["pending"] = "pending";
    JoinStatus["accepted"] = "accepted";
    JoinStatus["rejected"] = "rejected";
})(JoinStatus || (exports.JoinStatus = JoinStatus = {}));
