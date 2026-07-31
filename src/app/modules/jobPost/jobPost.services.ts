import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IJobPost, ApplicantStatus } from "./jobPost.interface";
import { JobPost } from "./jobPost.model";
import { QueryBuilder } from "../../utils/QueryBuiler";
import { jobPostSearchableFields } from "./jobPost.constant";

const createJobPost = async (payload: IJobPost) => {
  const result = await JobPost.create(payload);
  return result;
};

const getAllJobPosts = async (query: Record<string, any>) => {
  const jobPostQuery = new QueryBuilder(
    JobPost.find().populate("parent", "-password"),
    query as Record<string, string>
  )
    .search(jobPostSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await jobPostQuery.build();
  const meta = await jobPostQuery.getMeta();

  return {
    data,
    meta,
  };
};

const getJobPostById = async (id: string) => {
  const result = await JobPost.findById(id)
    .populate("parent", "-password")
    .populate("applicants.sitter", "-password");

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Job post not found");
  }
  return result;
};

const updateJobPost = async (id: string, userId: string, userRole: string, payload: Partial<IJobPost>) => {
  const job = await JobPost.findById(id);
  if (!job) {
    throw new AppError(httpStatus.NOT_FOUND, "Job post not found");
  }

  // Only the parent owner or an admin can update
  if (job.parent.toString() !== userId && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have permission to update this job post");
  }

  const result = await JobPost.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteJobPost = async (id: string, userId: string, userRole: string) => {
  const job = await JobPost.findById(id);
  if (!job) {
    throw new AppError(httpStatus.NOT_FOUND, "Job post not found");
  }

  // Only the parent owner or an admin can delete
  if (job.parent.toString() !== userId && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have permission to delete this job post");
  }

  const result = await JobPost.findByIdAndDelete(id);
  return result;
};

const applyToJobPost = async (id: string, sitterId: string) => {
  const job = await JobPost.findById(id);
  if (!job) {
    throw new AppError(httpStatus.NOT_FOUND, "Job post not found");
  }

  // Check if job is still open
  if (job.status !== "OPEN") {
    throw new AppError(httpStatus.BAD_REQUEST, "This job is no longer accepting applications");
  }

  // Check if already applied
  const alreadyApplied = job.applicants?.some(
    (app) => app.sitter.toString() === sitterId
  );

  if (alreadyApplied) {
    throw new AppError(httpStatus.BAD_REQUEST, "You have already applied to this job post");
  }

  const newApplicant = {
    sitter: sitterId,
    status: ApplicantStatus.PENDING,
    appliedAt: new Date(),
  };

  const result = await JobPost.findByIdAndUpdate(
    id,
    { $push: { applicants: newApplicant } },
    { new: true }
  ).populate("applicants.sitter", "-password");

  return result;
};

const updateApplicantStatus = async (
  id: string,
  parentId: string,
  sitterId: string,
  status: ApplicantStatus
) => {
  const job = await JobPost.findById(id);
  if (!job) {
    throw new AppError(httpStatus.NOT_FOUND, "Job post not found");
  }

  // Only the parent owner can update applicant status
  if (job.parent.toString() !== parentId) {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have permission to manage this job's applicants");
  }

  // Update specific applicant status inside array
  const result = await JobPost.findOneAndUpdate(
    { _id: id, "applicants.sitter": sitterId },
    { $set: { "applicants.$.status": status } },
    { new: true }
  ).populate("applicants.sitter", "-password");

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Applicant not found for this job post");
  }

  return result;
};

export const JobPostServices = {
  createJobPost,
  getAllJobPosts,
  getJobPostById,
  updateJobPost,
  deleteJobPost,
  applyToJobPost,
  updateApplicantStatus,
};
