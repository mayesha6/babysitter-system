import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { IReview } from "./review.interface";
import { Review } from "./review.model";
import { Booking } from "../booking/booking.model";
import { BookingStatus } from "../booking/booking.interface";
import { BabysitterProfile } from "../sitter/sitter.model";
import { QueryBuilder } from "../../utils/QueryBuiler";
import { reviewSearchableFields } from "./review.constant";
import { Role } from "../user/user.interface";

const updateAverageRating = async (sitterId: string | Types.ObjectId) => {
  const stats = await Review.aggregate([
    {
      $match: { sitter: new Types.ObjectId(sitterId) },
    },
    {
      $group: {
        _id: "$sitter",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await BabysitterProfile.findOneAndUpdate(
      { user: sitterId },
      {
        averageRating: parseFloat(stats[0].averageRating.toFixed(2)),
        reviewCount: stats[0].reviewCount,
      }
    );
  } else {
    await BabysitterProfile.findOneAndUpdate(
      { user: sitterId },
      {
        averageRating: 0,
        reviewCount: 0,
      }
    );
  }
};

const createReview = async (parentId: string, payload: Partial<IReview>) => {
  // Validate booking
  const booking = await Booking.findById(payload.booking);
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  // Ensure only the parent associated with this booking can review
  if (booking.parent.toString() !== parentId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to review this booking"
    );
  }

  // Ensure booking is completed
  if (booking.status !== BookingStatus.COMPLETED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can only review completed bookings"
    );
  }

  // Check if review already exists
  const existingReview = await Review.findOne({ booking: payload.booking });
  if (existingReview) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already reviewed this booking"
    );
  }

  const reviewData: Partial<IReview> = {
    ...payload,
    parent: parentId,
    sitter: booking.sitter.toString(),
  };

  const result = await Review.create(reviewData);

  // Update sitter's profile rating stats
  await updateAverageRating(booking.sitter);

  return result;
};

const updateReview = async (
  id: string,
  parentId: string,
  payload: Partial<IReview>
) => {
  const review = await Review.findById(id);
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  // Only the parent owner can update the review
  if (review.parent.toString() !== parentId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to edit this review"
    );
  }

  const result = await Review.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  // Recalculate average rating
  await updateAverageRating(result.sitter);

  return result;
};

const deleteReview = async (id: string, userId: string, role: string) => {
  const review = await Review.findById(id);
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  // Only the parent owner or an Admin can delete the review
  if (
    role !== Role.SUPER_ADMIN &&
    role !== Role.ADMIN &&
    review.parent.toString() !== userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to delete this review"
    );
  }

  const result = await Review.findByIdAndDelete(id);

  // Recalculate average rating
  if (result) {
    await updateAverageRating(result.sitter);
  }

  return result;
};

const getReviewsForSitter = async (
  sitterId: string,
  query: Record<string, any>
) => {
  const reviewQuery = new QueryBuilder(
    Review.find({ sitter: sitterId })
      .populate("parent", "name email phone")
      .populate("booking"),
    query as Record<string, string>
  )
    .search(reviewSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await reviewQuery.build();
  const meta = await reviewQuery.getMeta();

  return {
    data,
    meta,
  };
};

const getAllReviews = async (query: Record<string, any>) => {
  const reviewQuery = new QueryBuilder(
    Review.find()
      .populate("parent", "name email phone")
      .populate("sitter", "name email phone")
      .populate("booking"),
    query as Record<string, string>
  )
    .search(reviewSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await reviewQuery.build();
  const meta = await reviewQuery.getMeta();

  return {
    data,
    meta,
  };
};

export const ReviewServices = {
  createReview,
  updateReview,
  deleteReview,
  getReviewsForSitter,
  getAllReviews,
};
