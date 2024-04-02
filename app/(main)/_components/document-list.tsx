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

  // debug 用，看 expanded state
  // useEffect(() => {
  //   console.log(expanded);
  // }, []);
  // useEffect(() => {
  //   console.log(expanded);
  // }, [expanded]);

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
