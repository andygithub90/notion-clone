import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

export const archive = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity(); // fetch currently logged in user using ctx

    // 如果 identity 不存在表示我們沒有登入，表示一個未被認證的用戶試著創建新的 document ，這是不被我們允許的，所以 throw new Error
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // 遞迴刪除 document ，如果這個 document 有任何子 document 都要刪除
    const recursiveArchive = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documentId)
        )
        .collect();

      // 不要在 forEach 或 map 裡用 promise ，因為 forEach 或 map 沒辦法處理 promise 或 async-await 這種非同步的代碼，可以參考下列文件：
      // https://gist.github.com/joeytwiddle/37d2085425c049629b80956d3c618971
      // https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: true,
        });

        await recursiveArchive(child._id);
      }
    };

    const document = await ctx.db.patch(args.id, {
      isArchived: true,
    });

    recursiveArchive(args.id);

    return document;
  },
});

export const getSidebar = query({
  args: {
    parentDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity(); // fetch currently logged in user using ctx

    // 如果 identity 不存在表示我們沒有登入，表示一個未被認證的用戶試著創建新的 document ，這是不被我們允許的，所以 throw new Error
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      // 因為我們查詢時會用到 userId, parentDocument 欄位，所以通過 convex/schema.ts 的 by_user_parent 索引去查詢會比較快
      .withIndex(
        "by_user_parent",
        // 通過 cb 的 parameter 拿到 query 物件，這裡命名為 q
        (q) => q.eq("userId", userId).eq("parentDocument", args.parentDocument)
      )
      // 留下 isArchived 為 false 的 documents
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      // Execute the query and return all of the results as an array.
      .collect();

    return documents;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    parenrDocument: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity(); // fetch currently logged in user using ctx

    // 如果 identity 不存在表示我們沒有登入，表示一個未被認證的用戶試著創建新的 document ，這是不被我們允許的，所以 throw new Error
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const document = await ctx.db.insert("documents", {
      title: args.title,
      parentDocument: args.parenrDocument,
      userId,
      isArchived: false,
      isPublished: false,
    });

    return document;
  },
});

export const getTrash = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity(); // fetch currently logged in user using ctx

    // 如果 identity 不存在表示我們沒有登入，表示一個未被認證的用戶試著創建新的 document ，這是不被我們允許的，所以 throw new Error
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), true))
      .order("desc") //https://docs.convex.dev/database/reading-data#ordering // https://docs.convex.dev/database/indexes/#sorting-with-indexes
      .collect();

    return documents;
  },
});

export const restore = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity(); // fetch currently logged in user using ctx

    // 如果 identity 不存在表示我們沒有登入，表示一個未被認證的用戶試著創建新的 document ，這是不被我們允許的，所以 throw new Error
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const recursiveRestore = async (documentId: Id<"documents">) => {
      const children = await ctx.db
        .query("documents")
        .withIndex("by_user_parent", (q) =>
          q.eq("userId", userId).eq("parentDocument", documentId)
        )
        .collect();

      for (const child of children) {
        await ctx.db.patch(child._id, {
          isArchived: false,
        });

        await recursiveRestore(child._id);
      }
    };

    // https://ithelp.ithome.com.tw/articles/10273198?sc=hot
    // Partial 幫你複製了一份 Type ，然後把裡頭的 property 設為 optional
    const options: Partial<Doc<"documents">> = { isArchived: false };

    if (existingDocument.parentDocument) {
      const parent = await ctx.db.get(existingDocument.parentDocument);
      if (parent?.isArchived) {
        options.parentDocument = undefined;
      }
    }

    const document = await ctx.db.patch(args.id, options);

    recursiveRestore(args.id);

    return document;
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity(); // fetch currently logged in user using ctx

    // 如果 identity 不存在表示我們沒有登入，表示一個未被認證的用戶試著創建新的 document ，這是不被我們允許的，所以 throw new Error
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.delete(args.id);

    return document;
  },
});

export const getSearch = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity(); // fetch currently logged in user using ctx

    // 如果 identity 不存在表示我們沒有登入，表示一個未被認證的用戶試著創建新的 document ，這是不被我們允許的，所以 throw new Error
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isArchived"), false))
      .order("desc")
      .collect();

    return documents;
  },
});

export const getById = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity(); // fetch currently logged in user using ctx

    const document = await ctx.db.get(args.documentId);

    if (!document) {
      throw new Error("Not found");
    }

    // 如果 document 是公開且不是 Archived 的話不用身份驗證也能存取
    if (document.isPublished && !document.isArchived) {
      return document;
    }

    // 身份沒有通過驗證時拋錯
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // 如果這個 document 的 userId 和當前登入的使用者的 userId 不匹配時拋出錯誤：未授權
    if (document.userId !== userId) {
      throw new Error("Unauthorized");
    }

    return document;
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity(); // fetch currently logged in user using ctx

    // 身份沒有通過驗證時拋錯
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // 從 args 提取 id 用來查詢 document ，剩餘的 key value 可以傳進 patch function 來更新 document
    const { id, ...rest } = args;

    // 查詢傳進來的 id 是否存在於 documents 的 id 欄位
    const existingDocument = await ctx.db.get(args.id);

    // 如果 existingDocument 不存在拋出錯誤：Not found
    if (!existingDocument) {
      throw new Error("Not found");
    }

    // 如果這個 document 的 userId 和當前登入的使用者的 userId 不匹配時拋出錯誤：未授權
    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.patch(args.id, {
      ...rest,
    });

    return document;
  },
});

export const removeIcon = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity(); // fetch currently logged in user using ctx

    // 身份沒有通過驗證時拋錯
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.patch(args.id, {
      icon: undefined,
    });

    return document;
  },
});

export const removeCoverImage = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity(); // fetch currently logged in user using ctx

    // 身份沒有通過驗證時拋錯
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const existingDocument = await ctx.db.get(args.id);

    if (!existingDocument) {
      throw new Error("Not found");
    }

    if (existingDocument.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const document = await ctx.db.patch(args.id, {
      coverImage: undefined,
    });

    return document;
  },
});
