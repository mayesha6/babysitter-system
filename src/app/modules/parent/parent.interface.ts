import { Types } from "mongoose";

export enum BabysittingType {
  PART_TIME = "PART_TIME",
  FULL_TIME = "FULL_TIME",
  WEEKEND = "WEEKEND",
}

export interface IParentProfile {
  _id?: string;
  user: Types.ObjectId | string;
  profileImage?: string;
  address?: string;
  childName?: string;
  childAge?: string | number;
  childGender?: string;
  specialNeeds?: string;
  preferredBabysitterGender?: string;
  preferredExperience?: string;
  preferredLanguage?: string;
  babysittingType?: BabysittingType;
  expectedHourlyBudget?: number;
  expectedDailyBudget?: number;
  expectedMonthlyBudget?: number;
  startDate?: Date;
  additionalRequirements?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
