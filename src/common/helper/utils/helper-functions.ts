import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadFileToCloudinary(file) {
  // Using the file.buffer directly instead of arrayBuffer()
  const buffer = file.buffer;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto' }, // auto-detects file type (image, video, etc.)
      (error, result) => {
        if (error) {
          reject(new Error(error.message)); // Handle upload error
        } else {
          resolve(result); // Resolve with Cloudinary upload result
        }
      },
    );

    // Pipe the buffer to Cloudinary upload stream
    uploadStream.end(buffer);
  });
}

const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase(); // Extract file extension and make it lowercase
};

const isVideoFile = (filename: string): boolean => {
  const videoExtensions = [
    '.mp4',
    '.avi',
    '.mov',
    '.webm',
    '.mkv',
    '.flv',
    '.wmv',
  ];
  const extension = getFileExtension(filename);
  return videoExtensions.includes(extension);
};

/**
 * Asynchronously compares a given password with a saved password
 * using the bcrypt algorithm.
 *
 * @param {string} password - The password to be compared.
 * @param {string} savedPassword - The saved password to be compared with.
 * @return {Promise<boolean>} - A promise that resolves to a boolean indicating
 * whether the passwords match.
 */
async function comparePassword(password: string, savedPassword: string) {
  // Compare the given password with the saved password using bcrypt.
  // The function returns a promise that resolves to a boolean indicating
  // whether the passwords match.
  return await bcrypt.compare(password, savedPassword);
}

/**
 * Generates a JSON Web Token (JWT) using the given data object.
 *
 * @param {Object} data - The data to be encoded in the JWT.
 * @return {string} - The generated JWT.
 */
function generateToken(data: object) {
  // Sign the data object using the JWT_SECRET environment variable as the secret key.
  // The JWT_EXPIRATION_TIME environment variable specifies the expiration time of the token.
  // The sign method returns a signed JSON web token.
  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });
}

export {
  comparePassword,
  generateToken,
  isVideoFile,
  getFileExtension,
  uploadFileToCloudinary,
};
