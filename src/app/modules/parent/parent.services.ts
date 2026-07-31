import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IParentProfile } from "./parent.interface";
import { ParentProfile } from "./parent.model";
import { parentSearchableFields } from "./parent.constant";
import { QueryBuilder } from "../../utils/QueryBuiler";

const createParentProfile = async (payload: IParentProfile) => {
  const result = await ParentProfile.create(payload);
  return result;
};

const getParentProfileByUserId = async (userId: string) => {
  const result = await ParentProfile.findOne({ user: userId }).populate("user");
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Parent profile not found for this user");
  }
  return result;
};

const getAllParentProfiles = async (query: Record<string, any>) => {
  const parentQuery = new QueryBuilder(ParentProfile.find().populate("user"), query as Record<string, string>)
    .search(parentSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await parentQuery.build();
  const meta = await parentQuery.getMeta();

  return {
    data,
    meta,
  };
};

const updateParentProfile = async (userId: string, payload: Partial<IParentProfile>) => {
  const profile = await ParentProfile.findOne({ user: userId });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Parent profile not found");
  }

  const result = await ParentProfile.findOneAndUpdate(
    { user: userId },
    payload,
    { new: true, runValidators: true }
  ).populate("user");

  return result;
};

const deleteParentProfile = async (userId: string) => {
  const profile = await ParentProfile.findOne({ user: userId });
  if (!profile) {
    throw new AppError(httpStatus.NOT_FOUND, "Parent profile not found");
  }

  const result = await ParentProfile.findOneAndDelete({ user: userId });
  return result;
};

export const ParentServices = {
  createParentProfile,
  getParentProfileByUserId,
  getAllParentProfiles,
  updateParentProfile,
  deleteParentProfile,
};
