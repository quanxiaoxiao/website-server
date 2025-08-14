import { isValidObjectId } from '@quanxiaoxiao/mongo';

import { WebsiteHref as WebsiteHrefModel } from '#models.mjs';

export default async (websiteHref) => {
  if (!isValidObjectId(websiteHref)) {
    return null;
  }
  const websiteHrefItem = await WebsiteHrefModel.findOne({
    _id: websiteHref,
    invalid: {
      $ne: true,
    },
  });
  return websiteHrefItem;
};
