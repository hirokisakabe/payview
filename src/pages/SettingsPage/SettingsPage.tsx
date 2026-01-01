import { useTags } from "../../data/tags/useTags";
import { TagList } from "./components/TagList";
import { AddTagForm } from "./components/AddTagForm";

export function SettingsPage() {
  const tagsResult = useTags();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-primary-content text-xl">タグ設定</h1>

      <div className="text-info text-sm">
        <p>タグを設定すると、項目名に含まれる文言でグループ分けができます。</p>
        <p>
          複数のルールがマッチした場合は、リストの上にあるタグが優先されます。
        </p>
      </div>

      <AddTagForm />

      {tagsResult.status === "loading" ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : tagsResult.tags.length === 0 ? (
        <div className="bg-base-200 rounded-box text-base-content/60 w-full p-8 text-center">
          <p>タグがまだありません</p>
          <p className="mt-2 text-sm">上のフォームからタグを追加してください</p>
        </div>
      ) : (
        <TagList tags={tagsResult.tags} />
      )}
    </div>
  );
}
