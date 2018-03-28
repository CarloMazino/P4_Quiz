"use strict";
const readline = require('readline');
const model = require('./model');
const cmds = require('./cmds');
const colorize = require('./out').colorize;
const log = require('./out').log;
const biglog = require('./out').biglog;
const errorlog = require('./out').errorlog;

const net = require("net");

net.createServer(socket => {
//import {colorize, log, biglog, errorlog} from 'out';

    console.log("Se ha conectado un cliente desde \t"+ socket.remoteAddress);

    //Mensaje inicial
    biglog(socket,'CORE Quiz','green');



    const rl = readline.createInterface({
            input: socket,
            output: socket,
            tty: false,
            prompt: colorize('quiz > ','blue'),
            completer: (line) => {
                const completions = 'h help add delete edit list test p play credits q quit'.split(' ');
                const hits = completions.filter((c) => { return c.indexOf(line) === 0 });
                // show all completions if none found
                return [hits.length ? hits : completions, line];
            }
        }
    );

    socket
    .on("end", () => { rl.close();})
    .on("error", () => { rl.close();});

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
            log(socket,`\n¿${colorize(cmd,"red")}?\nCreo que te he entendido mal.\nPor favor introduce un comando válido.\nEjecute el comando ${colorize("help","green")}...\n`);
            rl.prompt();
            break;
        case 'h':
        case 'help':
                cmds.helpCmd(socket,rl);
            break;
        case 'q':
        case'quit':
                cmds.quitCmd(socket,rl);
            break;
        case 'p':
        case 'play':
                cmds.playCmd(socket,rl);
            break;
        case 'add':
                cmds.addCmd(socket,rl);
            break;
        case 'list':
                cmds.listCmd(socket,rl);
            break;
        case 'show':
                cmds.showCmd(socket,rl,args[1]);
            break;
        case 'hello':
                socket.write("it's me");
            break;
        case 'test':
                cmds.testCmd(socket,rl,args[1]);
            break;
        case 'delete':
                cmds.deleteCmd(socket,rl,args[1]);
            break;
        case 'edit':
                cmds.editCmd(socket,rl,args[1]);
            break;
        case 'credits':
                cmds.creditsCmd(socket,rl);
            break;
        case 'tragedy':
                cmds.senateCmd(socket,rl);
            break;
        /*default:
        console.log(`Say what? I might have heard '${line.trim()}'`);
        break;
        }
        })
            */
            }
        }
    )
    .on('close', () => {
        log(socket,'¡Adiós!','blue');
        console.log("Se ha desconectado un cliente desde \t"+ socket.remoteAddress);
        //process.exit(0);
        });
})
.listen(3030);

