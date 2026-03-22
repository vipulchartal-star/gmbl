import jwt from 'jsonwebtoken';

import { config } from './config.js';

export const issueToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      loginId: user.login_id,
      username: user.username,
    },
    config.jwtSecret,
    { expiresIn: '7d' },
  );
};

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing bearer token.' });
    return;
  }

  const token = header.slice('Bearer '.length);

  try {
    req.auth = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
