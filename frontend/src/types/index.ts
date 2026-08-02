export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string | null;
  position: number;
  priority?: string | null;
  listId: string;
}

export interface List {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  lists?: List[];
}