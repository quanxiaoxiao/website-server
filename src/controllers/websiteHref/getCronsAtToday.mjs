import { CronExpressionParser } from 'cron-parser';
import dayjs from 'dayjs';

import getWebsiteHrefCrons from './getWebsiteHrefCrons.mjs';

const generate = (cronItem) => {
  const interval = CronExpressionParser.parse(cronItem.value, {
    currentDate: dayjs().startOf('day').toDate(),
    strict: true,
  });
  const [dateStart] = interval.take(1);
  if (!dateStart) {
    return [];
  }
  const dateTimeList = [];
  let date = new Date(dateStart.toString());
  const now = Date.now();
  while (dayjs(now).isSame(date, 'day')) {
    dateTimeList.push(date.valueOf());
    date = new Date(interval.next().toString());
  }
  return dateTimeList;
};

export default async () => {
  const cronList = await getWebsiteHrefCrons();
  const result = [];
  for (let i = 0; i < cronList.length; i++) {
    const cronItem = cronList[i];
    const dateTimeList = generate(cronItem);
    for (let j = 0; j < dateTimeList.length; j++) {
      result.push({
        website: cronItem.website,
        websiteHref: cronItem.websiteHref,
        cron: cronItem._id,
        dateTime: dateTimeList[j],
      });
    }
  }
  return result;
};
