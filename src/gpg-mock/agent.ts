
import * as yargs from 'yargs';
import * as path from 'path';
import GpgMockState from './gpg-mock-state';

/*
AGENT
GetInfoSocketNameBye();
KillAgentBye();

} else if (exists(['GETINFO socket_name', '/bye'])) {
  console.log(`D ${path.join(homeDir(), 'S.gpg-agent-' + Math.random())}`);
  console.log('OK');
  process.exit(0);
} else if (exists(['killagent', '/bye'])) {
  console.log('OK closing connection');
  process.exit(0);
*/

export function cli(y: yargs.Argv, state: GpgMockState): yargs.Argv {
  return y.command({
    command: 'connect-agent [gpg-connect..]',
    describe: 'connect agent mode',
    handler: (argv) => {
      // console.log(argv);
      if (argv.gpgConnect[0] == 'GETINFO socket_name' && argv.gpgConnect[1] == '/bye') {
        state.stdout(`D ${path.join(argv.homedir || '', 'S.gpg-agent-' + Math.random())}`);
        state.stdout('OK');
        state.processed();
      } else if (argv.gpgConnect[0] == 'killagent' && argv.gpgConnect[1] == '/bye') {
        state.stdout('OK closing connection');
        state.processed();
      }
    }});

    // (y0: yargs.Argv): yargs.Argv => {
    //   console.log('yyyyyyyy', y0);
    //   return y0;
    // },
    // (y0: yargs.Arguments) => {
    //   console.log('xxxxxxx', y0);
    // });
  // return y.command('AGENT', 'agent mode', (y0: yargs.Argv): yargs.Argv => {
  //   y0 = y0.command('socket_name', 'socket name', (y1: yargs.Argv): yargs.Argv => {
  //     return y1.command('/bye', 'bye', (y2: yargs.Argv) => y2, (arg: yargs.Arguments) => {
  //       console.log('socket_name /bye');
  //     }).help();
  //   });
  //   y0 = y0.command('/bye', 'bye', (y2: yargs.Argv) => y2, (arg: yargs.Arguments) => {
  //     console.log('/bye');
  //   });
  //   return y0.help();
  // });
}
