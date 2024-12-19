export interface IUser {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  isActive: boolean;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  emailVerify: boolean;
  otp?: string;
  googleId?: string;
  facebookId?: string;
  refreshToken?: string;
  accountType: string;
  createdAt: Date;
  updatedAt: Date;
}
