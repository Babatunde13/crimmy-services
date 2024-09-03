import * as jwt from 'jsonwebtoken';

export const generateToken = (userid: string) => {
  return jwt.sign({ id: userid }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export const validateToken = (token: string) => {
  const r = jwt.verify(token, process.env.JWT_SECRET);
  return r;
};
