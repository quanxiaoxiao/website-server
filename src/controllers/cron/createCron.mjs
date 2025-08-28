import { CronExpressionParser } from 'cron-parser';
import createError from 'http-errors';

import logger from '#logger.mjs';
import { Cron as CronModel } from '#models.mjs';

// 58 17 * * 1-5
// 50 8 * * *

export default async (input) => {
  const cronItem = new CronModel({
    ...input,
  });
  try {
    await cronItem.validate();
  } catch (error) {
    throw createError(400, JSON.stringify(error.errors));
  }
  try {
    const interval = CronExpressionParser.parse(cronItem.value, {
      currentDate: new Date(),
      strict: true,
    });
    const [, secondary, thiry] = interval.take(3);
    const diff = Math.abs(new Date(secondary.toString()).valueOf() - new Date(thiry.toString()).valueOf());
    if (diff < 1000 * 60) {
      throw new Error('invalid must exceed 1 minute');
    }
  } catch (error) {
    throw createError(400);
  }
  await cronItem.save();
  logger.warn(`[createCron] ${JSON.stringify(input)}`);
  return cronItem;
};
