import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { type Category } from "../../../data/db";
import { reorderCategories } from "../../../data/categories/reorderCategories";
import { CategoryItem } from "./CategoryItem";

type Props = {
  categories: Category[];
};

export function CategoryList({ categories }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = categories.findIndex(
      (category) => category.id === active.id,
    );
    const newIndex = categories.findIndex(
      (category) => category.id === over.id,
    );

    const newOrder = [...categories];
    const [removed] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, removed);

    try {
      await reorderCategories({
        categoryIds: newOrder.map((category) => category.id),
      });
    } catch {
      alert("カテゴリの並び替えに失敗しました。");
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => void handleDragEnd(event)}
    >
      <SortableContext
        items={categories.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex flex-col gap-2">
          {categories.map((category) => (
            <CategoryItem key={category.id} category={category} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
