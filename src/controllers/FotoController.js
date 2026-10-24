import { Foto } from '../models/Foto.js';
import { UsuarioController } from './UsuarioController.js';
import { executar } from './executar.js';

export class FotoController {
  static cadastrar(dados) {
    return executar('Cadastrar foto', async () => {
      const usuario = UsuarioController.exigirLogin();
      const foto = new Foto({ ...dados, usuarioId: usuario._id });
      return await foto.inserir();
    });
  }

  static consultar(id) {
    return executar('Consultar foto', async () => {
      const usuario = UsuarioController.exigirLogin();
      return await Foto.buscarPorId(usuario._id, id);
    });
  }

  static buscar(filtros) {
    return executar('Buscar fotos', async () => {
      const usuario = UsuarioController.exigirLogin();
      return await Foto.buscar(usuario._id, filtros);
    });
  }

  static atualizar(id, dados) {
    return executar('Atualizar foto', async () => {
      const usuario = UsuarioController.exigirLogin();
      await Foto.atualizar(usuario._id, id, dados);
    });
  }

  static excluir(id) {
    return executar('Excluir foto', async () => {
      const usuario = UsuarioController.exigirLogin();
      await Foto.excluir(usuario._id, id);
    });
  }
}