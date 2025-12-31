import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type Tag } from "../../../data/db";
import { updateTag } from "../../../data/tags/updateTag";
import { deleteTag } from "../../../data/tags/deleteTag";
import { useTagRules } from "../../../data/tags/useTagRules";
import { TagRuleList } from "./TagRuleList";
import { AddTagRuleForm } from "./AddTagRuleForm";

type Props = {
  tag: Tag;
};

export function TagItem({ tag }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(tag.name);
  const rulesResult = useTagRules({ tagId: tag.id });

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: tag.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleUpdate = async () => {
    if (!editName.trim()) return;

    const result = await updateTag({ id: tag.id, name: editName.trim() });
    if (result.isErr()) {
      alert(result.error.message);
      return;
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `タグ「${tag.name}」を削除しますか？関連するルールも削除されます。`,
      )
    ) {
      return;
    }

    const result = await deleteTag({ id: tag.id });
    if (result.isErr()) {
      alert(result.error.message);
    }
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="bg-base-200 rounded-box overflow-hidden"
    >
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          className="btn btn-ghost btn-sm cursor-grab px-1"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-sm px-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "▼" : "▶"}
        </button>

        {isEditing ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              type="text"
              className="input input-bordered input-sm flex-1"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleUpdate();
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditName(tag.name);
                }
              }}
              autoFocus
            />
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => void handleUpdate()}
            >
              保存
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setIsEditing(false);
                setEditName(tag.name);
              }}
            >
              キャンセル
            </button>
          </div>
        ) : (
          <>
            <span className="flex-1 font-medium">{tag.name}</span>
            <span className="text-base-content/60 text-sm">
              {rulesResult.status === "completed"
                ? `${rulesResult.rules.length} ルール`
                : "..."}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setIsEditing(true)}
            >
              編集
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm text-error"
              onClick={() => void handleDelete()}
            >
              削除
            </button>
          </>
        )}
      </div>

      {isExpanded && (
        <div className="bg-base-300 border-base-content/10 border-t p-3">
          <div className="mb-3">
            <h4 className="text-base-content/80 mb-2 text-sm font-medium">
              マッチングルール
            </h4>
            {rulesResult.status === "loading" ? (
              <span className="loading loading-spinner loading-sm" />
            ) : rulesResult.rules.length === 0 ? (
              <p className="text-base-content/60 text-sm">ルールがありません</p>
            ) : (
              <TagRuleList rules={rulesResult.rules} />
            )}
          </div>
          <AddTagRuleForm tagId={tag.id} />
        </div>
      )}
    </li>
  );
}
