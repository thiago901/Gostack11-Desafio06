import multer from 'multer';
import { resolve } from 'path';
import crypto from 'crypto';

const folderUpload = resolve(__dirname, '..', '..', 'tmp');
export default {
  folderUpload,
  storage: multer.diskStorage({
    destination: folderUpload,
    filename(req, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('hex');
      const filename = `${fileHash}-${file.originalname}`;
      return callback(null, filename);
    },
  }),
};
