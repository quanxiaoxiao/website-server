import createError from 'http-errors';

import { WebsiteHref as WebsiteHrefModel } from '#models.mjs';

export default async (websiteHrefItem) => {
  const [websiteHrefItemWithMaxOrder] = await WebsiteHrefModel
    .aggregate([
      {
        $match: {
          invalid: {
            $ne: true,
          },
          order: {
            $ne: null,
          },
        },
      },
      {
        $sort: {
          order: -1,
        },
      },
      {
        $limit: 1,
      },
    ]);
  const websiteHrefItemNext = await WebsiteHrefModel.findOneAndUpdate(
    {
      _id: websiteHrefItem._id,
      invalid: {
        $ne: true,
      },
    },
    {
      $set: {
        order: websiteHrefItemWithMaxOrder ? websiteHrefItemWithMaxOrder.order + 1 : 1,
      },
    },
    {
      new: true,
    },
  );
  if (!websiteHrefItemNext) {
    throw createError(404);
  }
  return websiteHrefItemNext;
};
