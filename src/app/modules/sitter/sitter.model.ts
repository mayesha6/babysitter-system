import { Schema, model } from "mongoose";
import { EmploymentType, IBabysitterProfile, VerificationStatus } from "./sitter.interface";

const babysitterProfileSchema = new Schema<IBabysitterProfile>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    profileImage: { type: String, default: "" },
    dateOfBirth: { type: Date },
    gender: { type: String, default: "" },
    address: { type: String, default: "" },
    about: { type: String, default: "" },
    experienceYears: { type: Number, default: 0 },
    skills: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    hourlyRate: { type: Number, default: 0 },
    dailyRate: { type: Number, default: 0 },
    monthlyRate: { type: Number, default: 0 },
    employmentType: {
        type: String,
        enum: Object.values(EmploymentType),
        default: EmploymentType.PART_TIME
    },
    availableDays: { type: [String], default: [] },
    availableStartTime: { type: String, default: "" },
    availableEndTime: { type: String, default: "" },
    nidNumber: { type: String, default: "" },
    nidFrontImage: { type: String, default: "" },
    nidBackImage: { type: String, default: "" },
    selfieImage: { type: String, default: "" },
    policeClearanceImage: { type: String, default: "" },
    firstAidCertificate: { type: String, default: "" },
    experienceCertificate: { type: String, default: "" },
    referenceName: { type: String, default: "" },
    referencePhone: { type: String, default: "" },
    verificationStatus: {
        type: String,
        enum: Object.values(VerificationStatus),
        default: VerificationStatus.PENDING
    },
    verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    verifiedAt: { type: Date }
}, {
    timestamps: true,
    versionKey: false
});

export const BabysitterProfile = model<IBabysitterProfile>("BabysitterProfile", babysitterProfileSchema);
