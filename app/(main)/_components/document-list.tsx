"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { FileIcon } from "lucide-react";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

import { Item } from "./item";

interface DocumentListProps {
  parentDocumentId?: Id<"documents">;
  level?: number;
  data?: Doc<"documents">[]; // Doc is type of document schema
}

export const DocumentList = ({
  parentDocumentId,
  level = 0,
}: DocumentListProps) => {
  const params = useParams();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const onExpand = (documentId: string) => {
    setExpanded((prevExpanded) =>
      // return obj
      ({
        ...prevExpanded, // 把所有 previous expanded documents 加回去
        // [documentId] -> 找到我們要 expand 的 document ID
        // !prevExpanded[documentId] -> toggle 我們要 expand 的 document ID 的值
        [documentId]: !prevExpanded[documentId],
      })
    );
  };

  const documents = useQuery(api.documents.getSidebar, {
    parentDocument: parentDocumentId,
  });

  const onRedirect = (documentId: string) => {
    router.push(`/documents/${documentId}`);
  };

  // 在 convex 中 useQuery 如果返回 undefined 表示正在 loading
  if (documents === undefined) {
    return (
      <>
        <Item.Skeleton level={level} />
        {level === 0 && (
          <>
            <Item.Skeleton level={level} />
            <Item.Skeleton level={level} />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <p
        style={{ paddingLeft: level ? `${level * 12 + 25}px` : undefined }}
        className={cn(
          "hidden text-sm font-medium text-muted-foreground/80",
          expanded && "last:block", // 下面 map documents 時，如果 documents 為空陣列就不會渲染元素，這個 p tag 就會是最後一個元素，當這個 p tag 是最後一個元素時 last:block 就會生效，顯示 No pages inside
          level === 0 && "hidden"
        )}
      >
        No pages inside
      </p>
      {/* debug 用 */}
      {console.log("parentDocumentId: ", parentDocumentId)}
      {console.log("documents: ", documents)}
      {console.log("expanded: ", expanded)}
      {/* 
        documents table 是一個自關聯的模型，最上層的節點的 parentDocument 為 undefined ，如果這個節點的 id 是 123 則他下層節點的 parentDocument field 會記錄 123 ，表示 id 123 是他的父節點

        所以要拿到這個節點下的所有節點要 query parentDocument 為 undefined 的 record ，拿到這個 record 的 id ，假如這個 id 是 123 ，就再 query parentDocument 為 123 的 record

        實作出來就會是先 call DocumentList function component ，傳入的 parentDocumentId 是 undefined ，因為我們要拿到所有最上層的節點，拿到之後再用 map 遍歷所有最上層的節點，再用 recursive 的方式在 DocumentList function component 裡面 call DocumentList function component ，傳入的 parentDocumentId 是最上層節點的 id ， query documents table 找到 parentDocument 是這個 id 的所有記錄，這就會是這個 id 的下一層節點，也就是第二層節點，因為下一層節點的 parentDocument 欄位會記錄父層節點的 id ，再用 map 遍歷這層節點，把這層節點的 id 拿去query documents table 找到 parentDocument 是這個 id 的所有記錄，也就是 map 遍歷這層節點的下層節點，通過這種方式不斷去找找下一層節點直到沒有資料就表示已經找到最下層了，也就遍歷完所有文件了。

        但是這邊有做一些優化，沒有直接遍歷完所有好貸節點，只遍歷被展開的下一層子節點，因為我們只需要知道被展開的文件下有什麼子節點，不需要知道他的所有後代節點
      */}
      {documents.map((document) => (
        <div key={document._id}>
          <Item
            id={document._id}
            onClick={() => onRedirect(document._id)}
            label={document.title}
            icon={FileIcon}
            documentIcon={document.icon}
            active={params.documentId === document._id}
            level={level}
            onExpand={() => onExpand(document._id)}
            expanded={expanded[document._id]}
          />
          {expanded[document._id] && (
            <DocumentList parentDocumentId={document._id} level={level + 1} />
          )}
        </div>
      ))}
    </>
  );
};
