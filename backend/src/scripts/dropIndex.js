const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codecollab';

async function dropIndex() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      if (collection.name === 'files') {
        console.log('Found files collection, dropping problematic indexes...');
        
        // Get all indexes
        const indexes = await db.collection('files').indexes();
        console.log('Current indexes:', indexes.map(idx => idx.name));
        
        // Drop specific indexes
        try {
          await db.collection('files').dropIndex('id_1');
          console.log('Successfully dropped index id_1');
        } catch (err) {
          console.log('Index id_1 not found or already dropped');
        }
        
        try {
          await db.collection('files').dropIndex('roomId_1_id_1');
          console.log('Successfully dropped index roomId_1_id_1');
        } catch (err) {
          console.log('Index roomId_1_id_1 not found or already dropped');
        }
        
        // Show remaining indexes
        const remainingIndexes = await db.collection('files').indexes();
        console.log('Remaining indexes:', remainingIndexes.map(idx => idx.name));
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

dropIndex(); 