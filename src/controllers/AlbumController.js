import { Album } from '../models/Album.js';
import { Foto } from '../models/Foto.js';
import { UsuarioController } from './UsuarioController.js';
import { executar } from './executar.js';

export class AlbumController {
  static criar(dados) {
    return executar('Criar álbum', async () => {
      const usuario = UsuarioController.exigirLogin();
      const album = new Album({ ...dados, usuarioId: usuario._id });
      return await album.inserir();
    });
  }

  static consultar(id) {
    return executar('Consultar álbum', async () => {
      const usuario = UsuarioController.exigirLogin();
      return await Album.buscarPorId(usuario._id, id);
    });
  }

  static listar(filtros) {
    return executar('Listar álbuns', async () => {
      const usuario = UsuarioController.exigirLogin();
      return await Album.listar(usuario._id, filtros);
    });
  }

  static atualizar(id, dados) {
    return executar('Atualizar álbum', async () => {
      const usuario = UsuarioController.exigirLogin();
      await Album.atualizar(usuario._id, id, dados);
    });
  }

  static excluir(id) {
    return executar('Excluir álbum', async () => {
      const usuario = UsuarioController.exigirLogin();
      await Album.excluir(usuario._id, id);
    });
  }

  static adicionarFoto(albumId, fotoId) {
    return executar('Adicionar foto ao álbum', async () => {
      const usuario = UsuarioController.exigirLogin();
      await Album.adicionarFoto(usuario._id, albumId, fotoId);
    });
  }

  static removerFoto(albumId, fotoId) {
    return executar('Remover foto do álbum', async () => {
      const usuario = UsuarioController.exigirLogin();
      await Album.removerFoto(usuario._id, albumId, fotoId);
    });
  }

  static listarFotos(albumId) {
    return executar('Listar fotos do álbum', async () => {
      const usuario = UsuarioController.exigirLogin();
      return await Foto.buscar(usuario._id, { albumId });
    });
  }
}