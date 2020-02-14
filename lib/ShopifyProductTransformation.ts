import * as htmlToText from "html-to-text"
import * as express from "express"

import { ProductTransformation } from "./ProductTransformation"

export class ShopifyProductTransformation implements ProductTransformation {

    isDeletionRequest(request: express.Request): boolean {
        const topic = request.headers["x-shopify-topic"]
        if (topic === "products/delete") {
            return true
        } else {
            return false
        }
    }

    productIdsForDeletion(request: express.Request): string[] {
        const requiredFields = ["id"]
        const input = request.body

        for (const field of requiredFields) {
            if (!input[field]) {
                throw new Error(`Missing field '${field}'`)
            }
        }
        return [input.id]
    }

    transformProduct(input: any): any {
        const requiredFields = ["id", "title"]

        for (const field of requiredFields) {
            if (!input[field]) {
                throw new Error(`Missing field '${field}'`)
            }
        }

        const product: any = {}
        product.id = `${input.id}`
        product.name = input.title

        if (input.image && input.image.src) {
            product.image_url = input.image.src
        }

        if (input.body_html) {
            product.description = htmlToText.fromString(input.body_html)
        }

        if (input.tags && typeof input.tags === "string") {
            const resultTags: any = {}
            const tags: string[] = input.tags.split(",")
            for (const tag of tags) {
                const trimmed = tag
                    .trim()
                    .toLowerCase()
                    .replace(/ø/g, "oe")
                    .replace(/æ/g, "ae")
                    .replace(/å/g, "aa")
                    .replace(/\W/g, "_") || ""
                resultTags[trimmed] = true                
            }
            if (Object.keys(resultTags).length > 0) {
                product.tags = resultTags
            }
        }

        const isSimpleProduct = this.isSimpleProduct(input)

        if (isSimpleProduct) {
            this.transformAsSimpleProduct(input, product)
        } else {
            this.transformAsVariantProduct(input, product)
        }

        return product
    }

    transformAsSimpleProduct(input: any, product: any) {
        const variants = (input.variants && Array.isArray(input.variants)) ? input.variants : []
        if (variants.length > 0) {
            const firstVariant = variants[0]
            product.barcode = firstVariant.barcode
            if (firstVariant.price === undefined || firstVariant.price === null) {
                throw new Error(`Missing field 'price'`)
            } else {
                const price = Number(firstVariant.price)
                let compareAt: number | undefined
                if (firstVariant.compare_at_price !== undefined && firstVariant.compare_at_price !== null) {
                    compareAt = Number(firstVariant.compare_at_price)
                }

                if (compareAt !== undefined) {
                    product.retail_price = compareAt
                    product.sale_price = price
                } else {
                    product.retail_price = price
                }
            }
        } else {
            throw new Error(`Missing variant entries in field 'variants'`)
        }
    }

    transformAsVariantProduct(input: any, product: any) {
        const variants = (input.variants && Array.isArray(input.variants)) ? input.variants : []
        const options = (input.options && Array.isArray(input.options)) ? input.options : []

        const resultDimensions: any[] = []

        const dimensionValueLookup: any = {}
        const dimensionLookup: any = {}

        const variantImages: any = {}
        const images = (input.images && Array.isArray(input.images)) ? input.images : []
        for (const image of images) {
            const url = image.src
            for (const variantId of image.variant_ids) {
                const idString = `${variantId}`
                // Let the first image win
                if (variantImages[idString] === undefined) {
                    variantImages[idString] = url
                }
            }
        }

        let dimensionCount = 1
        for (const option of options) {
            const dimension: any = {}
            dimension.id = `${option.id}`
            dimension.name = option.name

            const dimensionValues: any[] = []
            const valueLookup: any = {}

            let valueCount = 1
            for (const value of option.values) {
                const dimensionValue: any = {}

                dimensionValue.id = `${valueCount}`
                dimensionValue.name = value

                dimensionValues.push(dimensionValue)
                valueLookup[value] = dimensionValue.id
                valueCount++
            }
            const optionKey = `option${dimensionCount}`
            dimensionValueLookup[optionKey] = valueLookup
            dimensionLookup[optionKey] = dimension.id
            dimension.values = dimensionValues
            resultDimensions.push(dimension)
            dimensionCount++
        }

        if (resultDimensions.length > 0) {
            product.dimensions = resultDimensions
        }

        const resultVariants: any[] = []
        for (const variantInput of variants) {
            const variant: any = {}
            const requiredFields = ["id", "price"]

            for (const field of requiredFields) {
                if (!variantInput[field]) {
                    throw new Error(`Missing field '${field}'`)
                }
            }
            variant.id = `${variantInput.id}`

            variant.barcode = variantInput.barcode

            const price = Number(variantInput.price)
            let compareAt: number | undefined
            if (variantInput.compare_at_price !== undefined && variantInput.compare_at_price !== null) {
                compareAt = Number(variantInput.compare_at_price)
            }

            if (compareAt !== undefined) {
                variant.retail_price = compareAt
                variant.sale_price = price
            } else {
                variant.retail_price = price
            }

            // It appears that variant titles are always composed
            // of their 'option' values. This is also the default
            // when leaving the name blank in Ka-ching and using options
            // So we leave it blank if there are options
            if (variantInput.option1 === null || variantInput.option1 === undefined) {
                if (variantInput.title) {
                    variant.name = variantInput.title
                }
            }

            const dimensionValues: any = {}

            for (const optionKey of ["option1", "option2", "option3"]) {
                if (variantInput[optionKey] !== null && variantInput[optionKey] !== undefined) {
                    const valueLookup = dimensionValueLookup[optionKey]
                    if (!valueLookup) { continue }
                    const valueId = valueLookup[variantInput[optionKey]]
                    if (valueId === null ||  valueId === undefined) {
                        continue
                    }
                    const dimensionId = dimensionLookup[optionKey]
                    if (dimensionId === null || dimensionId === undefined) {
                        continue
                    }
                    dimensionValues[dimensionId] = valueId
                }
            }
            if (Object.keys(dimensionValues).length > 0) {
                variant.dimension_values = dimensionValues
            }

            if (variantImages[variant.id]) {
                variant.image_url = variantImages[variant.id]
            }

            resultVariants.push(variant)
        }
        product.variants = resultVariants
    }

    // We define the product to be a simple product (without variants) if there are at most one
    // variant or option or option value.
    isSimpleProduct(input: any): boolean {
        const variants = (input.variants && Array.isArray(input.variants)) ? input.variants : []

        if (variants.length > 1) {
            return false
        }
        const options = (input.options && Array.isArray(input.options)) ? input.options : []
        if (options.length > 1) {
            return false
        }
        if (options.length === 1) {
            const first = options[0]
            const values = (first && Array.isArray(first)) ? first : []
            if (values.length > 1) {
                return false
            }
        }
        return true
    }

    async transformRepoProduct(input: any, defaultChannels: string[], defaultMarkets: string[], callback: (product: any) => Promise<void>) {
        const product = this.transformProduct(input)
        const metadata = { markets: {} as any, channels: {} as any }
        for (const channel of defaultChannels) {
            metadata.channels[channel] = true
        }
        for (const market of defaultMarkets) {
            metadata.markets[market] = true
        }

        const obj = { product: product, metadata: metadata }
        await callback(obj)
    }
}
