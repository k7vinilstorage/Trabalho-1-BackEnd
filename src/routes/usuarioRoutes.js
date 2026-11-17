import { Router } from 'express';
import { UsuarioController } from '../controllers/UserController.js';
import { exigirAutenticacao } from '../middlewares/autenticacao.js';

export const usuarioRoutes = Router();

usuarioRoutes.use(exigirAutenticacao);

usuarioRoutes.get('/', UsuarioController.exibirPerfil);
usuarioRoutes.post('/atualizar', UsuarioController.processarAtualizacao);
usuarioRoutes.post('/excluir', UsuarioController.processarExclusao);
