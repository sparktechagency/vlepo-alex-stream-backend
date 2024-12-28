import config from '../config';
import { ICreateAccount, IResetPassword, TTicketSecret } from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <h2 style="color: #277E16; font-size: 24px; margin-bottom: 20px;">Hey! ${values.name}, Your Toothlens Account Credentials</h2>
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #277E16; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => { // todo: change <img
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #277E16; width: 80px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
        </div>
    </div>
</body>`,
  };
  return data;
};



const ticketSecret = (values: TTicketSecret) => {
  const formattedStartTime = new Date(values.event.startTime).toLocaleString("en-US", {
    weekday: "long", // e.g., Monday
    year: "numeric", // e.g., 2024
    month: "long", // e.g., December
    day: "numeric", // e.g., 25
    hour: "2-digit", // e.g., 10 PM
    minute: "2-digit", // e.g., 10:30 PM
  });

  const data = {
    to: values.email,
    subject: 'Successfully purchased Your ticket',
    html: `
      <body style="font-family: Arial, sans-serif; background-color:rgb(243, 243, 243); margin: 20px 10px; color: #555; border-radius: 8px">
        <div style="max-width: 700px; margin: 0 auto; padding: 10px; background-color: #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
            <div style="text-align: center;">
                <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you for purchasing a ticket for our exclusive event!</p>

                <p style="color: #555; font-size: 16px; margin-bottom: 20px;"><strong><a href=${config.client_url}>${values.event.eventName}</a></strong> will be start <span style="color: rgb(20, 113, 252);">${formattedStartTime}</span></p>

                <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single-use code to access the event is:</p>
                <div style="background-color: #277E16; width: 110px; padding: 10px; text-align: center; border-radius: 5px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.secretCode}</div>
                <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Do not share your code anyone.</p>
                <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">If you face any issues, feel free to contact our support team at <a href="mailto:support@yourevent.com" style="color: #277E16; text-decoration: none;">support@yourevent.com</a>.</p>
            </div>
        </div>
      </body>
    `
  };
  return data;
};


export const emailTemplate = {
  createAccount,
  resetPassword,
  ticketSecret,
};
