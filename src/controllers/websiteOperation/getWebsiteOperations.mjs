import { WebsiteOperation as WebsiteOperationModel } from '#models.mjs';

export default async () => {
  const websiteOperationList = await WebsiteOperationModel
    .find({
      invalid: {
        $ne: true,
      },
    })
    .lean();
  return websiteOperationList;
};
