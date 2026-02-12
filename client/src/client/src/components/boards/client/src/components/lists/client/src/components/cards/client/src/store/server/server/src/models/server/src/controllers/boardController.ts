import { Request, Response } from 'express';
import Board from '../models/Board';
import List from '../models/List';
import Card from '../models/Card';

export const createBoard = async (req: Request, res: Response) => {
  try {
    const { title, background } = req.body;
    const board = new Board({
      title,
      background,
      owner: req.user._id,
      members: [req.user._id]
    });

    await board.save();
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: 'Error creating board', error });
  }
};

export const getBoards = async (req: Request, res: Response) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    }).populate('owner', 'name email avatar');

    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching boards', error });
  }
};

export const getBoard = async (req: Request, res: Response) => {
  try {
    const board = await Board.findById(req.params.boardId)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .populate({
        path: 'lists',
        options: { sort: { position: 1 } },
        populate: {
          path: 'cards',
          options: { sort: { position: 1 } },
          populate: [
            { path: 'assignedTo', select: 'name email avatar' },
            { path: 'comments.author', select: 'name email avatar' },
            { path: 'createdBy', select: 'name email avatar' }
          ]
        }
      });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access
    if (!board.members.includes(req.user._id) && board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching board', error });
  }
};

export const createList = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Get the highest position
    const lists = await List.find({ board: board._id }).sort({ position: -1 }).limit(1);
    const position = lists.length > 0 ? lists[0].position + 1 : 0;

    const list = new List({
      title,
      board: board._id,
      position
    });

    await list.save();

    // Add list to board
    board.lists.push(list._id);
    await board.save();

    // Emit socket event
    req.app.get('io').to(req.params.boardId).emit('list-created', list);

    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error creating list', error });
  }
};

export const createCard = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const list = await List.findById(req.params.listId);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Get the highest position
    const cards = await Card.find({ list: list._id }).sort({ position: -1 }).limit(1);
    const position = cards.length > 0 ? cards[0].position + 1 : 0;

    const card = new Card({
      title,
      position,
      list: list._id,
      createdBy: req.user._id
    });

    await card.save();

    // Add card to list
    list.cards.push(card._id);
    await list.save();

    // Populate card data
    await card.populate('createdBy', 'name email avatar');

    // Emit socket event
    const board = await Board.findOne({ lists: list._id });
    if (board) {
      req.app.get('io').to(board._id.toString()).emit('card-created', card);
    }

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: 'Error creating card', error });
  }
};

export const moveCard = async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const { targetId } = req.body;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const targetList = await List.findById(targetId);
    if (!targetList) {
      return res.status(404).json({ message: 'Target list not found' });
    }

    // Remove from old list
    await List.updateOne(
      { _id: card.list },
      { $pull: { cards: card._id } }
    );

    // Add to new list
    card.list = targetList._id;
    card.position = targetList.cards.length;
    await card.save();

    await List.updateOne(
      { _id: targetList._id },
      { $push: { cards: card._id } }
    );

    // Emit socket event
    const board = await Board.findOne({ lists: card.list });
    if (board) {
      req.app.get('io').to(board._id.toString()).emit('card-moved', {
        cardId: card._id,
        fromList: card.list,
        toList: targetList._id,
        position: card.position
      });
    }

    res.json({ message: 'Card moved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error moving card', error });
  }
};
