import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableRow({ id, label }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex cursor-grab items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm active:cursor-grabbing dark:border-slate-600 dark:bg-slate-900"
      {...attributes}
      {...listeners}
    >
      <span className="text-slate-400">⋮⋮</span>
      <span className="font-medium text-slate-800 dark:text-slate-100">{label}</span>
    </li>
  );
}

export function SortableTaskOrder({ tasks, orderIds, onOrderChange }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = orderIds?.length ? orderIds : tasks.map((t) => t.id);
  const map = new Map(tasks.map((t) => [t.id, t]));

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onOrderChange(arrayMove(ids, oldIndex, newIndex));
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-3 dark:border-slate-600 dark:bg-slate-900/30">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Drag to reorder checklist display
      </p>
      <p className="mb-2 text-[10px] text-slate-500 dark:text-slate-500">
        Display order only — dependencies are unchanged. Export and CPM still use the real graph.
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {ids.map((id) => {
              const t = map.get(id);
              if (!t) return null;
              return <SortableRow key={id} id={id} label={`${t.id} · ${t.name}`} />;
            })}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
