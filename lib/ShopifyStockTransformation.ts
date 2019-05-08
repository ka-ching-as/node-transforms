// tslint:disable-next-line:no-import-side-effect
import "cross-fetch/polyfill"
import * as _ from "lodash"
import * as path from "path"
import ApolloClient, { gql } from "apollo-boost"
import { StockTransformation } from "./StockTransformation"

interface StockQueueEntry {
    product_id: string
    variant_id: string | null
    location_id: string
    count: number
}

interface InventoryLevelUpdate {
    available: number
    inventory_item_id: number
    location_id: number
}

export class ShopifyStockTransformation implements StockTransformation {
    async transformToStockImportData(input: any, configuration: any, callback: (stockData: any) => Promise<void>): Promise<void> {
        console.info(`Transforming Shopify inventory level update: ${JSON.stringify(input)}`)

        if (!this.validateInput(input)) {
            console.error(`Shopify stock input not valid: ${JSON.stringify(input)}`)
            await callback(null)
            return
        }

        const inventoryLevelUpdate = input as InventoryLevelUpdate

        const stockLocationId = configuration.stock_location_map[`${inventoryLevelUpdate.location_id}`]
        if (!stockLocationId) {
            console.error(`Unknown location id: ${inventoryLevelUpdate.location_id}`)
            await callback(null)
            return
        }

        const shopifyId = configuration.shopify_id
        if (!shopifyId || typeof shopifyId !== "string") {
            console.error(`Missing or invalid shopify id on configuration ${JSON.stringify(configuration)}`)
            await callback(null)
            return
        }

        const accessToken = configuration.shopify_access_token
        if (!accessToken || typeof accessToken !== "string") {
            console.error(`Missing or invalid shopify access token on configuration ${JSON.stringify(configuration)}`)
            await callback(null)
            return
        }

        const client = new ApolloClient({
            uri: `https://${shopifyId}.myshopify.com/admin/api/2019-04/graphql.json`,
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
                await callback(null)
                return
            }

            const queueElement = this.stockQueueElement(inventoryLevelUpdate, result.data, stockLocationId)
            console.info(`Resulting stock queue element: ${JSON.stringify(queueElement)}`)

            callback(queueElement)
        } catch (error) {
            console.log(error)
            callback(null)
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
        const inventoryIdValid = input.inventory_item_id && typeof(input.inventory_item_id) === "number"
        const locationIdValid = input.location_id && typeof(input.location_id) === "number"
        const availableValid = input.available !== undefined && typeof(input.available) === "number"
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
        const inventoryItemExist = data.inventoryItem && typeof(data.inventoryItem) === "object"
        const variantExist = data.inventoryItem.variant && typeof(data.inventoryItem.variant) === "object"
        const productExist = data.inventoryItem.variant.product && typeof(data.inventoryItem.variant.product) === "object"
        const totalVariantsIsValid = data.inventoryItem.variant.product.totalVariants && typeof(data.inventoryItem.variant.product.totalVariants) === "number"
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