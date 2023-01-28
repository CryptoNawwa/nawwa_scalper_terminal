import PromptSync from 'prompt-sync';
import history from 'prompt-sync-history';

const prompt = PromptSync({
  sigint: false,
  eot: true,
  history: history('scalper-tool-history'),
});

export { prompt };
