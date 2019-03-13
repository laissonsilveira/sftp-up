/**
 * @autor Laisson R. Silveira<laisson.silveira@digitro.com>
 *
 * Created on 09/11/2018
 */
const LOGGER = require('../lib/logger');

class Errors {

    static logErrors(err, req, res, next) {
        LOGGER.error(err.message, err.stack);
        next(err);
    }

    //eslint-disable-next-line
    static clientErrorHandler(err, req, res, next) {
        let response = { message: 'Erro interno no servidor. Contate o administrador.' };
        if (err.message.indexOf('ENOTFOUND gitlab.digitro.com.br') > -1)
            response = { message: 'Não foi possível se conectar com servidor de repositório da Dígitro.' };
        if (err.message.indexOf('E11000 duplicate key error collection: c-sync-server.users') > -1)
            response = { message: 'Já existe um usuário com este nome.' };
        res.status(500).send(response);
    }

}

module.exports = Errors;
