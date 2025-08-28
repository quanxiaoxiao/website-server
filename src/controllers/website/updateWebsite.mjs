import createError from 'http-errors';

import logger from '#logger.mjs';
import { Website as WebsiteModel } from '#models.mjs';

export default async (websiteItem, input) => {
  const websiteItemNext = Object.assign({}, websiteItem.toObject?.() || websiteItem, input);
  const tempInstance = new WebsiteModel(websiteItemNext);
  try {
    await tempInstance.validate();
  } catch (error) {
    throw createError(400, JSON.stringify(error.errors));
  }
  if (websiteItem.hostname !== websiteItemNext.hostname) {
    const matched = await WebsiteModel.findOne(
      {
        _id: {
          $ne: websiteItem._id,
        },
        hostname: websiteItemNext.hostname,
        invalid: {
          $ne: true,
        },
      },
    );
    if (matched) {
      throw createError(403, `hostname ${input.hostname} alreay exist`);
    }
  }
  const result = await WebsiteModel.updateOne(
    {
      _id: websiteItem._id,
      invalid: {
        $ne: true,
      },
    },
    {
      $set: {
        ...input,
      },
    },
  );
  if (result.matchedCount === 0) {
    throw createError(404);
  }
  logger.warn(`[updateWebsite] ${websiteItem._id.toString()} ${JSON.stringify(input)}`);
  return websiteItemNext;
};
