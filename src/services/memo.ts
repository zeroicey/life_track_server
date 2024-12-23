import { MemoModel } from "../models/memo";
import { Types } from "mongoose";

export interface IMemo {
  text: string;
}

export class MemoService {
  private static extractTags(text: string): string[] {
    // 使用 Unicode 属性匹配所有语言的文字、数字和下划线
    // \p{L} 匹配任何语言的字母
    // \p{N} 匹配任何数字
    // \p{M} 匹配组合记号（例如声调符号）
    const regex = /#([\p{L}\p{N}\p{M}_]+)/gu;
    const matches = text.matchAll(regex);
    return Array.from(new Set(Array.from(matches, (m) => m[1])));
  }

  static async createMemo(data: IMemo) {
    const tags = this.extractTags(data.text);

    const memo = new MemoModel({
      text: data.text,
      tags,
    });
    return await memo.save();
  }

  static async getAllMemos() {
    return await MemoModel.find().sort({ create_time: -1 });
  }

  static async getMemoById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid memo ID");
    }
    const memo = await MemoModel.findById(id);
    if (!memo) {
      throw new Error("Memo not found");
    }
    return memo;
  }

  static async updateMemo(id: string, data: IMemo) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid memo ID");
    }

    const tags = this.extractTags(data.text);

    const memo = await MemoModel.findByIdAndUpdate(
      id,
      { text: data.text, tags },
      { new: true }
    );
    if (!memo) {
      throw new Error("Memo not found");
    }
    return memo;
  }

  static async deleteMemo(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error("Invalid memo ID");
    }
    const memo = await MemoModel.findByIdAndDelete(id);
    if (!memo) {
      throw new Error("Memo not found");
    }
    return memo;
  }

  static async getMemosByTag(tag: string) {
    return await MemoModel.find({ tags: tag }).sort({ create_time: -1 });
  }

  static async getAllTags() {
    // 使用 MongoDB 的 distinct 命令获取所有唯一的标签
    const tags = await MemoModel.distinct('tags');
    return tags.sort(); // 按字母顺序排序返回
  }

  static async getMemosByDateRange(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // 确保结束日期是当天的最后一刻
    end.setHours(23, 59, 59, 999);
    
    return await MemoModel.find({
      create_time: {
        $gte: start,
        $lte: end
      }
    }).sort({ create_time: -1 });
  }
}
