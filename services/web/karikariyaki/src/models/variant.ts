import { Schema, model } from "mongoose";

// Types
import { Statics } from "@types";

// Models
import { ProductModel } from "@models";

// Services
import { StringService } from "@services";

const validateVariantName = async (name: string) => {
    if (
        StringService.isStringInsideBoundaries(
            name,
            Statics.VARIANT_NAME_MIN_LENGTH,
            Statics.VARIANT_NAME_MAX_LENGTH
        ) === false
    ) {
        if (name.trim().length < Statics.VARIANT_NAME_MIN_LENGTH) {
            throw Error(
                `Variant name is shorter than ${Statics.VARIANT_NAME_MIN_LENGTH} characters`
            );
        }

        throw Error(
            `Variant name is longer than ${Statics.VARIANT_NAME_MAX_LENGTH} characters`
        );
    }
};

const validateVariantProduct = async (productId: Schema.Types.ObjectId) => {
    const foundProduct = await ProductModel.findById(productId);

    if (!foundProduct) {
        throw Error("Product ID is invalid");
    }
};

const VariantSchema = new Schema({
    name: {
        type: String,
        required: [true, "Variant name is required"],
        validate: validateVariantName,
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: Statics.PRODUCT_COLLECTION_NAME,
        required: [true, "Variant product is required"],
        validate: validateVariantProduct,
    },
});

const VariantModel = model(Statics.VARIANT_COLLECTION_NAME, VariantSchema);

export default VariantModel;