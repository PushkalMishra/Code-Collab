"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const File_1 = __importDefault(require("../models/File"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = express_1.default.Router();
// Create a new file
router.post('/', auth_1.default, async (req, res) => {
    console.log('Received file creation request. Body:', req.body, 'User:', req.user); // ADD THIS LINE
    try {
        const { name, content, language, roomId } = req.body;
        // ADD EXPLICIT VALIDATION
        if (!name) {
            console.error('Validation failed: Missing file name.');
            return res.status(400).json({ message: 'File name is required.' });
        }
        if (!roomId) {
            console.error('Validation failed: Missing roomId.');
            return res.status(400).json({ message: 'Room ID is required.' });
        }
        if (!req.user?._id) {
            console.error('Validation failed: Missing owner ID from authentication middleware.');
            return res.status(400).json({ message: 'Owner ID is required and missing from authentication.' });
        }
        const file = new File_1.default({
            name,
            content,
            language,
            roomId,
            owner: req.user._id
        });
        await file.save();
        // Populate the owner field before sending the response
        const populatedFile = await File_1.default.findById(file._id).populate('owner', 'username');
        console.log('File created successfully:', populatedFile);
        res.status(201).json(populatedFile); // Send the populated file
    }
    catch (error) {
        console.error('Error creating file in route handler:', error); // ADD THIS LINE
        res.status(400).json({ message: error.message });
    }
});
// ... rest of the file ...
// Get all files for a user in a specific room
router.get('/room/:roomId', auth_1.default, async (req, res) => {
    try {
        const currentRoomId = req.params.roomId;
        const currentUserId = req.user?._id;
        console.log('Backend: Fetching files for RoomId:', currentRoomId, 'and UserId:', currentUserId); // ADD THIS LOG
        const files = await File_1.default.find({
            roomId: currentRoomId,
            $or: [
                { owner: currentUserId },
                { sharedWith: currentUserId }
            ]
        }).populate('owner', 'username');
        console.log('Files retrieved for room:', currentRoomId, 'Result count:', files.length, 'Files:', files); // MODIFIED LOG
        res.json(files);
    }
    catch (error) {
        console.error('Error fetching files for room:', req.params.roomId, error); // ADD THIS LOG
        res.status(500).json({ message: error.message });
    }
});
// Get all files owned by the user
router.get('/my-files', auth_1.default, async (req, res) => {
    try {
        const files = await File_1.default.find({ owner: req.user?._id })
            .populate('sharedWith', 'username');
        res.json(files);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Update file content
router.patch('/:fileId', auth_1.default, async (req, res) => {
    try {
        // Allow any authenticated user to update any file
        const file = await File_1.default.findById(req.params.fileId);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }
        const { content, name, language } = req.body;
        if (content !== undefined)
            file.content = content;
        if (name !== undefined)
            file.name = name;
        if (language !== undefined)
            file.language = language;
        await file.save();
        res.json(file);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Share file with other users
router.post('/:fileId/share', auth_1.default, async (req, res) => {
    try {
        const { userIds } = req.body;
        const file = await File_1.default.findOne({
            _id: req.params.fileId,
            owner: req.user?._id
        });
        if (!file) {
            return res.status(404).json({ message: 'File not found or access denied' });
        }
        // Add new users to sharedWith array
        file.sharedWith = [...new Set([...file.sharedWith, ...userIds])];
        await file.save();
        res.json(file);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Delete file
router.delete('/:fileId', auth_1.default, async (req, res) => {
    try {
        const file = await File_1.default.findOne({
            _id: req.params.fileId,
            owner: req.user?._id
        });
        if (!file) {
            return res.status(404).json({ message: 'File not found or access denied' });
        }
        await file.deleteOne(); // Changed from remove() to deleteOne() for Mongoose 6+
        res.json({ message: 'File deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
