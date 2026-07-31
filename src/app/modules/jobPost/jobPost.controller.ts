import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JobPostServices } from "./jobPost.services";

const createJobPost = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as any).userId;
  const result = await JobPostServices.createJobPost({
    ...req.body,
    parent: userId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Job post created successfully",
    data: result,
  });
});

const getAllJobPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await JobPostServices.getAllJobPosts(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Job posts retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getJobPostById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await JobPostServices.getJobPostById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Job post details retrieved successfully",
    data: result,
  });
});

const updateJobPost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req.user as any).userId;
  const userRole = (req.user as any).role;

  const result = await JobPostServices.updateJobPost(id, userId, userRole, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Job post updated successfully",
    data: result,
  });
});

const deleteJobPost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req.user as any).userId;
  const userRole = (req.user as any).role;

  await JobPostServices.deleteJobPost(id, userId, userRole);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Job post deleted successfully",
    data: null,
  });
});

const applyToJobPost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const sitterId = (req.user as any).userId;

  const result = await JobPostServices.applyToJobPost(id, sitterId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Applied to job post successfully",
    data: result,
  });
});

const updateApplicantStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const parentId = (req.user as any).userId;
  const { sitterId, status } = req.body;

  const result = await JobPostServices.updateApplicantStatus(id, parentId, sitterId, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Applicant status updated successfully",
    data: result,
  });
});

export const JobPostControllers = {
  createJobPost,
  getAllJobPosts,
  getJobPostById,
  updateJobPost,
  deleteJobPost,
  applyToJobPost,
  updateApplicantStatus,
};
