import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IJobPost, ApplicantStatus, JobStatus } from "./jobPost.interface";
import { JobPost } from "./jobPost.model";
import { QueryBuilder } from "../../utils/QueryBuiler";
import { jobPostSearchableFields } from "./jobPost.constant";
import { Booking } from "../booking/booking.model";
import { BookingStatus, PaymentStatus } from "../booking/booking.interface";
import { NotificationServices } from "../notification/notification.services";
import { NotificationType } from "../notification/notification.interface";

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

  // Notify the Parent of the new application
  await NotificationServices.createNotification({
    recipient: job.parent.toString(),
    sender: sitterId,
    title: "New Job Application",
    message: `A babysitter has applied to your job post: "${job.title}"`,
    type: NotificationType.JOB_POST,
    link: `/job-post/${job._id}`,
  });

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

  if (status === ApplicantStatus.ACCEPTED) {
    if (job.status !== JobStatus.OPEN) {
      throw new AppError(httpStatus.BAD_REQUEST, "This job is no longer open for hiring");
    }

    // Update job status to HIRED
    job.status = JobStatus.HIRED;

    // Update applicant statuses
    let applicantFound = false;
    if (job.applicants) {
      job.applicants.forEach((applicant) => {
        if (applicant.sitter.toString() === sitterId) {
          applicant.status = ApplicantStatus.ACCEPTED;
          applicantFound = true;
        } else if (applicant.status === ApplicantStatus.PENDING) {
          applicant.status = ApplicantStatus.REJECTED;
        }
      });
    }

    if (!applicantFound) {
      throw new AppError(httpStatus.NOT_FOUND, "Applicant not found for this job post");
    }

    await job.save();

    // Create Booking automatically
    const totalHours = calculateTotalHours(
      job.startDate,
      job.endDate,
      job.startTime,
      job.endTime
    );
    const totalAmount = totalHours * job.hourlyRate;

    await Booking.create({
      parent: parentId,
      sitter: sitterId,
      jobPost: id,
      startDate: job.startDate,
      endDate: job.endDate,
      startTime: job.startTime,
      endTime: job.endTime,
      hourlyRate: job.hourlyRate,
      totalHours,
      totalAmount,
      paymentStatus: PaymentStatus.PENDING,
      status: BookingStatus.ACCEPTED,
    });

    // Notify the accepted Sitter
    await NotificationServices.createNotification({
      recipient: sitterId,
      sender: parentId,
      title: "Application Accepted",
      message: `Your application to "${job.title}" has been accepted! A booking has been created.`,
      type: NotificationType.BOOKING,
      link: `/bookings`,
    });

    // Notify other applicants who are now rejected
    if (job.applicants) {
      for (const applicant of job.applicants) {
        if (
          applicant.sitter.toString() !== sitterId &&
          applicant.status === ApplicantStatus.REJECTED
        ) {
          await NotificationServices.createNotification({
            recipient: applicant.sitter.toString(),
            sender: parentId,
            title: "Application Update",
            message: `Your application to "${job.title}" was not selected.`,
            type: NotificationType.JOB_POST,
          });
        }
      }
    }
  } else {
    // For other statuses (e.g. REJECTED), just update the applicant status in the array
    const result = await JobPost.findOneAndUpdate(
      { _id: id, "applicants.sitter": sitterId },
      { $set: { "applicants.$.status": status } },
      { new: true }
    );

    if (!result) {
      throw new AppError(httpStatus.NOT_FOUND, "Applicant not found for this job post");
    }

    // Notify the sitter of manual rejection/update
    await NotificationServices.createNotification({
      recipient: sitterId,
      sender: parentId,
      title: "Application Update",
      message: `Your application to "${job.title}" was ${status.toLowerCase()}.`,
      type: NotificationType.JOB_POST,
    });
  }

  const updatedJob = await JobPost.findById(id)
    .populate("parent", "-password")
    .populate("applicants.sitter", "-password");

  return updatedJob;
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

const parseTimeToHours = (timeStr: string): number => {
  const cleanTime = timeStr.trim().toUpperCase();
  const ampmMatch = cleanTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const ampm = ampmMatch[3];
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return hours + minutes / 60;
  }
  
  const simpleMatch = cleanTime.match(/^(\d{1,2}):(\d{2})$/);
  if (simpleMatch) {
    const hours = parseInt(simpleMatch[1], 10);
    const minutes = parseInt(simpleMatch[2], 10);
    return hours + minutes / 60;
  }

  return 0;
};

const calculateTotalHours = (startDate: Date, endDate: Date, startTime: string, endTime: string): number => {
  const startHrs = parseTimeToHours(startTime);
  const endHrs = parseTimeToHours(endTime);
  
  let hoursPerDay = endHrs - startHrs;
  if (hoursPerDay < 0) {
    hoursPerDay += 24;
  }

  const startD = new Date(startDate);
  const endD = new Date(endDate);
  
  startD.setHours(0, 0, 0, 0);
  endD.setHours(0, 0, 0, 0);
  
  const msDiff = endD.getTime() - startD.getTime();
  const dayCount = Math.max(1, Math.round(msDiff / (1000 * 60 * 60 * 24)) + 1);

  return dayCount * hoursPerDay;
};
