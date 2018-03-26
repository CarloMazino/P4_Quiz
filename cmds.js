"use strict";

const colorize = require('./out').colorize;
const log = require('./out').log;
const biglog = require('./out').biglog;
const errorlog = require('./out').errorlog;

const Sequelize = require('sequelize');


const models = require('./model').models;

const makeQuestion = (rl,text) => {
	
	return new Sequelize.Promise((resolve, reject) => {
		rl.question(colorize(text, 'red'), answer => {
			resolve(answer.trim());
		});
	});
};   

const validateId = id => {
	
	return new Sequelize.Promise((resolve,reject) => {
		if (typeof id === "undefined") {
			reject(new Error(`Falta el parametro <id>.`));
		} else {
			id = parseInt(id);
			if (Number.isNaN(id)) {
				reject( new Error(`El valor del parametro <id> no es un número`));
			} else {
				resolve(id);
			}
		}
	});
};


/**
 * Muestra la ayuda.
 * @param rl Objeto readLine usado para implementar el CLI
 */
exports.helpCmd = rl => {
    log("Comandos:");
    log(" h|help - Muestra esta ayuda.");
    log(" list - Listear los quizzes existentes.");
    log(" show <id> - muestra la pregunta y la respuesta.");
    log(" add - Añadir un nuevo quizz.");
    log(" delete <id> - Borrar el quizz indicado.");
    log(" edit <id> - Editar el quizz indicado.");
    log(" test <id> - Probar el quizz indicado.");
    log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
    log(" credits - Créditos.");
    log(" q|quit - Salir del programa.");
    rl.prompt();
};
/**
 * Lista todos los quizzes existentes en el modelo.
 */
exports.listCmd = rl => {
    /*
    model.getAll().forEach(((quiz,id) => { 
        log(`[${colorize(id,'magenta')}]:${quiz.question}`);
    }));
    //log('Listar todos los quizzes existentes.','red');
    rl.prompt();*/

    models.quiz.findAll()
	.each(quiz => {
			log(` [${colorize(quiz.id, 'magenta')}]:  ${quiz.question}`);
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};
/**
 * Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
 * @param id clave del quiz a mostrar.
 */
exports.showCmd = (rl, id) => {
    /*if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    }else{
        try{
            const quiz = model.getByIndex(id);
            log(`[${colorize(id,'magenta')}]:${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
        }catch(error){
            errorlog(error.message);
        }
    }
    //log('Mostrar el quiz indicado.','red');
    rl.prompt();*/

    validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No existe un quiz asociado al id=${id}.`);
		}
		log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};
/**
 * Añade un nuevo quiz al modelo.
 * @param id Clave del quiz a mostrar.
 */
exports.addCmd = rl => {
    /*
    rl.question(colorize('Introduzca una pregunta: ', 'red'), question =>{
        rl.question(colorize('Introduzca la respuesta ','red'), answer => {
            model.add(question, answer);
            log(`${colorize('Se ha añadido','magenta')}: ${question} ${colorize('=>','magenta')} ${answer}`);
            rl.prompt();
        });
    });
    //log('Añadir un nuevo quiz.','red');
    //rl.prompt();

    */

   makeQuestion(rl, 'Introduzca una pregunta: ')
   .then(q => {
       return makeQuestion(rl, 'Introduzca la respuesta ')
       .then(a => {
           return {question: q, answer: a};
       });
   })
   .then(quiz => {
       return models.quiz.create(quiz);
   })
   .then((quiz) => {
       log(` ${colorize('Se ha añadido','magenta')}: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
   })
   .catch(Sequelize.ValidationError, error => {
       errorlog('El quiz es erroneo:');
       error.errors.forEach((message) => {errorlog(message)});
   })
   .catch(error => {
       errorlog(error.message);
   })
   .then(() => {
       rl.prompt();
   });
};
/**
 * Prueba el quizz, es decir, hace una pregunta del modelo a la que debemos contestar.
 * @param id clave del quiz a probar.
 */
