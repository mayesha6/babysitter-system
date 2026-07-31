import { Schema, model } from "mongoose";
import { BabysittingType, IParentProfile } from "./parent.interface";

const parentProfileSchema = new Schema<IParentProfile>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    profileImage: { type: String, default: "" },
    address: { type: String, default: "" },
    childName: { type: String, default: "" },
    childAge: { type: Schema.Types.Mixed, default: "" },
    childGender: { type: String, default: "" },
    specialNeeds: { type: String, default: "" },
    preferredBabysitterGender: { type: String, default: "" },
    preferredExperience: { type: String, default: "" },
    preferredLanguage: { type: String, default: "" },
    babysittingType: {
        type: String,
        enum: Object.values(BabysittingType),
        default: BabysittingType.PART_TIME
    },
    expectedHourlyBudget: { type: Number, default: 0 },
    expectedDailyBudget: { type: Number, default: 0 },
    expectedMonthlyBudget: { type: Number, default: 0 },
    startDate: { type: Date },
    additionalRequirements: { type: String, default: "" }
}, {
    timestamps: true,
    versionKey: false
});

export const ParentProfile = model<IParentProfile>("ParentProfile", parentProfileSchema);
