import { fail, send, session } from '../server/cms-lib.mjs';

const DEFAULT_FOLDER_ID = '1lIegtho751s1vbYxGzqPKypC8QcPZVa_';
const clientPattern = /^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/;
const folderPattern = /^[A-Za-z0-9_-]{10,100}$/;

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return send(res, 405, { error: 'Metode tidak didukung.' });
    if (!await session(req)) return send(res, 401, { error: 'Silakan masuk kembali.' });
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID || '';
    const folderId = process.env.DRIVE_UPLOAD_FOLDER_ID || DEFAULT_FOLDER_ID;
    const enabled = clientPattern.test(clientId) && folderPattern.test(folderId);
    return send(res, 200, {
      enabled,
      clientId: enabled ? clientId : null,
      folderId: enabled ? folderId : null,
    });
  } catch (error) {
    return fail(res, error);
  }
}
