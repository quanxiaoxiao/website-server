import createError from 'http-errors';

import { WebsiteHref as WebsiteHrefModel } from '#models.mjs';

export default async (websiteItem, input = {}) => {
  const websiteHrefItem = new WebsiteHrefModel({
    ...input,
    website: websiteItem._id,
  });
  try {
    await websiteHrefItem.validate();
  } catch (error) {
    throw createError(400, JSON.stringify(error.errors));
  }
  const matched = await WebsiteHrefModel.findOne({
    invalid: {
      $ne: true,
    },
    hash: websiteHrefItem.hash,
    website: websiteHrefItem.website,
    protocol: websiteHrefItem.protocol,
    pathname: websiteHrefItem.pathname,
    querystring: websiteHrefItem.querystring,
  });
  if (matched) {
    throw createError(403);
  }
  await websiteHrefItem.save();
  return websiteHrefItem;
};
