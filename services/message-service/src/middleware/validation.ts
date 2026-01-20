import Joi from 'joi';
import {
  JoinMatchPayload,
  LeaveMatchPayload,
  MatchEventPayload,
  MatchUpdatePayload,
  LeagueUpdatePayload
} from '../types/socket';

const joinMatchSchema = Joi.object({
  matchId: Joi.string().required(),
  userId: Joi.string().required()
});

const leaveMatchSchema = Joi.object({
  matchId: Joi.string().required(),
  userId: Joi.string().required()
});

const matchEventSchema = Joi.object({
  matchId: Joi.string().required(),
  event: Joi.string().required(),
  payload: Joi.any().required()
});

const matchUpdateSchema = Joi.object({
  matchId: Joi.string().required(),
  state: Joi.any().required()
});

const leagueUpdateSchema = Joi.object({
  leagueId: Joi.string().required(),
  update: Joi.any().required()
});

export function validateJoinMatch(data: unknown): JoinMatchPayload {
  const { error, value } = joinMatchSchema.validate(data);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }
  return value;
}

export function validateLeaveMatch(data: unknown): LeaveMatchPayload {
  const { error, value } = leaveMatchSchema.validate(data);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }
  return value;
}

export function validateMatchEvent(data: unknown): MatchEventPayload {
  const { error, value } = matchEventSchema.validate(data);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }
  return value;
}

export function validateMatchUpdate(data: unknown): MatchUpdatePayload {
  const { error, value } = matchUpdateSchema.validate(data);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }
  return value;
}

export function validateLeagueUpdate(data: unknown): LeagueUpdatePayload {
  const { error, value } = leagueUpdateSchema.validate(data);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }
  return value;
}
