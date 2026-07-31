import { Schema, model } from "mongoose";
import { ApplicantStatus, IApplicant, IJobPost, JobStatus, JobType } from "./jobPost.interface";

const applicantSchema = new Schema<IApplicant>({
  sitter: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(ApplicantStatus),
    default: ApplicantStatus.PENDING,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  _id: false,
});

const jobPostSchema = new Schema<IJobPost>({
  parent: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  childName: {
    type: String,
    default: "",
  },
  childAge: {
    type: Schema.Types.Mixed,
    default: "",
  },
  childGender: {
    type: String,
    default: "",
  },
  requiredSkills: {
    type: [String],
    default: [],
  },
  preferredSitterGender: {
    type: String,
    default: "ANY",
  },
  hourlyRate: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    enum: Object.values(JobType),
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(JobStatus),
    default: JobStatus.OPEN,
  },
  additionalInfo: {
    type: String,
    default: "",
  },
  applicants: {
    type: [applicantSchema],
    default: [],
  },
}, {
  timestamps: true,
  versionKey: false,
});

export const JobPost = model<IJobPost>("JobPost", jobPostSchema);
