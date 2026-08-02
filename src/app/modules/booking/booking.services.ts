import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IBooking, BookingStatus, PaymentStatus } from "./booking.interface";
import { Booking } from "./booking.model";
import { User } from "../user/user.model";
import { Role } from "../user/user.interface";
import { QueryBuilder } from "../../utils/QueryBuiler";
import { bookingSearchableFields } from "./booking.constant";

const createBooking = async (parentId: string, payload: Partial<IBooking>) => {
  // Check if sitter exists and is a babysitter
  const sitter = await User.findById(payload.sitter);
  if (!sitter) {
    throw new AppError(httpStatus.NOT_FOUND, "Sitter not found");
  }
  if (sitter.role !== Role.BABYSITTER) {
    throw new AppError(httpStatus.BAD_REQUEST, "Selected user is not a babysitter");
  }

  // Calculate total amount
  const hourlyRate = payload.hourlyRate || 0;
  const totalHours = payload.totalHours || 0;
  
  const bookingData: Partial<IBooking> = {
    ...payload,
    parent: parentId,
    totalAmount: hourlyRate * totalHours,
    status: BookingStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
  };

  const result = await Booking.create(bookingData);
  return result;
};

const getAllBookings = async (userId: string, role: string, query: Record<string, any>) => {
  const filterQuery: Record<string, any> = { ...query };

  // Role-based restrictions
  if (role === Role.PARENT) {
    filterQuery.parent = userId;
  } else if (role === Role.BABYSITTER) {
    filterQuery.sitter = userId;
  }
  // ADMIN & SUPER_ADMIN can see all bookings, or filter as per query

  const bookingQuery = new QueryBuilder(
    Booking.find()
      .populate("parent", "name email phone")
      .populate("sitter", "name email phone")
      .populate("jobPost"),
    filterQuery as Record<string, string>
  )
    .search(bookingSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await bookingQuery.build();
  const meta = await bookingQuery.getMeta();

  return {
    data,
    meta,
  };
};

const getBookingById = async (id: string, userId: string, role: string) => {
  const result = await Booking.findById(id)
    .populate("parent", "name email phone")
    .populate("sitter", "name email phone")
    .populate("jobPost");

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  // Access control check
  const parentIdStr = result.parent instanceof Object ? (result.parent as any)._id.toString() : result.parent.toString();
  const sitterIdStr = result.sitter instanceof Object ? (result.sitter as any)._id.toString() : result.sitter.toString();

  if (
    role !== Role.SUPER_ADMIN &&
    role !== Role.ADMIN &&
    parentIdStr !== userId &&
    sitterIdStr !== userId
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "You do not have permission to view this booking");
  }

  return result;
};

const updateBookingStatus = async (
  id: string,
  userId: string,
  role: string,
  status: BookingStatus
) => {
  const booking = await Booking.findById(id);
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  const parentIdStr = booking.parent.toString();
  const sitterIdStr = booking.sitter.toString();

  // Role-based transitions and validation
  if (role === Role.BABYSITTER) {
    if (sitterIdStr !== userId) {
      throw new AppError(httpStatus.FORBIDDEN, "You do not have permission to update this booking");
    }

    // Sitters can accept or cancel a pending direct booking
    if (status === BookingStatus.ACCEPTED) {
      if (booking.status !== BookingStatus.PENDING) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Cannot accept booking from status ${booking.status}`
        );
      }
    } else if (status === BookingStatus.CANCELLED) {
      if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.ACCEPTED) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Cannot cancel booking from status ${booking.status}`
        );
      }
    } else if (status === BookingStatus.COMPLETED) {
      if (booking.status !== BookingStatus.ACCEPTED) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Cannot complete booking from status ${booking.status}`
        );
      }
    } else {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid status transition for Babysitter");
    }
  } else if (role === Role.PARENT) {
    if (parentIdStr !== userId) {
      throw new AppError(httpStatus.FORBIDDEN, "You do not have permission to update this booking");
    }

    // Parents can cancel a booking (pending or accepted) or complete an accepted booking
    if (status === BookingStatus.CANCELLED) {
      if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.ACCEPTED) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Cannot cancel booking from status ${booking.status}`
        );
      }
    } else if (status === BookingStatus.COMPLETED) {
      if (booking.status !== BookingStatus.ACCEPTED) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `Cannot complete booking from status ${booking.status}`
        );
      }
    } else {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid status transition for Parent");
    }
  } else if (role !== Role.ADMIN && role !== Role.SUPER_ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Unauthorized role");
  }

  const result = await Booking.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  )
    .populate("parent", "name email phone")
    .populate("sitter", "name email phone")
    .populate("jobPost");

  return result;
};

const updatePaymentStatus = async (
  id: string,
  userId: string,
  role: string,
  paymentStatus: PaymentStatus
) => {
  const booking = await Booking.findById(id);
  if (!booking) {
    throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
  }

  const parentIdStr = booking.parent.toString();

  // Only Parent (owner) or Admin can update payment status
  if (role === Role.PARENT && parentIdStr !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to update payment for this booking"
    );
  } else if (
    role !== Role.PARENT &&
    role !== Role.ADMIN &&
    role !== Role.SUPER_ADMIN
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "Unauthorized role");
  }

  const result = await Booking.findByIdAndUpdate(
    id,
    { paymentStatus },
    { new: true, runValidators: true }
  )
    .populate("parent", "name email phone")
    .populate("sitter", "name email phone")
    .populate("jobPost");

  return result;
};

export const BookingServices = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
};
