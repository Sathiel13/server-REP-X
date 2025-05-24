import mongoose,{Document} from "mongoose";

 export interface ICoupon extends Document {
    code: string;
    discountType: string;
    value: number;
    maxUses: number;
    usedCount: number;
    validFrom: Date;
    validUntil: Date;
}

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['porcentaje', 'fija'], // % o cantidad fija
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    maxUses: {
        type: Number,
        default: 1
    },
    usedCount: {
        type: Number,
        default: 0
    },
    validFrom: {
        type: Date,
        required: true
    },
    validUntil: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true });

const coupon = mongoose.model<ICoupon>("Coupon", couponSchema);
export default coupon;