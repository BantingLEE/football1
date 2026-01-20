import { Socket } from 'socket.io';

export interface JoinMatchPayload {
  matchId: string;
  userId: string;
}

export interface LeaveMatchPayload {
  matchId: string;
  userId: string;
}

export interface MatchEventPayload {
  matchId: string;
  event: string;
  payload: unknown;
}

export interface MatchUpdatePayload {
  matchId: string;
  state: unknown;
}

export interface LeagueUpdatePayload {
  leagueId: string;
  update: unknown;
}

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  token?: string;
}

export interface RoomMessage {
  event: string;
  payload: unknown;
  timestamp: string;
}

export interface JoinMatchResponse {
  matchId: string;
  socketId: string;
}

export interface LeaveMatchResponse {
  matchId: string;
}
