import {
  WebsiteHref as WebsiteHrefModel,
  WebsiteOperation as WebsiteOperationModel,
} from '#models.mjs';

export default async (websiteItem) => {
  const websiteHrefList = await WebsiteHrefModel.find({
    invalid: {
      $ne: true,
    },
    website: websiteItem._id,
  });
  if (websiteHrefList.length === 0) {
    return [];
  }
  const websiteOperationList = await WebsiteOperationModel
    .find({
      websiteHref: {
        $in: websiteHrefList.map((d) => d._id),
      },
      invalid: {
        $ne: true,
      },
    })
    .lean();
  return websiteOperationList;
};
