import { Types } from "mongoose";

export enum EmploymentType {
  PART_TIME = "PART_TIME",
  FULL_TIME = "FULL_TIME",
  WEEKEND = "WEEKEND",
}

export enum VerificationStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export interface IBabysitterProfile {
  _id?: string;
  user: Types.ObjectId | string;
  profileImage?: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  about?: string;
  experienceYears?: number;
  skills?: string[];
  languages?: string[];
  hourlyRate?: number;
  dailyRate?: number;
  monthlyRate?: number;
  employmentType?: EmploymentType;
  availableDays?: string[];
  availableStartTime?: string;
  availableEndTime?: string;
  nidNumber?: string;
  nidFrontImage?: string;
  nidBackImage?: string;
  selfieImage?: string;
  policeClearanceImage?: string;
  firstAidCertificate?: string;
  experienceCertificate?: string;
  referenceName?: string;
  referencePhone?: string;
  verificationStatus?: VerificationStatus;
  verifiedBy?: Types.ObjectId | string;
  verifiedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
