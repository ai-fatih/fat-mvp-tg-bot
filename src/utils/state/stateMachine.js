import { setState, getState, determineStatus } from './index.js'; 

export const STATES = {
  EMPTY: 'EMPTY', 
  COLLECTING: 'COLLECTING',
  LIMIT_REACHED: 'LIMIT_REACHED',
  SENT_TO_MANAGER: 'SENT_TO_MANAGER', 
  COMPLETE: 'COMPLETE'
};

const transitions = {
  EMPTY: ['EMPTY', 'COLLECTING'],
  COLLECTING: ['EMPTY','COLLECTING','LIMIT_REACHED','SENT_TO_MANAGER','COMPLETE'],
  LIMIT_REACHED: ['EMPTY', 'SENT_TO_MANAGER', 'COMPLETE'],
  SENT_TO_MANAGER: ['EMPTY', 'COLLECTING', ,'LIMIT_REACHED', 'COMPLETE'],
  COMPLETE: ['EMPTY', 'COLLECTING','LIMIT_REACHED']
};

export function canTransition(from, to) {
  return transitions[from]?.includes(to);
}

export function setChatStatus(chatId, newStatus) {
  const s = getState(chatId) || {};
  const curr = s.status || determineStatus(s);
  if (!canTransition(curr, newStatus)) {
    throw new Error(`Invalid transition: ${curr} -> ${newStatus}`);
  }
  setState(chatId, 'status', newStatus);
  return newStatus;
}
