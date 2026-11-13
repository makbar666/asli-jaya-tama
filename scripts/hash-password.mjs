import { randomBytes, scryptSync } from 'node:crypto';
import { createInterface } from 'node:readline/promises';

const terminal = createInterface({ input: process.stdin, output: process.stdout });
const password = await terminal.question('Kata sandi admin (minimal 12 karakter): ');
terminal.close();
if (password.length < 12) {
  console.error('Kata sandi harus minimal 12 karakter.');
  process.exit(1);
}

const salt = randomBytes(16).toString('base64url');
const hash = scryptSync(password, salt, 64).toString('base64url');
console.log(`scrypt$${salt}$${hash}`);
