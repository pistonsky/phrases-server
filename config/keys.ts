import path from 'path';
import prod from './prod';

export interface Keys {
  DATABASE_URL: string | undefined;
}

// dev.js is gitignored and is not part of the TypeScript build. Compiled output
// lives in dist/config, so resolve the original config/dev.js from the repo root.
const keys: Keys =
  process.env.NODE_ENV === 'production' ? prod : require(path.join(__dirname, '..', '..', 'config', 'dev'));

export = keys;
