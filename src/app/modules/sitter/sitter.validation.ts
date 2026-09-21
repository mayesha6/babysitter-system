import { z } from "zod";
import { EmploymentType, VerificationStatus } from "./sitter.interface";

export const createSitterProfileZodSchema = z.object({

  user: z.string(),
  profileImage: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  about: z.string().optional(),
  experienceYears: z.number().nonnegative().optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  hourlyRate: z.number().nonnegative().optional(),
  dailyRate: z.number().nonnegative().optional(),
  monthlyRate: z.number().nonnegative().optional(),
  employmentType: z.enum(Object.values(EmploymentType) as [string, ...string[]]).optional(),
  availableDays: z.array(z.string()).optional(),
  availableStartTime: z.string().optional(),
  availableEndTime: z.string().optional(),
  nidNumber: z.string().optional(),
  nidFrontImage: z.string().optional(),
  nidBackImage: z.string().optional(),
  selfieImage: z.string().optional(),
  policeClearanceImage: z.string().optional(),
  firstAidCertificate: z.string().optional(),
  experienceCertificate: z.string().optional(),
  referenceName: z.string().optional(),
  referencePhone: z.string().optional(),
  verificationStatus: z.enum(Object.values(VerificationStatus) as [string, ...string[]]).optional(),

});

export const updateSitterProfileZodSchema = z.object({

  profileImage: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  about: z.string().optional(),
  experienceYears: z.number().nonnegative().optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  hourlyRate: z.number().nonnegative().optional(),
  dailyRate: z.number().nonnegative().optional(),
  monthlyRate: z.number().nonnegative().optional(),
  employmentType: z.enum(Object.values(EmploymentType) as [string, ...string[]]).optional(),
  availableDays: z.array(z.string()).optional(),
  availableStartTime: z.string().optional(),
  availableEndTime: z.string().optional(),
  nidNumber: z.string().optional(),
  nidFrontImage: z.string().optional(),
  nidBackImage: z.string().optional(),
  selfieImage: z.string().optional(),
  policeClearanceImage: z.string().optional(),
  firstAidCertificate: z.string().optional(),
  experienceCertificate: z.string().optional(),
  referenceName: z.string().optional(),
  referencePhone: z.string().optional(),
  verificationStatus: z.enum(Object.values(VerificationStatus) as [string, ...string[]]).optional(),

});

export const verifySitterProfileZodSchema = z.object({

  status: z.enum(["VERIFIED", "REJECTED"]),

});
