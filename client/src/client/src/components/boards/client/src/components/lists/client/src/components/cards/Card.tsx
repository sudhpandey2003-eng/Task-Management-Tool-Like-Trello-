import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MessageCircle, Paperclip, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import CardDetails from './CardDetails';
import type { Card as CardType } from '../../types';

interface CardProps {
  card: CardType;
}

export default function Card({ card }: CardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: card.id,
    data: { type: 'card', card }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const completedChecklistItems = card.checklist?.filter(item => item.completed).length || 0;
  const totalChecklistItems = card.checklist?.length || 0;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setShowDetails(true)}
        className="bg-white rounded-lg shadow-sm p-3 mb-2 hover:shadow-md transition-shadow cursor-pointer"
      >
        {/* Labels */}
        {card.labels && card.labels.length > 0 && (
          <div className="flex gap-1 mb-2">
            {card.labels.map((label) => (
              <span
                key={label.id}
                className="w-8 h-2 rounded-full"
                style={{ backgroundColor: label.color }}
              />
            ))}
          </div>
        )}

        {/* Title */}
        <h4 className="text-sm font-medium text-gray-700 mb-2">{card.title}</h4>

        {/* Description preview */}
        {card.description && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
            {card.description}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {card.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {format(new Date(card.dueDate), 'MMM dd')}
            </span>
          )}
          
          {card.comments && card.comments.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageCircle size={12} />
              {card.comments.length}
            </span>
          )}
          
          {card.attachments && card.attachments.length > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip size={12} />
              {card.attachments.length}
            </span>
          )}
          
          {totalChecklistItems > 0 && (
            <span className="flex items-center gap-1">
              <CheckSquare size={12} />
              {completedChecklistItems}/{totalChecklistItems}
            </span>
          )}
        </div>

        {/* Assignee */}
        {card.assignedTo && (
          <div className="mt-2 flex items-center">
            <img
              src={card.assignedTo.avatar || `https://ui-avatars.com/api/?name=${card.assignedTo.name}`}
              alt={card.assignedTo.name}
              className="w-6 h-6 rounded-full"
            />
          </div>
        )}
      </div>

      {showDetails && (
        <CardDetails card={card} onClose={() => setShowDetails(false)} />
      )}
    </>
  );
}
