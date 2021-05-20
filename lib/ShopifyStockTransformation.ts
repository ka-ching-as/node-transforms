// tslint:disable-next-line:no-import-side-effect
import "cross-fetch/polyfill"
import * as _ from "lodash"
import * as path from "path"
import ApolloClient, { gql } from "apollo-boost"
import { StockQueueEntry, StockTransformation } from "./StockTransformation"

interface InventoryLevelUpdate {
    available: number
    inventory_item_id: number
    location_id: number
}

export class ShopifyStockTransformation implements StockTransformation {
    async transformToStockImportData(input: any, configuration: any, callback: (stockQueueElement?: StockQueueEntry) => Promise<void>): Promise<void> {
        console.info(`Transforming Shopify inventory level update: ${JSON.stringify(input)}`)

        if (!this.validateInput(input)) {
            console.error(`Shopify stock input not valid: ${JSON.stringify(input)}`)
            await callback(undefined)
            return
        }

        const inventoryLevelUpdate = input as InventoryLevelUpdate

        const stockLocationId = configuration.stock_location_map[`${inventoryLevelUpdate.location_id}`]
        if (!stockLocationId) {
            console.error(`Unknown location id: ${inventoryLevelUpdate.location_id}`)
            await callback(undefined)
            return
        }

        const shopifyId = configuration.shopify_id
        if (!shopifyId || typeof shopifyId !== "string") {
            console.error(`Missing or invalid shopify id on configuration ${JSON.stringify(configuration)}`)
            await callback(undefined)
            return
        }

        const accessToken = configuration.shopify_access_token
        if (!accessToken || typeof accessToken !== "string") {
            console.error(`Missing or invalid shopify access token on configuration ${JSON.stringify(configuration)}`)
            await callback(undefined)
            return
        }

        const client = new ApolloClient({
            uri: `https://${shopifyId}.myshopify.com/admin/api/2021-04/graphql.json`,
            request: async operation => {
                operation.setContext({
                    headers: {
                        "X-Shopify-Access-Token": accessToken,
                    }
                })
              }
        })

        const query = gql`{
            inventoryItem(id: "gid://shopify/InventoryItem/${inventoryLevelUpdate.inventory_item_id}") {
              variant {
                id,
                product {
                  id,
                  totalVariants
                }
              }
            }
          }`

        try {
            const result = await client.query({
                query: query
            })
            if (!this.validateQueryResultData(result.data)) {
                console.error(`Invalid result data from GraphQL query: ${JSON.stringify(query)}, result: ${JSON.stringify(result)}`)
                await callback(undefined)
                return
            }

            const queueElement = this.stockQueueElement(inventoryLevelUpdate, result.data, stockLocationId)
            console.info(`Resulting stock queue element: ${JSON.stringify(queueElement)}`)

            callback(queueElement)
        } catch (error) {
            console.log(error)
            callback(undefined)
            return
        }
    }

    /* Example structure
    {
    "inventory_item_id": 17864432713779,
    "location_id": 15312158771,
    "available": 0,
    "updated_at": "2019-04-11T13:12:26-04:00",
    "admin_graphql_api_id": "gid://shopify/InventoryLevel/14943944755?inventory_item_id=17864432713779"
    } */
    validateInput(input: any): boolean {
        if (_.isNil(input) || !_.isObject(input)) {
            return false
        }
        const inventoryIdValid = (input as any).inventory_item_id && typeof((input as any).inventory_item_id) === "number"
        const locationIdValid = (input as any).location_id && typeof((input as any).location_id) === "number"
        const availableValid = (input as any).available !== undefined && typeof((input as any).available) === "number"
        return inventoryIdValid && locationIdValid && availableValid
    }

    /* Example structure
    {
        "inventoryItem": {
            "variant": {
                "id": "gid://shopify/ProductVariant/17280150601779",
                "product": {
                    "id": "gid://shopify/Product/1863678132275",
                    "totalVariants": 1,
                    "__typename": "Product"
                },
                "__typename": "ProductVariant"
            },
            "__typename": "InventoryItem"
        }
    } */
    validateQueryResultData(data: any): boolean {
        if (_.isNil(data) || !_.isObject(data)) {
            return false
        }
        const inventoryItemExist = (data as any).inventoryItem && typeof((data as any).inventoryItem) === "object"
        const variantExist = (data as any).inventoryItem.variant && typeof((data as any).inventoryItem.variant) === "object"
        const productExist = (data as any).inventoryItem.variant.product && typeof((data as any).inventoryItem.variant.product) === "object"
        const totalVariantsIsValid = (data as any).inventoryItem.variant.product.totalVariants && typeof((data as any).inventoryItem.variant.product.totalVariants) === "number"
        return inventoryItemExist && variantExist && productExist && totalVariantsIsValid
    }

    stockQueueElement(inventoryLevelUpdate: InventoryLevelUpdate, resultData: any, stockLocationId: string): StockQueueEntry {
        const result: StockQueueEntry = {} as StockQueueEntry
        result.count = inventoryLevelUpdate.available
        result.location_id = stockLocationId
        result.product_id = path.basename(resultData.inventoryItem.variant.product.id)
        if (resultData.inventoryItem.variant.product.totalVariants > 1) {
            result.variant_id = path.basename(resultData.inventoryItem.variant.id)
        }
        return result
    }
}