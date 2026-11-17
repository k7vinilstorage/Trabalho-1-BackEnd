import { Router } from 'express';
import { FotoController } from '../controllers/FotoController.js';
import { exigirAutenticacao } from '../middlewares/autenticacao.js';

export const fotoRoutes = Router();

fotoRoutes.use(exigirAutenticacao);

fotoRoutes.get('/', FotoController.exibirLista);
fotoRoutes.get('/nova', FotoController.exibirFormularioNova);
fotoRoutes.post('/', FotoController.processarCadastro);
fotoRoutes.post('/atualizar', FotoController.processarAtualizacao);
fotoRoutes.post('/excluir', FotoController.processarExclusao);

fotoRoutes.get('/:id', FotoController.exibirDetalhes);
fotoRoutes.get('/:id/editar', FotoController.exibirEdicao);
fotoRoutes.post('/:id/atualizar', FotoController.processarAtualizacao);
fotoRoutes.post('/:id/excluir', FotoController.processarExclusao);
