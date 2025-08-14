import createError from 'http-errors';

import logger from '#logger.mjs';
import {
  Cron as CronModel,
  Website as WebsiteModel,
  WebsiteHref as WebsiteHrefModel,
  WebsiteOperation as WebsiteOperationModel,
} from '#models.mjs';

export default async (websiteItem) => {
  const now = Date.now();
  const result = await WebsiteModel.updateOne(
    {
      _id: websiteItem._id,
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

  if (result.modifiedCount === 0) {
    throw createError(404);
  }

  if (websiteItem.list.length > 0) {
    await Promise.all(websiteItem.list.map(async (acc, websiteHrefItem) => {
      await acc;
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
    }));
  }
  await WebsiteHrefModel.updateMany(
    {
      website: websiteItem._id,
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

  logger.warn('[removeWebsite]', websiteItem._id.toString());
};
