import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

const createToken = (payload: object, secret: string, expireTime: string | number) => {
  // Pass secret directly and ensure expireTime is a valid format (string or number)
  return jwt.sign(payload, secret, { expiresIn: expireTime });
};

const verifyToken = (token: string, secret: string) => {
  // Return the decoded payload with the secret
  return jwt.verify(token, secret) as JwtPayload;
};

export const jwtHelper = { createToken, verifyToken };
