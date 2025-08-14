import mongoose from 'mongoose';

const { Schema } = mongoose;

const websiteOperationSchema = new Schema({
  dateTimeCreate: {
    type: Number,
    default: Date.now,
    index: true,
  },
  href: {
    type: String,
    required: true,
  },
  websiteHref: {
    type: Schema.Types.ObjectId,
    ref: 'WebsiteHref',
    required: true,
    index: true,
  },
  invalid: {
    type: Boolean,
    index: true,
    default: false,
  },
  dateTimeInvalid: {
    type: Number,
  },
});

export default websiteOperationSchema;
