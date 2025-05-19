import config from '../config';
import {
  ICreateAccount,
  IResetPassword,
  TTicketSecret,
} from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.ibb.co/5xFrGF29/Group.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <h2 style="color: #FF6B00; font-size: 24px; margin-bottom: 20px;">Hey! ${values.name}, Your Account Credentials</h2>
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #FF6B00; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 10 minutes.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.ibb.co/5xFrGF29/Group.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #FF6B00; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 10 minutes.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const registerAccountOtpSend = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Verify Your Email',
    html: `
    <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
      <table width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #dddddd; border-radius: 8px; padding: 20px;">
        <tr>
          <td style="text-align: center; padding: 20px 0;">
            <img src="https://i.ibb.co/5xFrGF29/Group.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
            <h2 style="color: #FF6B00; margin: 0;">Verify Your Email</h2>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; color: #555555; line-height: 1.6;">
            <p style="margin: 0;">Hello,</p>
            <p style="margin: 10px 0 0;">Thank you for creating an account with us. Please use the OTP below to verify your email address:</p>
            <div style="margin: 20px 0; text-align: center;">
              <span style="font-size: 24px; font-weight: bold; color: #ffffff; background-color: #FF6B00; padding: 10px 20px; border-radius: 5px; display: inline-block;">${values.otp}</span>
            </div>
            <p style="margin: 0;"> If you did not request this email, please ignore it.</p>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; padding: 20px;">
            <a href=${config.client_url} style="text-decoration: none; color: #ffffff; background-color: #FF6B00; padding: 10px 20px; border-radius: 5px; display: inline-block;">Verify Now</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; color: #999999; font-size: 12px; text-align: center; border-top: 1px solid #dddddd;">
            <p style="margin: 0;">If you have any issues, contact our support team at <a href="mailto:support@example.com" style="color: #FF6B00;">support@example.com</a>.</p>
          </td>
        </tr>
      </table>
    </body>
    `,
  };
  return data;
};

// Updated contact confirmation template to handle both admin and user emails
const contactConfirmation = (data: {
  name: string;
  email: string;
  message: string;
  isAdmin?: boolean;
}) => {
  // Template for user who submitted the contact form
  if (!data.isAdmin) {
    return {
      to: data.email,
      subject: 'Thank you for contacting us',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://i.ibb.co/5xFrGF29/Group.png" alt="Logo" style="width: 150px;" />
          </div>
          <h2 style="color: #FF6B00; text-align: center;">Thank You for Contacting Us</h2>
          <p>Dear ${data.name},</p>
          <p>We have received your message and will get back to you as soon as possible.</p>
          <p>Here's a copy of your message:</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #FF6B00;">
            <p style="font-style: italic;">${data.message}</p>
          </div>
          <p>Thank you for reaching out to us!</p>
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
            <p style="color: #777; font-size: 14px;">Best regards,<br>The Support Team</p>
          </div>
        </div>
      `,
    };
  }
  // Template for admin notification
  else {
    return {
      to: data.email,
      subject: 'New Contact Form Submission',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://i.ibb.co/5xFrGF29/Group.png" alt="Logo" style="width: 150px;" />
          </div>
          <h2 style="color: #FF6B00; text-align: center;">New Contact Form Submission</h2>
          <p>Hello Admin,</p>
          <p>A new contact form has been submitted with the following details:</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Message:</strong></p>
            <div style="padding: 10px; border-left: 4px solid #FF6B00;">
              <p style="font-style: italic;">${data.message}</p>
            </div>
          </div>
          <p>Please respond to this inquiry at your earliest convenience.</p>
          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
            <p style="color: #777; font-size: 14px;">This is an automated notification.</p>
          </div>
        </div>
      `,
    };
  }
};

const ticketSecret = (values: TTicketSecret) => {
  const formattedStartTime = new Date(values.event.startTime).toLocaleString(
    'en-US',
    {
      weekday: 'long', // e.g., Monday
      year: 'numeric', // e.g., 2024
      month: 'long', // e.g., December
      day: 'numeric', // e.g., 25
      hour: '2-digit', // e.g., 10 PM
      minute: '2-digit', // e.g., 10:30 PM
    }
  );

  const data = {
    to: values.email,
    subject: 'Successfully purchased Your ticket',
    html: `
      <body style="font-family: Arial, sans-serif; background-color:rgb(243, 243, 243); margin: 20px 10px; color: #555; border-radius: 8px">
        <div style="max-width: 700px; margin: 0 auto; padding: 10px; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <img src="https://i.ibb.co/5xFrGF29/Group.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
            <div style="text-align: center;">
                <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you for purchasing a ticket for our exclusive event!</p>

                <p style="color: #555; font-size: 16px; margin-bottom: 20px;"><strong><a href=${config.client_url} style="color: #FF6B00;">${values.event.eventName}</a></strong> will be start <span style="color: #FF6B00;">${formattedStartTime}</span></p>

                <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single-use code to access the event is:</p>
                <div style="background-color: #FF6B00; width: 110px; padding: 10px; text-align: center; border-radius: 5px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.secretCode}</div>
                <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Do not share your code anyone.</p>
                <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">If you face any issues, feel free to contact our support team at <a href="mailto:support@yourevent.com" style="color: #FF6B00; text-decoration: none;">support@yourevent.com</a>.</p>
            </div>
        </div>
      </body>
    `,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
  ticketSecret,
  registerAccountOtpSend,
  contactConfirmation,
};
