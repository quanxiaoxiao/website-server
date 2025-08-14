import mongoose from 'mongoose';

const { Schema } = mongoose;

const websiteSchema = new Schema({
  hostname: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  title: {
    type: String,
  },
  pattern: {
    type: String,
  },
  icon: {
    type: String,
  },
  dateTimeCreate: {
    type: Number,
    default: Date.now,
    index: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  invalid: {
    type: Boolean,
    index: true,
    default: false,
  },
  order: {
    type: Number,
  },
  dateTimeInvalid: {
    type: Number,
  },
});

export default websiteSchema;
