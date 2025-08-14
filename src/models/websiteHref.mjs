import mongoose from 'mongoose';

const { Schema } = mongoose;

const websiteHrefSchema = new Schema({
  website: {
    type: Schema.Types.ObjectId,
    ref: 'Website',
    required: true,
    index: true,
  },
  name: {
    type: String,
    trim: true,
  },
  hash: {
    type: String,
    trim: true,
  },
  protocol: {
    type: String,
    enum: [
      'http:',
      'https:',
    ],
    default: 'https:',
  },
  icon: {
    type: String,
  },
  port: {
    type: Number,
    min: 0,
    max: 65535,
    default: 443,
  },
  dateTimeCreate: {
    type: Number,
    default: Date.now,
    index: true,
  },
  dateTimeUpdate: {
    type: Number,
    default: Date.now,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  pathname: {
    type: String,
    trim: true,
    default: '/',
    validate: {
      validator: (s) => {
        if (!s) {
          return true;
        }
        return /^\//.test(s);
      },
      message: 'pathname invalid',
    },
  },
  querystring: {
    type: String,
    default: '',
  },
  categories: {
    type: [String],
    validate: {
      validator: (arr) => Array.isArray(arr) && new Set(arr).size === arr.length,
      message: 'duplicate values',
    },
  },
  order: {
    type: Number,
    index: true,
  },
  crons: [{
    type: Schema.Types.ObjectId,
    ref: 'Cron',
  }],
  invalid: {
    type: Boolean,
    index: true,
    default: false,
  },
  dateTimeInvalid: {
    type: Number,
  },
});

export default websiteHrefSchema;
