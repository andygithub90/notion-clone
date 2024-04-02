import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(), // 用來軟刪除 documents
    // v.optional 表示 parentDocument 是可選的
    // v.id("documents") 表示 refer to documents 的 id ，表示這個 documents 是一個自關聯的模型
    // documents 的 parentDocument 字段會記錄 documents 的 id ，形成一個自關聯的模型
    parentDocument: v.optional(v.id("documents")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),
  })
    // 創建索引讓查詢更加快速
    .index("by_user", ["userId"]) // 用 userId 欄位建立索引， query 如果有用到 userId 查詢的話會比較快
    .index("by_user_parent", ["userId", "parentDocument"]), // 用 userId 和 parentDocument 的組合來 query sidebar 會用到的資料
});
