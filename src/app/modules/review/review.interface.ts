import { Types } from "mongoose";

export interface IReview {
  _id?: string;
  booking: Types.ObjectId | string;
  parent: Types.ObjectId | string;
  sitter: Types.ObjectId | string;
  rating: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
