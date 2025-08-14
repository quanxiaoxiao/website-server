import createError from 'http-errors';

import { WebsiteHref as WebsiteHrefModel } from '#models.mjs';

const isHrefChanged = (a, b) =>
  a.protocol !== b.protocol ||
 a.pathname !== b.pathname ||
 a.querystring !== b.querystring;

export default async (websiteHrefItem, input) => {
  const websiteHrefItemNext = Object.assign({}, websiteHrefItem.toObject?.() || websiteHrefItem, input);
  const tempInstance = new WebsiteHrefModel(websiteHrefItemNext);
  try {
    await tempInstance.validate();
  } catch (error) {
    throw createError(400, JSON.stringify(error.errors));
  }

  if (isHrefChanged(websiteHrefItem, websiteHrefItemNext)) {
    const matched = await WebsiteHrefModel.findOne({
      _id: {
        $ne: websiteHrefItem._id,
      },
      invalid: {
        $ne: true,
      },
      website: websiteHrefItemNext.website,
      protocol: websiteHrefItemNext.protocol,
      pathname: websiteHrefItemNext.pathname,
      querystring: websiteHrefItemNext.querystring,
    });
    if (matched) {
      throw createError(403);
    }
  }

  const result = await WebsiteHrefModel.updateOne(
    {
      _id: websiteHrefItem._id,
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

  if (result.modifiedCount === 0) {
    throw createError(404);
  }

  return websiteHrefItemNext;
};
