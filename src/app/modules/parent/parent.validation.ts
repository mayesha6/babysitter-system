import { z } from "zod";
import { BabysittingType } from "./parent.interface";

export const createParentProfileZodSchema = z.object({
  body: z.object({
    user: z.string(),
    profileImage: z.string().optional(),
    address: z.string().optional(),
    childName: z.string().optional(),
    childAge: z.union([z.string(), z.number()]).optional(),
    childGender: z.string().optional(),
    specialNeeds: z.string().optional(),
    preferredBabysitterGender: z.string().optional(),
    preferredExperience: z.string().optional(),
    preferredLanguage: z.string().optional(),
    babysittingType: z.enum(Object.values(BabysittingType) as [string, ...string[]]).optional(),
    expectedHourlyBudget: z.number().nonnegative().optional(),
    expectedDailyBudget: z.number().nonnegative().optional(),
    expectedMonthlyBudget: z.number().nonnegative().optional(),
    startDate: z.string().optional(),
    additionalRequirements: z.string().optional(),
  }),
});

export const updateParentProfileZodSchema = z.object({
  body: z.object({
    profileImage: z.string().optional(),
    address: z.string().optional(),
    childName: z.string().optional(),
    childAge: z.union([z.string(), z.number()]).optional(),
    childGender: z.string().optional(),
    specialNeeds: z.string().optional(),
    preferredBabysitterGender: z.string().optional(),
    preferredExperience: z.string().optional(),
    preferredLanguage: z.string().optional(),
    babysittingType: z.enum(Object.values(BabysittingType) as [string, ...string[]]).optional(),
    expectedHourlyBudget: z.number().nonnegative().optional(),
    expectedDailyBudget: z.number().nonnegative().optional(),
    expectedMonthlyBudget: z.number().nonnegative().optional(),
    startDate: z.string().optional(),
    additionalRequirements: z.string().optional(),
  }),
});
