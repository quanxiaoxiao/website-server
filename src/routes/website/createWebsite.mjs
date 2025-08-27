import {
  parseHttpPath,
  parseHttpUrl,
} from '@quanxiaoxiao/http-utils';
import createError from 'http-errors';
import _ from 'lodash';

import createWebsite from '#controllers/website/createWebsite.mjs';
import getWebsiteByHostname from '#controllers/website/getWebsiteByHostname.mjs';
import getWebsiteById from '#controllers/website/getWebsiteById.mjs';
import createWebsiteHref from '#controllers/websiteHref/createWebsiteHref.mjs';
import { WebsiteHref as WebsiteHrefModel } from '#models.mjs';

export default async ({
  href,
  ...input
}) => {
  let hrefParsedResult;
  try {
    hrefParsedResult = parseHttpUrl(href);
  } catch (error) {
    throw createError(400);
  }
  const {
    protocol,
    hostname,
    path,
    hash,
    port,
  } = hrefParsedResult;
  const [pathname, querystring] = parseHttpPath(path);
  let websiteItem = await getWebsiteByHostname(hostname);
  if (!websiteItem) {
    websiteItem = await createWebsite({
      hostname,
      ..._.pick(input, ['icon', 'name', 'description']),
    });
  } else {
    const matched = await WebsiteHrefModel.findOne({
      invalid: {
        $ne: true,
      },
      website: websiteItem._id,
      protocol,
      hash,
      port,
      pathname,
      querystring,
    });
    if (matched) {
      throw createError(403);
    }
  }
  await createWebsiteHref(websiteItem, {
    ...input,
    protocol,
    port,
    hash,
    pathname,
    querystring,
  });
  websiteItem = await getWebsiteById(websiteItem._id);
  if (!websiteItem) {
    throw createError(404);
  }
  return websiteItem;
};
