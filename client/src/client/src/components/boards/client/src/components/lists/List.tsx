import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Plus } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Card from '../cards/Card';
import CreateCardModal from '../cards/CreateCardModal';
import type { List as ListType } from '../../types';

interface ListProps {
  list: ListType;
}

export default function List({ list }: ListProps) {
  const [showCreateCard, setShowCreateCard] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: list.id,
    data: { type: 'list', list }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex-shrink-0 w-72 bg-gray-100 rounded-lg shadow-md"
    >
      <div className="p-3 flex items-center justify-between">
        <div 
          {...attributes} 
          {...listeners}
          className="font-semibold text-gray-700 cursor-move"
        >
          {list.title}
        </div>
        <button className="p-1 hover:bg-gray-200 rounded">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="px-2">
        <SortableContext
          items={list.cards.map(card => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {list.cards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </SortableContext>
      </div>

      <div className="p-3">
        {showCreateCard ? (
          <CreateCardModal 
            listId={list.id} 
            onClose={() => setShowCreateCard(false)} 
          />
        ) : (
          <button
            onClick={() => setShowCreateCard(true)}
            className="w-full text-left text-gray-500 hover:bg-gray-200 p-2 rounded flex items-center gap-2"
          >
            <Plus size={16} />
            Add a card
          </button>
        )}
      </div>
    </div>
  );
}
