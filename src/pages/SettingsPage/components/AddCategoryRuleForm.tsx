import { useState } from "react";
import { addCategoryRule } from "../../../data/categories/addCategoryRule";

type Props = {
  categoryId: string;
};

export function AddCategoryRuleForm({ categoryId }: Props) {
  const [pattern, setPattern] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!pattern.trim()) return;

    setIsSubmitting(true);
    try {
      await addCategoryRule({
        categoryId,
        pattern: pattern.trim(),
      });
      setPattern("");
    } catch {
      alert("ルールの追加に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="マッチさせる文言を入力"
        className="input input-bordered input-sm flex-1"
        value={pattern}
        onChange={(e) => setPattern(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            void handleSubmit();
          }
        }}
      />
      <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={() => void handleSubmit()}
        disabled={!pattern.trim() || isSubmitting}
      >
        {isSubmitting ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          "ルールを追加"
        )}
      </button>
    </div>
  );
}
