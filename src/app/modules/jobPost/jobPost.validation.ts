import { z } from "zod";
import { ApplicantStatus, JobStatus, JobType } from "./jobPost.interface";

const createJobPostZodSchema = z.object({
  body: z.object({
    title: z.string(),
    description: z.string(),
    childName: z.string().optional(),
    childAge: z.union([z.number(), z.string()]).optional(),
    childGender: z.string().optional(),
    requiredSkills: z.array(z.string()).optional(),
    preferredSitterGender: z.string().optional(),
    hourlyRate: z.number().nonnegative(),
    location: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    jobType: z.nativeEnum(JobType),
    additionalInfo: z.string().optional(),
  }),
});

const updateJobPostZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    childName: z.string().optional(),
    childAge: z.union([z.number(), z.string()]).optional(),
    childGender: z.string().optional(),
    requiredSkills: z.array(z.string()).optional(),
    preferredSitterGender: z.string().optional(),
    hourlyRate: z.number().nonnegative().optional(),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    jobType: z.nativeEnum(JobType).optional(),
    status: z.nativeEnum(JobStatus).optional(),
    additionalInfo: z.string().optional(),
  }),
});

const updateApplicantStatusZodSchema = z.object({
  body: z.object({
    sitterId: z.string(),
    status: z.nativeEnum(ApplicantStatus),
  }),
});

export const JobPostValidations = {
  createJobPostZodSchema,
  updateJobPostZodSchema,
  updateApplicantStatusZodSchema,
};
