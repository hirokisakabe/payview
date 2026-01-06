import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  Bars2Icon,
} from "@heroicons/react/24/outline";
import { type Category } from "../../../data/db";
import { updateCategory } from "../../../data/categories/updateCategory";
import { deleteCategory } from "../../../data/categories/deleteCategory";
import { useCategoryRules } from "../../../data/categories/useCategoryRules";
import { CategoryRuleList } from "./CategoryRuleList";
import { AddCategoryRuleForm } from "./AddCategoryRuleForm";

type Props = {
  category: Category;
};

export function CategoryItem({ category }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const rulesResult = useCategoryRules({ categoryId: category.id });

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleUpdate = async () => {
    if (!editName.trim()) return;

    try {
      await updateCategory({
        id: category.id,
        name: editName.trim(),
      });
      setIsEditing(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `カテゴリ「${category.name}」を削除しますか？関連するルールも削除されます。`,
      )
    ) {
      return;
    }

    try {
      await deleteCategory({ id: category.id });
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました");
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
          <Bars2Icon className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-sm px-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
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
                  setEditName(category.name);
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
                setEditName(category.name);
              }}
            >
              キャンセル
            </button>
          </div>
        ) : (
          <>
            <span className="flex-1 font-medium">{category.name}</span>
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
              <CategoryRuleList rules={rulesResult.rules} />
            )}
          </div>
          <AddCategoryRuleForm categoryId={category.id} />
        </div>
      )}
    </li>
  );
}
