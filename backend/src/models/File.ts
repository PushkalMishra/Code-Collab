import mongoose, { Schema, Document } from 'mongoose';

interface IFile extends Document {
  name: string;
  content: string;
  language: string;
  owner: mongoose.Schema.Types.ObjectId;
  roomId: string;
  sharedWith: mongoose.Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema: Schema = new Schema({
  name: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'javascript'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: String,
    required: true
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
fileSchema.pre<IFile>('save', function(next) {
  this.updatedAt = new Date(Date.now());
  next();
});

const File = mongoose.model<IFile>('File', fileSchema);

export default File;