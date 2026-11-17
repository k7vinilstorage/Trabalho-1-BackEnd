import { ErroAutenticacao } from '../utils/errors.js';
import { registrarErro } from '../utils/logger.js';

export async function exigirAutenticacao(req, res, next) {
  if (!req.session?.usuario) {
    const erro = new ErroAutenticacao('Faça login para realizar esta operação.');
    await registrarErro(`Acesso protegido (${req.method} ${req.originalUrl})`, erro);
    if (req.session) {
      req.session.mensagemErro = erro.message;
    }
    return res.redirect('/login');
  }
  return next();
}
