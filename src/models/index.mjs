import mongoose from 'mongoose';

import cronSchema from './cron.mjs';
import websiteSchema from './website.mjs';
import websiteHrefSchema from './websiteHref.mjs';
import websiteOperationSchema from './websiteOperation.mjs';

export const Website = mongoose.model('Website', websiteSchema);
export const WebsiteOperation = mongoose.model('WebsiteOperation', websiteOperationSchema);
export const WebsiteHref = mongoose.model('WebsiteHref', websiteHrefSchema);
export const Cron = mongoose.model('Cron', cronSchema);
