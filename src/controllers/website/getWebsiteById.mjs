import { isValidObjectId } from '@quanxiaoxiao/mongo';
import mongoose from 'mongoose';

import { Website as WebsiteModel } from '#models.mjs';

export default async (website) => {
  if (!isValidObjectId(website)) {
    return null;
  }
  const [websiteItem] = await WebsiteModel.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(website),
        invalid: {
          $ne: true,
        },
      },
    },
    {
      $lookup: {
        from: 'websitehrefs',
        localField: '_id',
        foreignField: 'website',
        as: 'list',
        pipeline: [
          {
            $match: {
              invalid: {
                $ne: true,
              },
            },
          },
        ],
      },
    },
  ]);
  return websiteItem;
};
