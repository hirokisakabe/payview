import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bars2Icon } from "@heroicons/react/24/outline";
import { type CategoryRule } from "../../../data/db";
import { updateCategoryRule } from "../../../data/categories/updateCategoryRule";
import { deleteCategoryRule } from "../../../data/categories/deleteCategoryRule";

type Props = {
  rule: CategoryRule;
};

export function CategoryRuleItem({ rule }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editPattern, setEditPattern] = useState(rule.pattern);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleUpdate = async () => {
    if (!editPattern.trim()) return;

    try {
      await updateCategoryRule({
        id: rule.id,
        pattern: editPattern,
      });
      setIsEditing(false);
    } catch {
      alert("ルールの更新に失敗しました。");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`ルール「${rule.pattern}」を削除しますか？`)) {
      return;
    }

    try {
      await deleteCategoryRule({ id: rule.id });
    } catch {
      alert("ルールの削除に失敗しました。");
    }
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="bg-base-100 flex items-center gap-2 rounded p-2"
    >
      <button
        type="button"
        className="btn btn-ghost btn-xs cursor-grab px-1"
        {...attributes}
        {...listeners}
      >
        <Bars2Icon className="h-4 w-4" />
      </button>

      {isEditing ? (
        <div className="flex flex-1 items-center gap-2">
          <input
            type="text"
            className="input input-bordered input-xs flex-1"
            value={editPattern}
            onChange={(e) => setEditPattern(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleUpdate();
              if (e.key === "Escape") {
                setIsEditing(false);
                setEditPattern(rule.pattern);
              }
            }}
            autoFocus
          />
          <button
            type="button"
            className="btn btn-primary btn-xs"
            onClick={() => void handleUpdate()}
          >
            保存
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => {
              setIsEditing(false);
              setEditPattern(rule.pattern);
            }}
          >
            キャンセル
          </button>
        </div>
      ) : (
        <>
          <code className="bg-base-200 flex-1 rounded px-2 py-1 text-sm">
            {rule.pattern}
          </code>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => setIsEditing(true)}
          >
            編集
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-xs text-error"
            onClick={() => void handleDelete()}
          >
            削除
          </button>
        </>
      )}
    </li>
  );
}
