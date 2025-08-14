import getWebsites from '#controllers/website/getWebsites.mjs';

export default {
  '/api/websites': {
    get: async (ctx) => {
      const websiteList = await getWebsites();

      ctx.response = {
        data: websiteList,
      };
    },
  },
};
