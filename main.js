"use strict";
const readline = require('readline');
const model = require('./model');
const cmds = require('./cmds');
const colorize = require('./out').colorize;
const log = require('./out').log;
const biglog = require('./out').biglog;
const errorlog = require('./out').errorlog;

//import {colorize, log, biglog, errorlog} from 'out';

//Mensaje inicial
biglog('CORE Quiz','green');



const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: colorize('quiz > ','blue'),
        completer: (line) => {
            const completions = 'h help add delete edit list test p play credits q quit'.split(' ');
            const hits = completions.filter((c) => { return c.indexOf(line) === 0 });
            // show all completions if none found
            return [hits.length ? hits : completions, line];
        }
    }
);

rl.setPrompt(colorize('quiz > ','blue'));

rl.prompt();

rl
.on('line', (line) => {
    //"use strict";
    let args = line.split(" ");
    let cmd = args[0].toLowerCase().trim();
      switch (cmd) {
      case '':
        rl.prompt();
        break;
      default:
    //defaultCmd();
        console.log(`\n¿${colorize(cmd,"red")}?\nCreo que te he entendido mal.\nPor favor introduce un comando válido.\nEjecute el comando ${colorize("help","green")}...\n`);
        rl.prompt();
        break;
      case 'h':
      case 'help':
            cmds.helpCmd(rl);
        break;
      case 'q':
      case'quit':
            cmds.quitCmd(rl);
        break;
      case 'p':
      case 'play':
            cmds.playCmd(rl);
        break;
      case 'add':
            cmds.addCmd(rl);
        break;
      case 'list':
            cmds.listCmd(rl);
        break;
      case 'show':
            cmds.showCmd(rl,args[1]);
        break;
      case 'hello':
            console.log("it's me");
        break;
      case 'test':
            cmds.testCmd(rl,args[1]);
        break;
      case 'delete':
            cmds.deleteCmd(rl,args[1]);
        break;
      case 'edit':
            cmds.editCmd(rl,args[1]);
        break;
      case 'credits':
            cmds.creditsCmd(rl);
        break;
    case 'tragedy':
            cmds.senateCmd(rl);
        break;
      /*default:
      console.log(`Say what? I might have heard '${line.trim()}'`);
      break;
      }
      })
.on('close', () => {
            log('¡Adiós!','blue');
            process.exit(0);
            });
*/

        }
    }
)