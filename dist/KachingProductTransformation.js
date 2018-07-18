"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var KachingProductTransformation = /** @class */ (function () {
    function KachingProductTransformation() {
    }
    KachingProductTransformation.prototype.isDeletionRequest = function (headers, body) {
        return false;
    };
    /**
     * @Method: Outputs and returns 'Hello, World!'.
     * @Param {}
     * @Return {string}
     */
    KachingProductTransformation.prototype.transformProduct = function (input) {
        return {};
    };
    KachingProductTransformation.prototype.transformRepoProduct = function (input, channels, markets) {
        return {};
    };
    KachingProductTransformation.prototype.productIdForDeletion = function (input) {
        var requiredFields = ["id"];
        for (var _i = 0, requiredFields_1 = requiredFields; _i < requiredFields_1.length; _i++) {
            var field = requiredFields_1[_i];
            if (!input[field]) {
                throw new Error("Missing field '" + field + "'");
            }
        }
        return input.id;
    };
    return KachingProductTransformation;
}());
exports.KachingProductTransformation = KachingProductTransformation;
