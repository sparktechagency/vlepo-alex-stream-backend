import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

const createToken = (payload: object, secret: Secret, expireTime: string) => {
  return jwt.sign(payload, secret as Secret, { expiresIn: expireTime });
};

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret as Secret) as JwtPayload;
};




export const jwtHelper = { createToken, verifyToken };
