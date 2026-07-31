import { Types } from "mongoose";

export enum JobType {
  PART_TIME = "PART_TIME",
  FULL_TIME = "FULL_TIME",
  WEEKEND = "WEEKEND",
}

export enum JobStatus {
  OPEN = "OPEN",
  HIRED = "HIRED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum ApplicantStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export interface IApplicant {
  sitter: Types.ObjectId | string;
  status: ApplicantStatus;
  appliedAt: Date;
}

export interface IJobPost {
  _id?: string;
  parent: Types.ObjectId | string;
  title: string;
  description: string;
  childName?: string;
  childAge?: number | string;
  childGender?: string;
  requiredSkills?: string[];
  preferredSitterGender?: string;
  hourlyRate: number;
  location: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  jobType: JobType;
  status: JobStatus;
  additionalInfo?: string;
  applicants?: IApplicant[];
  createdAt?: Date;
  updatedAt?: Date;
}