exports.testCmd = (rl, id) => {

    validateId(id)
    .then(id => models.quiz.findById(id))
    .then(quiz => {
        if(!quiz) {
            throw new Error(`No existe un quiz asociado al id=${id}.`);
        }else{
            return makeQuestion(rl, quiz.question)
            .then(answer =>{
                if (answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
                    biglog(`CORRECTO`,'green');
                    rl.prompt();
                    return;
                }else{
                    log(`INCORRECTO`,'red');
                    rl.prompt();
                    return;
                }
            })   
        }
    })
    .catch(error => {
		errorlog(error.message);
	})



/*    
    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
        try{
            //let n_pregunta = 1;
            //let n_acierto = 0;
            //let n_fallo = 0;
            const quiz = model.getByIndex(id);
            rl.question(colorize(`Pregunta ${id}: ${quiz.question} `,'red'), resp => {
                if (resp.toLowerCase().trim() == quiz.answer.toLowerCase().trim()){
                    //Correcto
                    log('Su respuesta es correcta');
                    //biglog('Correcta','green');
                }else{
                    //Incorrecto
                    log('Su respuesta es incorrecta');
                    //biglog('Incorrecta','red');
                }
                rl.prompt();
            });

        }catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }
    //log('Probar el quiz indicado.','red');
    //rl.prompt();
    */
};
/**
 * Borra un quizz del modelo.
 * @param id Clave del quiz a borrar en el modelo.
 */
exports.deleteCmd = (rl, id) => {
    /*
    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
    }else{
        try{
            model.deleteByIndex(id);
        }catch(error){
            errorlog(error.message);
        }
    }
    //log('Borrar el quiz indicado.','red');
    rl.prompt();*/

    validateId(id)
	.then(id => models.quiz.destroy({where: {id}}))
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};
/**
 * Edita un quiz del modelo.
 * @param id Clave del quiz a editar en el modelo.
 */
