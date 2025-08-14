import { Website as WebsiteModel } from '#models.mjs';

export default async () => {
  const websiteList = await WebsiteModel.aggregate([
    {
      $match: {
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
        pipeline: [
          {
            $match: {
              invalid: {
                $ne: true,
              },
            },
          },
        ],
      },
    },
  ]);
  return websiteList;
};
