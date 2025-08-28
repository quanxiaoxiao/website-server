import createError from 'http-errors';

import logger from '#logger.mjs';
import { Cron as CronModel } from '#models.mjs';

// 58 17 * * 1-5

export default async (cronItem) => {
  const ret = await CronModel.updateOne(
    {
      _id: cronItem._id,
      invalid: {
        $ne: true,
      },
    },
    {
      $set: {
        invalid: true,
        dateTimeInvalid: Date.now(),
      },
    },
  );
  if (ret.matchedCount === 0) {
    throw createError(404);
  }
  logger.warn(`[removeCron] ${cronItem._id.toString()}`);
};
