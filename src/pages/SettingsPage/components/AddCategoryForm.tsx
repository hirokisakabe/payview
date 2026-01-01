import { useState } from "react";
import { addCategory } from "../../../data/categories/addCategory";

export function AddCategoryForm() {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    const result = await addCategory({ name: name.trim() });
    setIsSubmitting(false);

    if (result.isErr()) {
      alert(result.error.message);
      return;
    }

    setName("");
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="新しいカテゴリ名"
        className="input input-bordered flex-1"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            void handleSubmit();
          }
        }}
      />
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => void handleSubmit()}
        disabled={!name.trim() || isSubmitting}
      >
        {isSubmitting ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          "追加"
        )}
      </button>
    </div>
  );
}
