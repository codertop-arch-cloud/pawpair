import mongoose from 'mongoose';

// Disable Mongoose query buffering globally. This must run before any model is imported.
mongoose.set('bufferCommands', false);
