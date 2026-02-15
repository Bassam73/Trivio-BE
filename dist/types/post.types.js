"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToxicityFlags = exports.PostType = void 0;
var PostType;
(function (PostType) {
    PostType["public"] = "public";
    PostType["private"] = "private";
})(PostType || (exports.PostType = PostType = {}));
var ToxicityFlags;
(function (ToxicityFlags) {
    ToxicityFlags["safe"] = "safe";
    ToxicityFlags["flagged"] = "flagged";
    ToxicityFlags["blocked"] = "blocked";
})(ToxicityFlags || (exports.ToxicityFlags = ToxicityFlags = {}));
