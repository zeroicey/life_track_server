import mongoose from 'mongoose';

// Memo Group Schema
const memoGroupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true 
  },
  description: { 
    type: String, 
    required: true 
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

// Memo Schema
const memoSchema = new mongoose.Schema({
  group_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MemoGroup',
    required: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  attach: {
    type: [String],
    default: [],
    validate: [
      (array: string[]) => array.length <= 9,
      'Attach array cannot contain more than 9 items'
    ]
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

export const MemoModel = mongoose.model('Memo', memoSchema);
export const MemoGroupModel = mongoose.model('MemoGroup', memoGroupSchema); 