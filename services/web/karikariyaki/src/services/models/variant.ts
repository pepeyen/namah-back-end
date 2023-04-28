import { PopulateOptions } from "mongoose";

// Models
import { ProductModel, VariantModel } from "@models";

// Services
import { DatabaseService, StringService } from "@services";

interface Params {
    id?: string;
    name?: string;
    product?: string;
}

type EditableParams = Omit<Params, "id">;

export class VariantService {
    public static visibleParameters = ["name", "product"];

    private static _populateOptions = {
        path: "product",
        select: "name",
    } as PopulateOptions;

    public static async queryAll() {
        await DatabaseService.getConnection();

        return VariantModel.find().select(VariantService.visibleParameters);
    }

    public static async query(values: Params) {
        await DatabaseService.getConnection();

        const query = [];

        if (values.id) {
            return VariantModel.findById(StringService.toObjectId(values.id))
                .select(VariantService.visibleParameters)
                .populate(VariantService._populateOptions);
        }

        if (values.name) {
            query.push({
                name: DatabaseService.generateBroadQuery(values.name),
            });
        }

        if (values.product) {
            query.push({ product: StringService.toObjectId(values.product) });
        }

        return VariantModel.find(query.length === 0 ? null : { $or: query })
            .select(VariantService.visibleParameters)
            .populate(VariantService._populateOptions);
    }

    public static async save(values: EditableParams) {
        await DatabaseService.getConnection();

        const newProductVariant = new VariantModel();

        newProductVariant.name = values.name.trim();
        newProductVariant.product = StringService.toObjectId(values.product);

        await ProductModel.findByIdAndUpdate(
            newProductVariant.product,
            {
                $push: {
                    variants: newProductVariant._id,
                },
            },
            { runValidators: true }
        );

        return newProductVariant.save();
    }

    public static async update(id: string, values: EditableParams) {
        await DatabaseService.getConnection();

        return VariantModel.findByIdAndUpdate(
            StringService.toObjectId(id),
            {
                $set: {
                    name: values.name?.trim(),
                },
            },
            { new: true, runValidators: true }
        ).populate(VariantService._populateOptions);
    }

    public static async delete(id: string) {
        await DatabaseService.getConnection();

        const variantObjectId = StringService.toObjectId(id);

        await ProductModel.findOneAndUpdate(
            {
                variants: variantObjectId,
            },
            {
                $pull: {
                    variants: variantObjectId,
                },
            }
        );

        return VariantModel.findByIdAndDelete(variantObjectId);
    }
}