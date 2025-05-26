import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    content: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['file', 'directory'],
        required: true
    },
    parentId: {
        type: String,
        default: null
    },
    roomId: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Create compound index for roomId and id
fileSchema.index({ roomId: 1, id: 1 }, { unique: true });

const File = mongoose.model('File', fileSchema);

export default File; 