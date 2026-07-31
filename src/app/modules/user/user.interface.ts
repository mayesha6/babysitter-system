
export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  PARENT = "PARENT",
  BABYSITTER = "BABYSITTER",
}

export enum Status {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IAuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: Role;
  status: Status;
  isEmailVerified: boolean;
  lastLogin?: Date;
  profileCompleted: boolean;
  isDeleted: boolean;
  refreshToken?: string;
  auths?: IAuthProvider[];
  createdAt?: Date;
  updatedAt?: Date;
}

