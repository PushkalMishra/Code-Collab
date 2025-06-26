import express from 'express';
import File from '../models/File';
import auth from '../middleware/auth';
import { Request, Response, NextFunction } from 'express';

// Extend Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: { _id: string };
    }
  }
}

const router = express.Router();

// Create a new file
router.post('/', auth, async (req: Request, res: Response) => {
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
  
      const file = new File({
        name,
        content,
        language,
        roomId,
        owner: req.user._id
      });
      await file.save();

      // Populate the owner field before sending the response
      const populatedFile = await File.findById(file._id).populate('owner', 'username');

      console.log('File created successfully:', populatedFile);
      res.status(201).json(populatedFile); // Send the populated file
    } catch (error: any) {
      console.error('Error creating file in route handler:', error); // ADD THIS LINE
      res.status(400).json({ message: error.message });
    }
  });
  
  // ... rest of the file ...

// Get all files for a user in a specific room
router.get('/room/:roomId', auth, async (req: Request, res: Response) => {
  try {
    const currentRoomId = req.params.roomId;
    const currentUserId = req.user?._id;

    console.log('Backend: Fetching files for RoomId:', currentRoomId, 'and UserId:', currentUserId); // ADD THIS LOG

    const files = await File.find({
      roomId: currentRoomId,
      $or: [
        { owner: currentUserId },
        { sharedWith: currentUserId }
      ]
    }).populate('owner', 'username');
    console.log('Files retrieved for room:', currentRoomId, 'Result count:', files.length, 'Files:', files); // MODIFIED LOG
    res.json(files);
  } catch (error: any) {
    console.error('Error fetching files for room:', req.params.roomId, error); // ADD THIS LOG
    res.status(500).json({ message: error.message });
  }
});

// Get all files owned by the user
router.get('/my-files', auth, async (req: Request, res: Response) => {
  try {
    const files = await File.find({ owner: req.user?._id })
      .populate('sharedWith', 'username');
    res.json(files);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Update file content
router.patch('/:fileId', auth, async (req: Request, res: Response) => {
  try {
    // Allow any authenticated user to update any file
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const { content, name, language } = req.body;
    if (content !== undefined) file.content = content;
    if (name !== undefined) file.name = name;
    if (language !== undefined) file.language = language;

    await file.save();
    res.json(file);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Share file with other users
router.post('/:fileId/share', auth, async (req: Request, res: Response) => {
  try {
    const { userIds } = req.body;
    const file = await File.findOne({
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
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Delete file
router.delete('/:fileId', auth, async (req: Request, res: Response) => {
  try {
    const file = await File.findOne({
      _id: req.params.fileId,
      owner: req.user?._id
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found or access denied' });
    }

    await file.deleteOne(); // Changed from remove() to deleteOne() for Mongoose 6+
    res.json({ message: 'File deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;