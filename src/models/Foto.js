import { getBanco, executarNoBanco } from '../config/database.js';
import { converteId } from '../utils/validacao.js';
import { ErroValidacao, ErroNaoencontrado } from '../utils/errors.js';

const FORMATOS_PERMITIDOS = {};