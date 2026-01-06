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
import { type CategoryRule } from "../../../data/db";
import { reorderCategoryRules } from "../../../data/categories/reorderCategoryRules";
import { CategoryRuleItem } from "./CategoryRuleItem";

type Props = {
  rules: CategoryRule[];
};

export function CategoryRuleList({ rules }: Props) {
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

    const oldIndex = rules.findIndex((rule) => rule.id === active.id);
    const newIndex = rules.findIndex((rule) => rule.id === over.id);

    const newOrder = [...rules];
    const [removed] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, removed);

    try {
      await reorderCategoryRules({ ruleIds: newOrder.map((rule) => rule.id) });
    } catch {
      alert("ルールの並び替えに失敗しました。");
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => void handleDragEnd(event)}
    >
      <SortableContext
        items={rules.map((r) => r.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex flex-col gap-1">
          {rules.map((rule) => (
            <CategoryRuleItem key={rule.id} rule={rule} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
