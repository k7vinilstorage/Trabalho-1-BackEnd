import { Usuario } from '../models/Usuario.js';
import { executar } from './executar.js';
import { ErroAutenticacao } from '../utils/errors.js';
import { preenchido } from '../utils/validacao.js';

export class UsuarioController {
  static cadastrar(dados) {
    return executar('Cadastrar usuário', async () => {
      const usuario = new Usuario(dados);
      return await usuario.inserir();
    });
  }

  static login(email, senha) {
    return executar('Login', async () => {
      const usuario = await Usuario.autenticar(email, senha);
      UsuarioController.usuarioLogado = usuario;
      return usuario;
    });
  }

  static logout() {
    UsuarioController.usuarioLogado = null;
  }

  static consultarPerfil(usuarioSessao) {
    return executar('Consultar perfil', async () => {
      const usuario = UsuarioController.exigirLogin(usuarioSessao);
      return await Usuario.buscarPorId(usuario._id);
    });
  }

  static atualizarPerfil(dados, usuarioSessao) {
    return executar('Atualizar usuário', async () => {
      const usuario = UsuarioController.exigirLogin(usuarioSessao);
      await Usuario.atualizar(usuario._id, dados);
      const atualizado = await Usuario.buscarPorId(usuario._id);
      UsuarioController.usuarioLogado = atualizado;
      return atualizado;
    });
  }

  static excluirConta(usuarioSessao) {
    return executar('Excluir usuário', async () => {
      const usuario = UsuarioController.exigirLogin(usuarioSessao);
      await Usuario.excluir(usuario._id);
      UsuarioController.usuarioLogado = null;
    });
  }

  static exigirLogin(usuarioSessao = UsuarioController.usuarioLogado) {
    if (!usuarioSessao || !usuarioSessao._id) {
      throw new ErroAutenticacao('Faça login para realizar esta operação.');
    }
    return usuarioSessao;
  }

  static exibirLogin(req, res) {
    if (req.session?.usuario) {
      return res.redirect('/albuns');
    }
    return res.render('auth/login', { titulo: 'Login' });
  }

  static async processarLogin(req, res) {
    const { email, senha } = req.body ?? {};
    const resultado = await UsuarioController.login(email, senha);

    if (resultado.sucesso) {
      req.session.usuario = {
        _id: String(resultado.dados._id),
        nome: resultado.dados.nome,
        email: resultado.dados.email,
      };
      req.session.mensagemSucesso = `Bem-vindo(a), ${resultado.dados.nome}!`;
      return res.redirect('/albuns');
    }

    return res.status(401).render('auth/login', {
      titulo: 'Login',
      erro: resultado.mensagem,
      valores: { email: String(email ?? '') },
    });
  }

  static exibirCadastro(req, res) {
    if (req.session?.usuario) {
      return res.redirect('/albuns');
    }
    return res.render('auth/cadastro', { titulo: 'Cadastrar Conta' });
  }

  static async processarCadastro(req, res) {
    const { nome, email, senha } = req.body ?? {};
    const resultado = await UsuarioController.cadastrar({ nome, email, senha });

    if (resultado.sucesso) {
      req.session.mensagemSucesso = 'Cadastro realizado com sucesso! Faça login.';
      return res.redirect('/login');
    }

    return res.status(400).render('auth/cadastro', {
      titulo: 'Cadastrar Conta',
      erro: resultado.mensagem,
      valores: {
        nome: String(nome ?? ''),
        email: String(email ?? ''),
      },
    });
  }

  static processarLogout(req, res) {
    UsuarioController.logout();
    if (!req.session) {
      return res.redirect('/login');
    }
    return req.session.destroy(() => {
      res.redirect('/login');
    });
  }

  static async exibirPerfil(req, res) {
    const resultado = await UsuarioController.consultarPerfil(req.session?.usuario);

    if (resultado.sucesso) {
      return res.render('usuario/perfil', {
        titulo: 'Minha Conta',
        usuario: resultado.dados,
      });
    }

    req.session.mensagemErro = resultado.mensagem;
    return res.redirect('/login');
  }

  static async processarAtualizacao(req, res) {
    const { nome, email, senha } = req.body ?? {};
    const dados = {};

    if (preenchido(nome)) dados.nome = nome;
    if (preenchido(email)) dados.email = email;
    if (preenchido(senha)) dados.senha = senha;

    const resultado = await UsuarioController.atualizarPerfil(dados, req.session?.usuario);

    if (resultado.sucesso) {
      req.session.usuario = {
        _id: String(resultado.dados._id),
        nome: resultado.dados.nome,
        email: resultado.dados.email,
      };
      req.session.mensagemSucesso = 'Dados atualizados com sucesso!';
    } else {
      req.session.mensagemErro = resultado.mensagem;
    }

    return res.redirect('/conta');
  }

  static async processarExclusao(req, res) {
    const resultado = await UsuarioController.excluirConta(req.session?.usuario);

    if (resultado.sucesso) {
      return req.session.destroy(() => {
        res.redirect('/login');
      });
    }

    req.session.mensagemErro = resultado.mensagem;
    return res.redirect('/conta');
  }
}
