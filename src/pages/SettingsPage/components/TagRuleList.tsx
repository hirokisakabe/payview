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
import { type TagRule } from "../../../data/db";
import { reorderTagRules } from "../../../data/tags/reorderTagRules";
import { TagRuleItem } from "./TagRuleItem";

type Props = {
  rules: TagRule[];
};

export function TagRuleList({ rules }: Props) {
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

    await reorderTagRules({ ruleIds: newOrder.map((rule) => rule.id) });
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
            <TagRuleItem key={rule.id} rule={rule} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
