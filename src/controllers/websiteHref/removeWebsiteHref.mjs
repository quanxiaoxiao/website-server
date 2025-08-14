import createError from 'http-errors';

import {
  Cron as CronModel,
  Website as WebsiteModel,
  WebsiteHref as WebsiteHrefModel,
  WebsiteOperation as WebsiteOperationModel,
} from '#models.mjs';

export default async (websiteHrefItem) => {
  const now = Date.now();
  const result = await WebsiteHrefModel.updateOne(
    {
      _id: websiteHrefItem._id,
      invalid: {
        $ne: true,
      },
    },
    {
      $set: {
        dateTimeInvalid: now,
        invalid: true,
      },
    },
  );
  if (result.modifiedCount === 0) {
    throw createError(404);
  }
  if (websiteHrefItem.crons && websiteHrefItem.crons.length > 0) {
    await CronModel.updateMany(
      {
        _id: {
          $in: websiteHrefItem.crons,
        },
        invalid: {
          $ne: true,
        },
      },
      {
        $set: {
          invalid: true,
          dateTimeInvalid: now,
        },
      },
    );
  }
  await WebsiteOperationModel.updateMany(
    {
      websiteHref: websiteHrefItem._id,
      invalid: {
        $ne: true,
      },
    },
    {
      $set: {
        dateTimeInvalid: now,
        invalid: true,
      },
    },
  );
  const matched = await WebsiteHrefModel.findOne({
    website: websiteHrefItem.website,
    invalid: {
      $ne: true,
    },
  });
  if (!matched) {
    await WebsiteModel.updateOne(
      {
        _id: websiteHrefItem.website,
        invalid: {
          $ne: true,
        },
      },
      {
        $set: {
          dateTimeInvalid: now,
          invalid: true,
        },
      },
    );
  }
};
