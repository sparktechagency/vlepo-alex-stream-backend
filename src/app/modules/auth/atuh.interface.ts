export type TLoginUser = {
    email: string;
    password: string;
  };

  export type IVerifyEmail = {
    email: string;
    oneTimeCode: string;
  };
  
  export type IAuthResetPassword = {
    newPassword: string;
    confirmPassword: string;
  };
  
  export type IChangePassword = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  