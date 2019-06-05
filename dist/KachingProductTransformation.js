"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class KachingProductTransformation {
    // We do not (yet) support deletion through the native Ka-ching format 
    isDeletionRequest(request) {
        if (request.method === "DELETE") {
            return true;
        }
        return false;
    }
    productIdsForDeletion(request) {
        const ids = request.query.ids;
        if (typeof ids === "string" && ids.length > 0) {
            const idArray = ids.split(",");
            return idArray;
        }
        const id = request.query.id;
        if (typeof id === "string" && id.length > 0) {
            return [id];
        }
        return [];
    }
    async transformRepoProduct(input, defaultChannels, defaultMarkets, callback) {
        if (input.product) {
            await callback(input);
        }
        else if (input.products) {
            for (const key in input.products) {
                const product = input.products[key];
                const obj = { product: product };
                if (input.metadata) {
                    obj["metadata"] = input.metadata;
                }
                else if (defaultChannels.length > 0 || defaultMarkets.length > 0) {
                    const channels = {};
                    const markets = {};
                    for (const channel of defaultChannels) {
                        channels[channel] = true;
                    }
                    for (const market of defaultMarkets) {
                        markets[market] = true;
                    }
                    obj["metadata"] = { channels: channels, markets: markets };
                }
                if (input.shops) {
                    obj["shops"] = input.shops;
                }
                await callback(obj);
            }
        }
        else {
            throw new Error("Bad request - missing product or products key in body.");
        }
    }
}
exports.KachingProductTransformation = KachingProductTransformation;
