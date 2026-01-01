import { useState } from "react";
import { addTagRule } from "../../../data/tags/addTagRule";

type Props = {
  tagId: string;
};

export function AddTagRuleForm({ tagId }: Props) {
  const [pattern, setPattern] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!pattern.trim()) return;

    setIsSubmitting(true);
    const result = await addTagRule({ tagId, pattern: pattern.trim() });
    setIsSubmitting(false);

    if (result.isErr()) {
      alert(result.error.message);
      return;
    }

    setPattern("");
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
