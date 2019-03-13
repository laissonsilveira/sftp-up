/**
 * @autor Laisson R. Silveira<laisson.silveira@digitro.com>
 *
 * Created on 13/03/2019
 */
const LOGGER = require('./logger');
const moment = require('moment-timezone');
moment.locale('pt-br');

const dateFormat = () => {
    return moment().tz('America/Sao_Paulo').format('L LTS');
};

const normalizePort = val => {
    const port = parseInt(val, 10);
    if (isNaN(port)) return val;
    if (port >= 0) return port;
    return false;
};

const onErrorServer = (error, port)  => {
    if (error.syscall !== 'listen') throw error;
    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
    switch (error.code) {
        case 'EACCES':
            LOGGER.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            LOGGER.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
};

module.exports = { dateFormat, normalizePort, onErrorServer };
