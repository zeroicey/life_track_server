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
  },
  memo_count: {
    type: Number,
    default: 0,
    min: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  memos: [{
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
    },
    created_at: { 
      type: Date, 
      default: Date.now 
    },
    updated_at: { 
      type: Date, 
      default: Date.now 
    }
  }]
});

// 更新 memo_count 的中间件
memoGroupSchema.pre('save', function(next) {
  if (this.isModified('memos')) {
    this.memo_count = this.memos.length;
    this.updated_at = new Date();
  }
  next();
});

// 添加虚拟字段以保持与前端接口兼容
memoGroupSchema.virtual('memosList').get(function() {
  return this.memos.map(memo => ({
    _id: memo._id,
    group_id: this._id,
    text: memo.text,
    attach: memo.attach,
    created_at: memo.created_at,
    updated_at: memo.updated_at
  }));
});

// 确保虚拟字段在 JSON 中可见
memoGroupSchema.set('toJSON', { virtuals: true });
memoGroupSchema.set('toObject', { virtuals: true });

// 导出模型
export const MemoGroupModel = mongoose.model('MemoGroup', memoGroupSchema);

// 类型定义
export interface IMemo {
  _id: string;
  text: string;
  attach: string[];
  created_at: Date;
  updated_at: Date;
}

export interface IMemoGroup {
  _id: string;
  name: string;
  description: string;
  memo_count: number;
  created_at: Date;
  updated_at: Date;
  memos: IMemo[];
  memosList: Array<IMemo & { group_id: string }>;
} 