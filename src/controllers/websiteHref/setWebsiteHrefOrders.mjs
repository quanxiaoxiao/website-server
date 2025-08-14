import { isValidObjectId } from '@quanxiaoxiao/mongo';
import createError from 'http-errors';

import { WebsiteHref as WebsiteHrefModel } from '#models.mjs';

const getOrderList = async () => {
  const websiteHrefList = await WebsiteHrefModel
    .find({
      invalid: {
        $ne: true,
      },
      order: {
        $ne: null,
      },
    })
    .lean();
  return websiteHrefList
    .sort((a, b) => {
      if (a.order === b.order) {
        return 0;
      }
      if (a.order > b.order) {
        return 1;
      }
      return -1;
    })
    .map((d) => d._id);
};

export default async (orderList) => {
  if (orderList.length === 0) {
    const ret = await getOrderList();
    return ret;
  }
  if (!orderList.some(isValidObjectId)) {
    throw createError(400);
  }

  const websiteHrefList = await WebsiteHrefModel
    .find({
      _id: {
        $in: orderList,
      },
      invalid: {
        $ne: true,
      },
    })
    .lean();

  if (websiteHrefList.length !== orderList.length) {
    throw createError(403);
  }
  const updates = [];
  for (let i = 0; i < orderList.length; i++) {
    const websiteHref = orderList[i];
    updates.push({
      updateOne: {
        filter: {
          _id: websiteHref,
          invalid: {
            $ne: true,
          },
        },
        update: {
          order: i,
        },
      },
    });
  }

  await WebsiteHrefModel.updateMany(
    {
      invalid: {
        $ne: true,
      },
    },
    {
      $set: {
        order: null,
      },
    },
  );
  await WebsiteHrefModel.bulkWrite(updates);
  const ret = await getOrderList();
  return ret;
};
