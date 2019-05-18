import { combineReducers } from 'redux';
import { config } from './config';
import { nav } from './nav';
import { user } from './user';

export default combineReducers({
  config,
  nav,
  user,
});
