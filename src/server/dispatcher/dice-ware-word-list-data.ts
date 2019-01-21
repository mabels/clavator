import { WordList } from './word-list';

export const DICEWAREWORLDLISTS: WordList[] = [
  require('./dice-ware-loader!./en-large-word-list.url'),
  require('./dice-ware-loader!./de-large-word-list.url')
];

// throw new Error('This should never called');
