import { MemoModel } from "../models/memo";
import { Types } from "mongoose";

export interface IMemo {
  text: string;
}

export class MemoService {
  private static extractTags(text: string): string[] {
    const regex = /#\w+\s/g;
    const matches = text.match(regex) || [];
    return Array.from(new Set(matches.map((tag) => tag.trim().slice(1))));
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
}
