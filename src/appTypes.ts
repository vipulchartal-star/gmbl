export type CoyoteCard = {
  id: string;
  label: string;
  value: number;
};

export type RoundActor = 'ai1' | 'ai2' | 'ai3' | 'player';

export type ScoreState = Record<RoundActor, number>;
export type CardMap = Record<RoundActor, CoyoteCard>;

export const actorOrder: RoundActor[] = ['ai1', 'ai2', 'player', 'ai3'];
export const aiActors: RoundActor[] = ['ai1', 'ai2', 'ai3'];
export const startingLives = 3;

export const coyoteDeck: CoyoteCard[] = [
  { id: 'zero', label: '0', value: 0 },
  { id: 'one', label: '1', value: 1 },
  { id: 'two', label: '2', value: 2 },
  { id: 'three', label: '3', value: 3 },
  { id: 'four', label: '4', value: 4 },
  { id: 'five', label: '5', value: 5 },
  { id: 'seven', label: '7', value: 7 },
  { id: 'ten', label: '10', value: 10 },
  { id: 'fifteen', label: '15', value: 15 },
  { id: 'minus-five', label: '-5', value: -5 },
];
