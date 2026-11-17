import { Router } from 'express';
import { AlbumController } from '../controllers/AlbumController.js';
import { exigirAutenticacao } from '../middlewares/autenticacao.js';

export const albumRoutes = Router();

albumRoutes.use(exigirAutenticacao);

albumRoutes.get('/', AlbumController.exibirLista);
albumRoutes.post('/', AlbumController.processarCriacao);
albumRoutes.post('/atualizar', AlbumController.processarAtualizacao);
albumRoutes.post('/excluir', AlbumController.processarExclusao);

albumRoutes.get('/:id', AlbumController.exibirDetalhes);
albumRoutes.get('/:id/editar', AlbumController.exibirEdicao);
albumRoutes.post('/:id/atualizar', AlbumController.processarAtualizacao);
albumRoutes.post('/:id/excluir', AlbumController.processarExclusao);
albumRoutes.post('/:id/adicionar-foto', AlbumController.processarAdicionarFoto);
albumRoutes.post('/:id/remover-foto', AlbumController.processarRemoverFoto);
