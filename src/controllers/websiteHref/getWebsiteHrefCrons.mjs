import { WebsiteHref as WebsiteHrefModel } from '#models.mjs';

export default async () => {
  const cronList = await WebsiteHrefModel.aggregate([
    {
      $match: {
        crons: {
          $exists: true,
          $not: {
            $size: 0,
          },
        },
      },
    },
    {
      $lookup: {
        from: 'crons',
        localField: 'crons',
        foreignField: '_id',
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
    {
      $project: {
        website: 1,
        list: 1,
      },
    },
    {
      $unwind: {
        path: '$list',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $project: {
        _id: '$list._id',
        websiteHref: '$_id',
        website: '$website',
        value: '$list.value',
        description: '$list.description',
        dateTimeCreate: '$list.dateTimeCreate',
        isOnce: '$list.isOnce',
        enabled: '$list.enabled',
      },
    },
  ]);
  return cronList;
};
