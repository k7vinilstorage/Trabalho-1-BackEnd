import { Usuario } from '../models/Usuario.js';
import { executar } from './executar.js';
import { ErroAutenticacao } from '../utils/errors.js';

export class UsuarioController {
  static cadastrar(dados) {
    return executar('Cadastrar usuário', async () => {
      const usuario = new Usuario(dados);
      return await usuario.inserir();
    });
  }

  static login(email, senha) {
    return executar('Login', async () => {
      UsuarioController.usuarioLogado = await Usuario.autenticar(email, senha);
      return UsuarioController.usuarioLogado;
    });
  }

  static logout() {
    UsuarioController.usuarioLogado = null;
  }

  static consultarPerfil() {
    return executar('Consultar perfil', async () => {
      UsuarioController.exigirLogin();
      return await Usuario.buscarPorId(UsuarioController.usuarioLogado._id);
    });
  }

  static atualizarPerfil(dados) {
    return executar('Atualizar usuário', async () => {
      UsuarioController.exigirLogin();
      const id = UsuarioController.usuarioLogado._id;
      await Usuario.atualizar(id, dados);
      UsuarioController.usuarioLogado = await Usuario.buscarPorId(id);
    });
  }

  static excluirConta() {
    return executar('Excluir usuário', async () => {
      UsuarioController.exigirLogin();
      await Usuario.excluir(UsuarioController.usuarioLogado._id);
      UsuarioController.usuarioLogado = null;
    });
  }

  static exigirLogin() {
    if (!UsuarioController.usuarioLogado) {
      throw new ErroAutenticacao('Faça login para realizar esta operação.');
    }
    return UsuarioController.usuarioLogado;
  }
}
