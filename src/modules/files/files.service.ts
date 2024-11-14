import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { CreateFileDto } from './dto/create-file.dto';
import {
  isVideoFile,
  uploadFileToCloudinary,
} from 'src/common/helper/utils/helper-functions';
import { File } from 'src/shared/entities/file.schema';

@Injectable()
export class FilesService {
  constructor(@InjectModel(File.name) private fileModel: Model<File>) {}

  /**
   * Uploads a file to Cloudinary and creates a new File document in the database.
   *
   * @param file - The file to be uploaded.
   * @param body - Additional data for file creation, including tags.
   * @param userId - The ID of the user who owns the file.
   * @returns The newly created file document.
   */
  async upload(file, userId: string) {
    // Extract the original filename from the file object
    const filename = file.originalname;

    // Determine the file type based on the file extension
    const fileType = isVideoFile(filename) ? 'video' : 'image';

    // Destructure and log tags from the request body

    // Upload file to Cloudinary and get the result
    const fileResult: any = await uploadFileToCloudinary(file);

    // Retrieve the file with the highest current priority
    const lastPriorityFile: File = await this.fileModel
      .findOne()
      .sort({ priority: -1 }) // Sort in descending order by priority
      .exec();

    // Create a new file document with incremented priority
    const createdFile = new this.fileModel({
      tags: [],
      filename,
      fileType,
      fileUrl: fileResult && fileResult.secure_url, // Secure URL from Cloudinary
      owner: userId,
      priority: lastPriorityFile ? lastPriorityFile.priority + 1 : 1,
    });

    // Save and return the created file document
    return await createdFile.save();
  }

  /**
   * Retrieves a single file by its ID.
   *
   * @param id - The ID of the file to retrieve.
   * @returns The file document with the given ID.
   */
  async getFile(id: string) {
    // Retrieve the file document with the given ID
    return await this.fileModel.findOne({ _id: id });
  }

  /**
   * Retrieves all files belonging to a specific user, sorted by priority.
   *
   * @param userId - The ID of the user whose files are to be retrieved.
   * @returns A promise that resolves to an array of file documents sorted by priority.
   */
  async getFiles(userId: string) {
    // Find all file documents where the owner matches the given user ID
    // Sort the results in ascending order by priority
    return await this.fileModel.find({ owner: userId }).sort({ priority: 1 });
  }

  /**
   * Updates the priority of one or more files.
   *
   * @param body - An array of objects, each containing the file ID and the new priority.
   * @returns A promise that resolves to a string indicating the success of the operation.
   */
  async updatePriority(body) {
    // Iterate over each file to be updated
    body.map(async (info) => {
      // Update the file document with the new priority
      await this.fileModel.updateOne(
        {
          _id: info._id,
        },
        {
          priority: info.priority,
        },
      );
    });
    // Return a success message once all updates are complete
    return 'Priority Updated Successfully';
  }

  /**
   * Updates the view count for a file by its ID.
   *
   * @param id - The ID of the file whose view count is to be updated.
   * @returns A promise that resolves to a success message indicating the view count was updated.
   */
  async updateView(id: string, userId: string) {
    // Retrieve the file document with the given ID
    const file = await this.getFile(id);

    // Increment the totalViews count by 1 and update the file document
    await this.fileModel.updateOne(
      { _id: id },
      { totalViews: file.totalViews + 1 },
    );

    // Return a success message indicating the view count update
    return 'View Updated Successfully';
  }
}
