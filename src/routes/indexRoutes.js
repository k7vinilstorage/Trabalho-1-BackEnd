import { Router } from 'express';
import { UsuarioController } from '../controllers/UserController.js';

export const indexRoutes = Router();

indexRoutes.get('/', (req, res) => {
  if (req.session?.usuario) {
    return res.redirect('/albuns');
  }
  return res.redirect('/login');
});

indexRoutes.get('/login', UsuarioController.exibirLogin);
indexRoutes.post('/login', UsuarioController.processarLogin);

indexRoutes.get('/cadastro', UsuarioController.exibirCadastro);
indexRoutes.post('/cadastro', UsuarioController.processarCadastro);

indexRoutes.post('/logout', UsuarioController.processarLogout);
indexRoutes.get('/logout', UsuarioController.processarLogout);
