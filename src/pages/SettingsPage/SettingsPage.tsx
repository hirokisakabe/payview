import { useCategories } from "../../data/categories/useCategories";
import { CategoryList } from "./components/CategoryList";
import { AddCategoryForm } from "./components/AddCategoryForm";

export function SettingsPage() {
  const categoriesResult = useCategories();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-primary-content text-xl">カテゴリ設定</h1>

      <div className="text-info text-sm">
        <p>
          カテゴリを設定すると、項目名に含まれる文言でグループ分けができます。
        </p>
        <p>
          複数のルールがマッチした場合は、リストの上にあるカテゴリが優先されます。
        </p>
      </div>

      <AddCategoryForm />

      {categoriesResult.status === "loading" ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : categoriesResult.categories.length === 0 ? (
        <div className="bg-base-200 rounded-box text-base-content/60 w-full p-8 text-center">
          <p>カテゴリがまだありません</p>
          <p className="mt-2 text-sm">
            上のフォームからカテゴリを追加してください
          </p>
        </div>
      ) : (
        <CategoryList categories={categoriesResult.categories} />
      )}
    </div>
  );
}
