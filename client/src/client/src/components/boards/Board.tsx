import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, closestCenter, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useBoardStore } from '../../store/boardStore';
import { useSocket } from '../../hooks/useSocket';
import List from '../lists/List';
import CreateListForm from '../lists/CreateListForm';
import LoadingSpinner from '../common/LoadingSpinner';

export default function Board() {
  const { boardId } = useParams<{ boardId: string }>();
  const { currentBoard, fetchBoard, moveCard, moveList } = useBoardStore();
  const [showCreateList, setShowCreateList] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const socket = useSocket();

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId);
      socket?.emit('join-board', boardId);
    }

    return () => {
      if (boardId) {
        socket?.emit('leave-board', boardId);
      }
    };
  }, [boardId, fetchBoard, socket]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'card' && overType === 'card') {
      moveCard(active.id as string, over.id as string);
    } else if (activeType === 'list' && overType === 'list') {
      moveList(active.id as string, over.id as string);
    }
  };

  if (!currentBoard) {
    return <LoadingSpinner />;
  }

  return (
    <div 
      className="h-full min-h-screen p-6"
      style={{ 
        backgroundImage: currentBoard.background ? `url(${currentBoard.background})` : undefined,
        backgroundColor: !currentBoard.background ? '#0B1D26' : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">{currentBoard.title}</h1>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          <SortableContext
            items={currentBoard.lists.map(list => list.id)}
            strategy={horizontalListSortingStrategy}
          >
            {currentBoard.lists.map((list) => (
              <List key={list.id} list={list} />
            ))}
          </SortableContext>

          {showCreateList ? (
            <CreateListForm onClose={() => setShowCreateList(false)} />
          ) : (
            <button
              onClick={() => setShowCreateList(true)}
              className="flex-shrink-0 w-72 h-12 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center gap-2 text-white transition-colors"
            >
              <Plus size={20} />
              Add another list
            </button>
          )}
        </div>
      </DndContext>
    </div>
  );
}
