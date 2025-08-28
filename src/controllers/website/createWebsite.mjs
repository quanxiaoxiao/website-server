import createError from 'http-errors';

import logger from '#logger.mjs';
import { Website as WebsiteModel } from '#models.mjs';

export default async (input) => {
  const websiteItem = new WebsiteModel({
    ...input,
  });
  try {
    await websiteItem.validate();
  } catch (error) {
    console.log(input);
    throw createError(400, JSON.stringify(error.errors));
  }

  const matched = await WebsiteModel.findOne(
    {
      hostname: websiteItem.hostname,
      invalid: {
        $ne: true,
      },
    },
  );
  if (matched) {
    throw createError(403);
  }

  await websiteItem.save();

  logger.warn(`[createWebsite] ${JSON.stringify(input)}`);

  return websiteItem;
};
