import * as jwt from 'jsonwebtoken';

export const generateToken = (onwerId: string) => {
  return jwt.sign({ id: onwerId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export const validateToken = (token: string) => {
  const r = jwt.verify(token, process.env.JWT_SECRET);
  return r;
};
