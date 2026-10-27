import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dtqsa2oh',
  api_key: process.env.CLOUDINARY_API_KEY || '738738788838782',
  api_secret: process.env.CLOUDINARY_API_SECRET || '-P7fY8H8PDfAgMxfHMSnwnOXZAg',
  secure: true,
});

export default cloudinary;
