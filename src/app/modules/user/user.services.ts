import httpStatus from "http-status-codes";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IUser, Role, Status } from "./user.interface";
import { User } from "./user.model";
import { userSearchableFields } from "./user.constant";
import { QueryBuilder } from "../../utils/QueryBuiler";
import bcryptjs from 'bcryptjs';
import { generateOtp } from "../otp/otp.service";
import { sendEmail } from "../../utils/sendEmail";
import { redisClient } from "../../config/redis.config";
import mongoose from "mongoose";
import { ParentProfile } from "../parent/parent.model";
import { BabysitterProfile } from "../sitter/sitter.model";

const createUser = async (payload: any) => {
  const session = await mongoose.startSession();
  let user: any;

  try {
    session.startTransaction();

    const { 
      name, 
      email, 
      phone, 
      password, 
      confirmPassword, 
      role,
      
      // parent fields
      profileImage,
      address,
      childName,
      childAge,
      childGender,
      specialNeeds,
      preferredBabysitterGender,
      preferredExperience,
      preferredLanguage,
      babysittingType,
      expectedHourlyBudget,
      expectedDailyBudget,
      expectedMonthlyBudget,
      startDate,
      additionalRequirements,

      // babysitter fields
      dateOfBirth,
      gender,
      about,
      experienceYears,
      skills,
      languages,
      hourlyRate,
      dailyRate,
      monthlyRate,
      employmentType,
      availableDays,
      availableStartTime,
      availableEndTime,
      nidNumber,
      nidFrontImage,
      nidBackImage,
      selfieImage,
      policeClearanceImage,
      firstAidCertificate,
      experienceCertificate,
      referenceName,
      referencePhone
    } = payload;

    if (!email || !password || !name || !phone || !role) {
      throw new AppError(httpStatus.BAD_REQUEST, "Required registration fields are missing");
    }

    if (password !== confirmPassword) {
      throw new AppError(httpStatus.BAD_REQUEST, "Passwords do not match");
    }

    const isUserExist = await User.findOne({ email }).session(session);
    if (isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
    }

    const hashedPassword = await bcryptjs.hash(
      password as string,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    const userArray = await User.create([
      {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        status: Status.PENDING,
        isEmailVerified: false,
        profileCompleted: true,
        isDeleted: false,
      }
    ], { session });

    user = userArray[0];

    if (role === Role.PARENT) {
      await ParentProfile.create([
        {
          user: user._id,
          profileImage,
          address,
          childName,
          childAge,
          childGender,
          specialNeeds,
          preferredBabysitterGender,
          preferredExperience,
          preferredLanguage,
          babysittingType,
          expectedHourlyBudget,
          expectedDailyBudget,
          expectedMonthlyBudget,
          startDate,
          additionalRequirements,
        }
      ], { session });
    } else if (role === Role.BABYSITTER) {
      await BabysitterProfile.create([
        {
          user: user._id,
          profileImage,
          dateOfBirth,
          gender,
          address,
          about,
          experienceYears,
          skills,
          languages,
          hourlyRate,
          dailyRate,
          monthlyRate,
          employmentType,
          availableDays,
          availableStartTime,
          availableEndTime,
          nidNumber,
          nidFrontImage,
          nidBackImage,
          selfieImage,
          policeClearanceImage,
          firstAidCertificate,
          experienceCertificate,
          referenceName,
          referencePhone,
          verificationStatus: "PENDING",
        }
      ], { session });
    } else {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid role provided");
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  // ==========================================
  // 📧 EMAILS & OTP (OUTSIDE TRANSACTION)
  // ==========================================
  const redisKey = `otp:${user.email}`;
  const otp = generateOtp();

  await redisClient.set(redisKey, otp, {
    expiration: { type: "EX", value: 120 },
  });

  await sendEmail({
    to: user.email,
    subject: "Account Verification OTP",
    templateName: "otp",
    templateData: {
      name: user.name,
      otp,
    },
  });

  return user;
};

const getAllUsers = async (query: Record<string, any>) => {
  const userQuery = new QueryBuilder(User.find({ isDeleted: false }), query as Record<string, string>)
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate();

  const data = await userQuery.build();
  const meta = await userQuery.getMeta();

  return { data, meta };
};

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  return { data: user };
};

const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  return { data: user };
};

const updateUser = async (userId: string, payload: Partial<IUser>) => {
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    payload,
    { new: true, runValidators: true }
  );

  return updatedUser;
};

const updateMyProfile = async ({
  userId,
  payload,
  oldPassword,
  newPassword,
  confirmPassword,
}: any) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  const allowedFields = ["name", "phone"];
  const filteredPayload: any = {};

  Object.keys(payload).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredPayload[key] = payload[key];
    }
  });

  if (oldPassword || newPassword || confirmPassword) {
    if (!oldPassword || !newPassword || !confirmPassword) {
      throw new AppError(400, "All password fields are required");
    }

    if (newPassword.length < 8) {
      throw new AppError(400, "New password must be at least 8 characters long");
    }

    if (newPassword !== confirmPassword) {
      throw new AppError(400, "Passwords do not match");
    }

    const isOldPasswordMatch = await bcryptjs.compare(
      oldPassword,
      user.password as string
    );

    if (!isOldPasswordMatch) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Old password is incorrect");
    }

    filteredPayload.password = await bcryptjs.hash(
      newPassword,
      Number(envVars.BCRYPT_SALT_ROUND || 10)
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    filteredPayload,
    {
      new: true,
      runValidators: true,
    }
  );

  return updatedUser;
};

const deleteOwnAccount = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  await User.findByIdAndUpdate(userId, { isDeleted: true });
  return { message: "Your account has been deleted successfully" };
};

const deleteUserById = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  await User.findByIdAndUpdate(id, { isDeleted: true });
  return user;
};

const deleteAllUsers = async () => {
  const result = await User.deleteMany({});
  return result;
};

export const UserServices = {
  createUser,
  getAllUsers,
  getMe,
  getSingleUser,
  updateUser,
  updateMyProfile,
  deleteOwnAccount,
  deleteUserById,
  deleteAllUsers
};
