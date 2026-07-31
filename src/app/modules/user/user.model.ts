import { model, Schema } from "mongoose";
import { IAuthProvider, IUser, Role, Status } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>({
    provider: { type: String, required: true },
    providerId: { type: String, required: true }
}, {
    versionKey: false,
    _id: false
})

const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String },
    role: {
        type: String,
        enum: Object.values(Role),
        required: true
    },
    status: {
        type: String,
        enum: Object.values(Status),
        default: Status.PENDING,
    },
    isEmailVerified: { type: Boolean, default: false },
    lastLogin: { type: Date },
    profileCompleted: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    refreshToken: { type: String, default: null },
    auths: [authProviderSchema]
}, {
    timestamps: true,
    versionKey: false
})

export const User = model<IUser>("User", userSchema)