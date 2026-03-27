import crypto from 'node:crypto';

const seats = ['player', 'ai1', 'ai2', 'ai3'];
const lobbyByUserId = new Map();
const matchesById = new Map();

const makeAiSeat = (seat) => ({
  seat,
  kind: 'ai',
  id: `bot-${seat}`,
  loginId: seat.toUpperCase(),
  username: seat.toUpperCase(),
  ready: true,
});

const makeHumanSeat = (seat, user) => ({
  seat,
  kind: 'human',
  id: user.id,
  loginId: user.loginId,
  username: user.username,
  ready: true,
});

const serializeMatch = (match) => ({
  id: match.id,
  status: match.status,
  queue: match.queue,
  createdAt: match.createdAt,
  seats: match.seats,
});

const humanSeatCount = (match) => match.seats.filter((seat) => seat.kind === 'human').length;
const firstAiSeatIndex = (match) => match.seats.findIndex((seat) => seat.kind === 'ai');
const findJoinableMatch = (queue) => Array.from(matchesById.values()).find((match) => match.queue === queue && firstAiSeatIndex(match) !== -1) ?? null;

export const getActiveMatchForUser = (userId) => {
  const matchId = lobbyByUserId.get(userId);
  if (!matchId) {
    return null;
  }

  const match = matchesById.get(matchId);
  if (!match) {
    lobbyByUserId.delete(userId);
    return null;
  }

  return match;
};

export const createOrJoinMatch = ({ user, queue = 'coyote-4p' }) => {
  const existing = getActiveMatchForUser(user.id);
  if (existing) {
    return existing;
  }

  const joinable = findJoinableMatch(queue);
  if (joinable) {
    const aiIndex = firstAiSeatIndex(joinable);
    const seatName = joinable.seats[aiIndex].seat;
    joinable.seats[aiIndex] = makeHumanSeat(seatName, user);
    lobbyByUserId.set(user.id, joinable.id);
    return joinable;
  }

  const match = {
    id: crypto.randomUUID(),
    status: 'ready',
    queue,
    createdAt: new Date().toISOString(),
    seats: [
      makeHumanSeat(seats[0], user),
      makeAiSeat(seats[1]),
      makeAiSeat(seats[2]),
      makeAiSeat(seats[3]),
    ],
  };

  matchesById.set(match.id, match);
  lobbyByUserId.set(user.id, match.id);

  return match;
};

export const getMatchById = (matchId) => matchesById.get(matchId) ?? null;

export const leaveMatch = (userId) => {
  const match = getActiveMatchForUser(userId);
  if (!match) {
    return false;
  }

  const leavingSeatIndex = match.seats.findIndex((seat) => seat.kind === 'human' && seat.id === userId);
  if (leavingSeatIndex === -1) {
    lobbyByUserId.delete(userId);
    return false;
  }

  lobbyByUserId.delete(userId);

  if (humanSeatCount(match) <= 1) {
    matchesById.delete(match.id);
    return true;
  }

  const seatName = match.seats[leavingSeatIndex].seat;
  match.seats[leavingSeatIndex] = makeAiSeat(seatName);
  return true;
};

export const serializeActiveMatch = (userId) => {
  const match = getActiveMatchForUser(userId);
  return match ? serializeMatch(match) : null;
};

export const serializeMatchById = (matchId) => {
  const match = getMatchById(matchId);
  return match ? serializeMatch(match) : null;
};
