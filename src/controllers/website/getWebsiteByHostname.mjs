import { Website as WebsiteModel } from '#models.mjs';

export default async (hostname) => {
  const [websiteItem] = await WebsiteModel.aggregate([
    {
      $match: {
        hostname: hostname.trim(),
        invalid: {
          $ne: true,
        },
      },
    },
    {
      $lookup: {
        from: 'websitehrefs',
        localField: '_id',
        foreignField: 'website',
        as: 'list',
      },
    },
  ]);
  return websiteItem;
};
