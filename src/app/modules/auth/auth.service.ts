import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import cryptoToken from '../../../util/cryptoToken';
import generateOTP from '../../../util/generateOTP';
import { ResetToken } from '../resetToken/resetToken.model';
import { User } from '../user/user.model';
import { USER_STATUS } from '../user/user.constants';
import { IAuthResetPassword, IChangePassword, IVerifyEmail, TLoginUser } from './atuh.interface';

//login
const loginUserFromDB = async (payload: TLoginUser) => {
  const { email, password } = payload;
  const isExistUser = await User.findOne({ email }).select('+password');
  
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //check blocked status
  if (isExistUser.isDeleted) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Account is deleted!'
    );
  }

  //check user status
  if (isExistUser.status === USER_STATUS.BLOCKED) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You don’t have permission to access this content.It looks like your account has been bloocked.'
    );
  }

  //check match password
  if (
    password &&
    !(await User.isMatchPassword(password, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password is incorrect!');
  }

  //create token
  const accessToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  const refreshToken = jwtHelper.createToken(
    { id: isExistUser._id, role: isExistUser.role, email: isExistUser.email },
    config.jwt.jwt_refresh as Secret,
    config.jwt.jwt_refresh_expire_in as string
  );

  return { accessToken, refreshToken };
};

//forget password
const forgetPasswordToDB = async (email: string) => {
  const isExistUser = await User.isExistUserByEmail(email);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (isExistUser.status === USER_STATUS.BLOCKED) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'User are bloocked!'
    );
  }

  if (isExistUser.isDeleted) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'User is deleted!'
    );
  }

  //send mail
  const otp = generateOTP();
  const value = {
    otp,
    email: isExistUser.email,
  };
  const forgetPassword = emailTemplate.resetPassword(value);
  emailHelper.sendEmail(forgetPassword);

  //save to DB
  const expireAt = new Date(Date.now() + 10 * 60 * 1000); // validaty 10 min 

  await User.findOneAndUpdate({ email },
    {
      $set: {
        'otpVerification.otp': otp, // Update OTP value
        'otpVerification.expireAt': expireAt, // Set expiration time
      },
    },
  );
};


//verify email
const verifyEmailToDB = async (payload: IVerifyEmail) => {
  const { email, oneTimeCode } = payload;
  const isExistUser = await User.findOne({ email }).select('+otpVerification');

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (isExistUser.status === USER_STATUS.BLOCKED) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'User are bloocked!'
    );
  }

  if (isExistUser.isDeleted) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'User is deleted!'
    );
  }

  if (!oneTimeCode) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'OTP needed! Please check your email we send a code!'
    );
  }

  if (isExistUser?.otpVerification?.otp !== oneTimeCode) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
  }

  const date = new Date();
  if (date > isExistUser.otpVerification?.expireAt) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Otp already expired, Please try again'
    );
  }

  let message;
  let data;

  if (isExistUser) {
    //create token ;
    const createToken = cryptoToken();

    const result = await User.findByIdAndUpdate(
      isExistUser._id,
      {
        otpVerification: {
          otp: "",
          expireAt: new Date(Date.now() + 10 * 60000), // 10 min todo
          token: createToken,
          isResetPassword: true
        }
      },
      { new: true }
    ).select("+otpVerification")

    console.log(result);
    message = 'Email verify successfully';
    data = createToken;
  }

  return { data, message };
};

//forget password
const resetPasswordToDB = async (
  token: string, // only token without Bearer
  payload: IAuthResetPassword
) => {
  const { newPassword, confirmPassword } = payload;
  //isExist token
  const user = await User.findOne({ "otpVerification.token": token }).select("+otpVerification");

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
  }

  if (!user?.otpVerification?.isResetPassword) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "You don't have permission to change the password. Please click again to 'Forgot Password'"
    );
  }

  // validity check
  const isValid = new Date() >= user.otpVerification?.expireAt; console.log(isValid);
  if (isValid) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Token expired, Please click again to the forget password'
    );
  }

  //check password

  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "New password and Confirm password doesn't match!"
    );
  }

  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
    otpVerification: {
      isResetPassword: false,
      token: "",
      expireAt: new Date()
    },
  };

  await User.findOneAndUpdate(
    { _id: user._id },
    updateData,
    { new: true }
  );

  return null;
};


const changePasswordToDB = async (
  user: JwtPayload,
  payload: IChangePassword
) => {
  const { currentPassword, newPassword, confirmPassword } = payload;
  const isExistUser = await User.findById(user.id).select('+password');
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  //current password match
  if (
    currentPassword &&
    !(await User.isMatchPassword(currentPassword, isExistUser.password))
  ) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Current password is incorrect');
  }

  //newPassword and current password
  if (currentPassword === newPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please give different password from current password'
    );
  }
  //new password and confirm password check
  if (newPassword !== confirmPassword) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and Confirm password doesn't matched"
    );
  }

  //hash password
  const hashPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const updateData = {
    password: hashPassword,
  };
  await User.findOneAndUpdate({ _id: user.id }, updateData, { new: true });
};


const refreshToken = async (token: string) => {

  const decoded = jwtHelper.verifyToken(token, config.jwt.jwt_refresh as string);
  
  const { id, iat } = decoded; 

  // checking if the user is exist
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'This user is not found !');
  }

  // // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'This user is deleted !');
  }

  // // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === USER_STATUS.BLOCKED) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'This user is blocked!');
  }


  const accessToken = jwtHelper.createToken(
    { id: user._id, role: user.role, email: user.email },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expire_in as string
  );

  return {accessToken};
}


export const AuthService = {
  loginUserFromDB,
  changePasswordToDB,
  forgetPasswordToDB,
  verifyEmailToDB,
  resetPasswordToDB,
  refreshToken,
};
