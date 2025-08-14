import mongoose from 'mongoose';

const { Schema } = mongoose;

const cronSchema = new Schema({
  value: {
    trim: true,
    type: String,
    required: true,
  },
  isOnce: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  dateTimeLastExcute: {
    type: Number,
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
  dateTimeInvalid: {
    type: Number,
  },
});

export default cronSchema;
