import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IContact, IPublic } from './public.interface';

import { emailHelper } from '../../../helpers/emailHelper';

import { Public } from './public.model';
import { emailTemplate } from '../../../shared/emailTemplate';

import { USER_ROLE } from '../user/user.constants';
import { User } from '../user/user.model';

const createPublic = async (payload: IPublic) => {
  const isExist = await Public.findOne({
    type: payload.type,
  });
  if (isExist) {
    await Public.findByIdAndUpdate(
      isExist._id,
      {
        $set: {
          content: payload.content,
        },
      },
      {
        new: true,
      }
    );
  } else {
    const result = await Public.create(payload);
    if (!result)
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create Public');
  }

  return `${payload.type} created successfully}`;
};

const getAllPublics = async (
  type: 'privacy-policy' | 'terms-and-condition'
) => {
  const result = await Public.findOne({ type: type }).lean();
  return result;
};

const deletePublic = async (id: string) => {
  const result = await Public.findByIdAndDelete(id);
  return result;
};

const createContact = async (payload: IContact) => {
  try {
    // Find admin user to send notification
    const admin = await User.findOne({ role: USER_ROLE.SUPER_ADMIN }).lean();
    console.log(admin);
    if (!admin || !admin.email) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Admin user not found'
      );
    }

    // Send email notification to admin
    const adminEmailData = {
      name: admin.name,
      email: admin.email,
      message: payload.message,
      isAdmin: true, // Flag to indicate this is for admin
    };

    const adminContact = emailTemplate.contactConfirmation(adminEmailData);
    await emailHelper.sendEmail(adminContact);

    // Send confirmation email to user
    const emailData = {
      name: payload.name,
      email: payload.email,
      message: payload.message,
      isAdmin: false, // Flag to indicate this is for user
    };
    const contactTemplate = emailTemplate.contactConfirmation(emailData);
    await emailHelper.sendEmail(contactTemplate);

    return {
      message: 'Contact form submitted successfully',
    };
  } catch (error) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to submit contact form'
    );
  }
};

export const PublicServices = {
  createPublic,
  getAllPublics,
  deletePublic,
  createContact,
};