exports.editCmd = (rl,id) => {
    /*
    if (typeof id === "undefined"){
        errorlog(`Falta el parámetro id.`);
        rl.prompt();
    }else{
        try{
            const quiz = model.getByIndex(id);
            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

            rl.question(colorize('Introduzca una pregunta: ', 'red'), question =>{

                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

                rl.question(colorize('Introduzca la respuesta ','red'), answer => {
                    model.update(id, question, answer);
                    log(`Se ha cambiado el quiz ${colorize(id,'magenta')} por: ${question} ${colorize('=>','magenta')} ${answer}`);
                    rl.prompt();
            });
        });  
        }catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    }
    //log('Editar el quiz indicado.','red');
    */

   validateId(id)
   .then(id => models.quiz.findById(id))
   .then(quiz => {
       if(!quiz) {
           throw new Error(`No existe un quiz asociado al id=${id}.`);
       }
       
       process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
       return makeQuestion(rl, ' Introduzca la pregunta: ')
       .then(q => {
           process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
           return makeQuestion(rl, ' Introduzca la respuesta ')
           .then(a => {
               quiz.question = q;
               quiz.answer = a;
               return quiz;
           });
       });
   })
   .then(quiz => {
       return quiz.save();
   })
   .then(quiz => {
       log(`Se ha cambiado el quiz ${colorize(id,'magenta')} por: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
   })
   .catch(Sequelize.ValidationError, error => {
       errorlog('El quiz es erroneo:');
       error.errors.forEach((message) => {errorlog(message)});
   })
   .catch(error => {
       errorlog(error.message);
   })
   .then(() => {
       rl.prompt();
   });
};

/**
 * Pregunta todos los quizzes existentes en el modleo en orden alfabético.
 * Se gana si contesta a todos satisfactoriamente.
 */
exports.playCmd = rl => {
    /*let score=0;
    let toBeSolved = [];
    let quizzes=model.getAll();
    let size = quizzes.length;
    for (let i=0; i<size; i++){
        toBeSolved.push(i);
    }
    const playOne = () =>{
        //log(toBeSolved,'green');
        if ((toBeSolved === null)||(toBeSolved.length===0)){
            log('No hay nada más que preguntar.');
            log('Fin del examen. Aciertos: ');
            biglog(`${score}`,'magenta');
            rl.prompt();
        }else{
            let index=Math.floor(Math.random() * toBeSolved.length);
            let quiz = quizzes[index];
            rl.question(`${colorize(quiz.question,'red')}${colorize('? ','red')}`, answer=>{
                if (answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
                    score++;
                    toBeSolved.splice(index,1);
                    quizzes.splice(index,1);
                    log(`CORRECTO - lleva ${score} aciertos`);
                    playOne();
                }else{
                    log(`INCORRECTO\n Fin del examen. Aciertos:`);
                    biglog(`${score}`,'magenta');
                    rl.prompt();
                }
            }

            );
        }
    }
    //log('Jugar.','red');
    //rl.prompt();
    playOne();*/

    let score=0;
    let toBePlayed = [];

    const playOne = () => {
        return new Sequelize.Promise( (result, reject)=>{

            if (toBePlayed.length<=0){
                log("Test finalizado. Puntuación:",'green');
                biglog(`${score}`,'green');
                rl.prompt();
                result();
                return;
            }
            else
            {let pos = Math.floor(Math.random()*toBePlayed.length);
            let quiz = toBePlayed[pos];
            toBePlayed.splice(pos, 1);

            return makeQuestion(rl, quiz.question)
            .then(answer =>{
                if (answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()){
                    score++;
                    log(`CORRECTO - lleva ${score} aciertos`);
                    return playOne();
                }else{
                    log(`INCORRECTO\n Fin del examen. Aciertos:`);
                    biglog(`${score}`,'magenta');
                    rl.prompt();
                    result();
                    return;
                }
            })}
        })
    };


    models.quiz.findAll({raw:true})
    .then(quizzes => {
        toBePlayed= quizzes;
    })
    .then(() => {
        return playOne();
    })
    .catch(err => {
        errorlog("Error: "+err);
    })
    .then(() => {
        biglog(score);
        rl.prompt();
    })
};
/**
 * Muestra los nombres de los autores de la práctica.
 *
 */
exports.creditsCmd = rl => {
    log('Autores de la práctica:');
    log("\n Marta Hernández Muela\n&\n Carlos Caro Álvarez",'green');
    rl.prompt();
};
/**
 * Termina el programa.
 *
 */
exports.quitCmd = rl => {
    log("¡Adiós!",'blue');
    rl.close();

};
/**
 * Mensaje por defecto cuando se da una orden desconocida.
 *
 */
/*exports.defaultCmd = () => {
    console.log(`\n¿${colorize(cmd,"red")}?\nCreo que te he entendido mal.\nPor favor introduce un comando válido.\nEjecute el comando ${colorize("help","green")}...\n`);
    rl.prompt();
};
 */
/**
 * Mensaje por defecto si eres tentado por el Lado Oscuro de la Fuerza
 *
 */
exports.senateCmd = rl => {
    rl.question(colorize('Have you ever heard the tragedy of Darth Plagueis the Wise?\n','white'), answer=>{
        if (answer==="yes"||answer==="y"||answer==="Yes"||answer==="y"){
            log (`Ah! I see you are a man of culture as well.`,'white');
            rl.prompt();
        }else{
            log("I thought not. It's not a story the Jedi would tell you. It's a Sith legend. Darth Plagueis was a Dark Lord of the Sith, so powerful and so wise he could use the Force to influence the midichlorians to create life... He had such a knowledge of the dark side that he could even keep the ones he cared about from dying. The dark side of the Force is a pathway to many abilities some consider to be unnatural. He became so powerful... the only thing he was afraid of was losing his power, which eventually, of course, he did. Unfortunately, he taught his apprentice everything he knew, then his apprentice killed him in his sleep. It's ironic; he could save others from death, but not himself.",'red');
            rl.prompt();
    }
    });
    
    
};
