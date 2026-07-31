import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { JobPostControllers } from "./jobPost.controller";
import { JobPostValidations } from "./jobPost.validation";

const router = Router();

router.post(
  "/",
  checkAuth(Role.PARENT),
  validateRequest(JobPostValidations.createJobPostZodSchema),
  JobPostControllers.createJobPost
);

router.get(
  "/",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT, Role.BABYSITTER),
  JobPostControllers.getAllJobPosts
);

router.get(
  "/:id",
  checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.PARENT, Role.BABYSITTER),
  JobPostControllers.getJobPostById
);

router.patch(
  "/:id",
  checkAuth(Role.PARENT),
  validateRequest(JobPostValidations.updateJobPostZodSchema),
  JobPostControllers.updateJobPost
);

router.delete(
  "/:id",
  checkAuth(Role.PARENT, Role.SUPER_ADMIN, Role.ADMIN),
  JobPostControllers.deleteJobPost
);

router.post(
  "/:id/apply",
  checkAuth(Role.BABYSITTER),
  JobPostControllers.applyToJobPost
);

router.patch(
  "/:id/applicant-status",
  checkAuth(Role.PARENT),
  validateRequest(JobPostValidations.updateApplicantStatusZodSchema),
  JobPostControllers.updateApplicantStatus
);

export const JobPostRoutes = router;
