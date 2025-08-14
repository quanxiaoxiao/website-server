import createError from 'http-errors';

import {
  Website as WebsiteModel,
  WebsiteOperation as WebsiteOperationModel,
} from '#models.mjs';

const joinHref = (websiteItem, websiteHrefItem) => {
  let result = `${websiteHrefItem.protocol}//${websiteItem.hostname}`;
  if (websiteHrefItem.protocol === 'https:' && websiteHrefItem.port !== 443) {
    result += `:${websiteHrefItem.port}`;
  }
  if (websiteHrefItem.protocol === 'http:' && websiteHrefItem.port !== 80) {
    result += `:${websiteHrefItem.port}`;
  }
  if (websiteHrefItem.querystring) {
    if (websiteHrefItem.pathname && websiteHrefItem.pathname !== '/') {
      result += `${websiteHrefItem.pathname}?${websiteHrefItem.querystring}`;
    } else {
      result += `/?${websiteHrefItem.querystring}`;
    }
  } else if (websiteHrefItem.pathname && websiteHrefItem.pathname !== '/') {
    result += `${websiteHrefItem.pathname}`;
  }
  return result;
};

export default async (websiteHrefItem, dateTime) => {
  const websiteItem = await WebsiteModel.findOne({
    _id: websiteHrefItem.website,
    invalid: {
      $ne: true,
    },
  });
  if (!websiteItem) {
    throw createError(404);
  }
  const websiteOperationItem = new WebsiteOperationModel({
    websiteHref: websiteHrefItem._id,
    href: joinHref(websiteItem, websiteHrefItem),
    dateTimeCreate: dateTime ?? Date.now(),
  });

  await websiteOperationItem.save();

  return websiteOperationItem;
};
