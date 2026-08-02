import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IBabysitterProfile } from "./sitter.interface";
import { BabysitterProfile } from "./sitter.model";
import { sitterSearchableFields } from "./sitter.constant";
import { QueryBuilder } from "../../utils/QueryBuiler";
import { NotificationServices } from "../notification/notification.services";
import { NotificationType } from "../notification/notification.interface";

const createSitterProfile = async (payload: IBabysitterProfile) => {
  const result = await BabysitterProfile.create(payload);
  return result;
};

const getSitterProfileByUserId = async (userId: string) => {
  const result = await BabysitterProfile.findOne({ user: userId }).populate("user");
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Babysitter profile not found for this user");
  }
  return result;
};

const getAllSitterProfiles = async (query: Record<string, any>) => {
  const sitterQuery = new QueryBuilder(BabysitterProfile.find().populate("user"), query as Record<string, string>)
    .search(sitterSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await sitterQuery.build();
  const meta = await sitterQuery.getMeta();

  return {
    data,
    meta,
  };
};

const updateSitterProfile = async (userId: string, payload: Partial<IBabysitterProfile>) => {
  const profile = await BabysitterProfile.findOne({ user: userId });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Babysitter profile not found");
  }

  const result = await BabysitterProfile.findOneAndUpdate(
    { user: userId },
    payload,
    { new: true, runValidators: true }
  ).populate("user");

  return result;
};

const deleteSitterProfile = async (userId: string) => {
  const profile = await BabysitterProfile.findOne({ user: userId });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Babysitter profile not found");
  }

  const result = await BabysitterProfile.findOneAndDelete({ user: userId });
  return result;
};

const verifySitterProfile = async (
  userId: string,
  adminId: string,
  status: "VERIFIED" | "REJECTED"
) => {
  const profile = await BabysitterProfile.findOne({ user: userId });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Babysitter profile not found");
  }

  const result = await BabysitterProfile.findOneAndUpdate(
    { user: userId },
    {
      verificationStatus: status,
      verifiedBy: adminId,
      verifiedAt: new Date(),
    },
    { new: true, runValidators: true }
  ).populate("user");

  // Send system notification to the babysitter
  await NotificationServices.createNotification({
    recipient: userId,
    title: "Profile Verification Update",
    message: status === "VERIFIED"
      ? "Congratulations! Your profile has been verified successfully by the administration."
      : "Your profile verification request has been rejected by the administration.",
    type: NotificationType.SYSTEM,
  });

  return result;
};

export const SitterServices = {
  createSitterProfile,
  getSitterProfileByUserId,
  getAllSitterProfiles,
  updateSitterProfile,
  deleteSitterProfile,
  verifySitterProfile,
};
