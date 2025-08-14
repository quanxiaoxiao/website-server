import { isValidObjectId } from '@quanxiaoxiao/mongo';
import createError from 'http-errors';

import { Website as WebsiteModel } from '#models.mjs';

const getOrderList = async () => {
  const websiteList = await WebsiteModel
    .find({
      invalid: {
        $ne: true,
      },
    })
    .lean();
  return websiteList
    .sort((a, b) => {
      if (a.order == null) {
        return 2;
      }
      if (b.order == null) {
        return -2;
      }
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
  const websiteList = await WebsiteModel
    .find({
      _id: {
        $in: orderList,
      },
      invalid: {
        $ne: true,
      },
    })
    .lean();
  if (websiteList.length !== orderList.length) {
    throw createError(403);
  }
  const updates = [];
  for (let i = 0; i < orderList.length; i++) {
    const website = orderList[i];
    updates.push({
      updateOne: {
        filter: {
          _id: website,
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
  await WebsiteModel.updateMany(
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
  await WebsiteModel.bulkWrite(updates);
  const ret = await getOrderList();
  return ret;
};
