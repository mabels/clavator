import { WordList } from './word-list';

export const DICEWAREWORLDLISTS: Promise<WordList[]> = new Promise(async (rs, rj) => {
  const wordlists: WordList[] = [];
  if (process.env.PACKED === 'true') {
    wordlists.push(require('./dice-ware-loader!./en-large-word-list.url'));
    wordlists.push(require('./dice-ware-loader!./de-large-word-list.url'));
    rs(wordlists);
  } else {
    const loader = require('./dice-ware-loader');
    wordlists.push(await loader.testLoader('./en-large-word-list.url'));
    wordlists.push(await loader.testLoader('./de-large-word-list.url'));
    rs(wordlists);
  }
});
