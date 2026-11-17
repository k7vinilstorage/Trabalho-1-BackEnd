import { Album } from '../models/Album.js';
import { Foto } from '../models/Foto.js';
import { UsuarioController } from './UserController.js';
import { FotoController } from './FotoController.js';
import { executar } from './executar.js';
import { preenchido } from '../utils/validacao.js';

export class AlbumController {
  static criar(dados, usuarioSessao) {
    return executar('Criar álbum', async () => {
      const usuario = UsuarioController.exigirLogin(usuarioSessao);
      const album = new Album({ ...dados, usuarioId: usuario._id });
      return await album.inserir();
    });
  }

  static consultar(id, usuarioSessao) {
    return executar('Consultar álbum', async () => {
      const usuario = UsuarioController.exigirLogin(usuarioSessao);
      return await Album.buscarPorId(usuario._id, id);
    });
  }

  static listar(filtros, usuarioSessao) {
    return executar('Listar álbuns', async () => {
      const usuario = UsuarioController.exigirLogin(usuarioSessao);
      return await Album.listar(usuario._id, filtros);
    });
  }

  static atualizar(id, dados, usuarioSessao) {
    return executar('Atualizar álbum', async () => {
      const usuario = UsuarioController.exigirLogin(usuarioSessao);
      await Album.atualizar(usuario._id, id, dados);
    });
  }

  static excluir(id, usuarioSessao) {
    return executar('Excluir álbum', async () => {
      const usuario = UsuarioController.exigirLogin(usuarioSessao);
      await Album.excluir(usuario._id, id);
    });
  }

  static adicionarFoto(albumId, fotoId, usuarioSessao) {
    return executar('Adicionar foto ao álbum', async () => {
      const usuario = UsuarioController.exigirLogin(usuarioSessao);
      await Album.adicionarFoto(usuario._id, albumId, fotoId);
    });
  }

  static removerFoto(albumId, fotoId, usuarioSessao) {
    return executar('Remover foto do álbum', async () => {
      const usuario = UsuarioController.exigirLogin(usuarioSessao);
      await Album.removerFoto(usuario._id, albumId, fotoId);
    });
  }

  static listarFotos(albumId, usuarioSessao) {
    return executar('Listar fotos do álbum', async () => {
      const usuario = UsuarioController.exigirLogin(usuarioSessao);
      return await Foto.buscar(usuario._id, { albumId });
    });
  }

  static async exibirLista(req, res) {
    const nome = String(req.query?.nome ?? '');
    const filtros = {};
    if (preenchido(nome)) {
      filtros.nome = nome;
    }

    const resultado = await AlbumController.listar(filtros, req.session?.usuario);

    return res.render('albuns/lista', {
      titulo: 'Meus Álbuns',
      albuns: resultado.dados ?? [],
      filtroNome: nome,
      erro: resultado.sucesso ? null : resultado.mensagem,
    });
  }

  static async processarCriacao(req, res) {
    const { nome, descricao } = req.body ?? {};
    const resultado = await AlbumController.criar({ nome, descricao }, req.session?.usuario);

    if (resultado.sucesso) {
      req.session.mensagemSucesso = `Álbum criado com sucesso! (ID: ${resultado.dados})`;
    } else {
      req.session.mensagemErro = resultado.mensagem;
    }

    return res.redirect('/albuns');
  }

  static async exibirDetalhes(req, res) {
    const id = req.params.id;
    const usuarioSessao = req.session?.usuario;
    const resultado = await AlbumController.consultar(id, usuarioSessao);

    if (!resultado.sucesso) {
      req.session.mensagemErro = resultado.mensagem;
      return res.redirect('/albuns');
    }

    const album = resultado.dados;
    const fotosAlbumRes = await AlbumController.listarFotos(id, usuarioSessao);
    const todasFotosRes = await FotoController.buscar({}, usuarioSessao);

    const fotosNoAlbum = fotosAlbumRes.sucesso ? fotosAlbumRes.dados : [];
    const todasFotos = todasFotosRes.sucesso ? todasFotosRes.dados : [];
    const idsNoAlbum = new Set((album.fotoIds ?? []).map((item) => String(item)));
    const fotosDisponiveis = todasFotos.filter((foto) => !idsNoAlbum.has(String(foto._id)));

    return res.render('albuns/detalhes', {
      titulo: `Álbum: ${album.nome}`,
      album,
      fotosNoAlbum,
      fotosDisponiveis,
      todasFotos,
    });
  }

  static async exibirEdicao(req, res) {
    const id = req.params.id;
    const resultado = await AlbumController.consultar(id, req.session?.usuario);

    if (!resultado.sucesso) {
      req.session.mensagemErro = resultado.mensagem;
      return res.redirect('/albuns');
    }

    return res.render('albuns/editar', {
      titulo: 'Editar Álbum',
      album: resultado.dados,
    });
  }

  static async processarAtualizacao(req, res) {
    const id = req.params.id || req.body?.id;
    const dados = {};

    if (preenchido(req.body?.nome)) dados.nome = req.body.nome;
    if (req.body?.descricao !== undefined) dados.descricao = req.body.descricao;

    const resultado = await AlbumController.atualizar(id, dados, req.session?.usuario);

    if (resultado.sucesso) {
      req.session.mensagemSucesso = 'Álbum atualizado com sucesso!';
    } else {
      req.session.mensagemErro = resultado.mensagem;
    }

    if (preenchido(id) && /^[0-9a-fA-F]{24}$/.test(String(id).trim())) {
      return res.redirect(`/albuns/${String(id).trim()}`);
    }
    return res.redirect('/albuns');
  }

  static async processarExclusao(req, res) {
    const id = req.params.id || req.body?.id;
    const resultado = await AlbumController.excluir(id, req.session?.usuario);

    if (resultado.sucesso) {
      req.session.mensagemSucesso = 'Álbum excluído com sucesso!';
    } else {
      req.session.mensagemErro = resultado.mensagem;
    }

    return res.redirect('/albuns');
  }

  static async processarAdicionarFoto(req, res) {
    const albumId = req.params.id || req.body?.albumId;
    const fotoId = req.body?.fotoId;
    const resultado = await AlbumController.adicionarFoto(albumId, fotoId, req.session?.usuario);

    if (resultado.sucesso) {
      req.session.mensagemSucesso = 'Foto adicionada ao álbum com sucesso!';
    } else {
      req.session.mensagemErro = resultado.mensagem;
    }

    if (preenchido(albumId) && /^[0-9a-fA-F]{24}$/.test(String(albumId).trim())) {
      return res.redirect(`/albuns/${String(albumId).trim()}`);
    }
    return res.redirect('/albuns');
  }

  static async processarRemoverFoto(req, res) {
    const albumId = req.params.id || req.body?.albumId;
    const fotoId = req.body?.fotoId;
    const resultado = await AlbumController.removerFoto(albumId, fotoId, req.session?.usuario);

    if (resultado.sucesso) {
      req.session.mensagemSucesso = 'Foto removida do álbum com sucesso!';
    } else {
      req.session.mensagemErro = resultado.mensagem;
    }

    if (preenchido(albumId) && /^[0-9a-fA-F]{24}$/.test(String(albumId).trim())) {
      return res.redirect(`/albuns/${String(albumId).trim()}`);
    }
    return res.redirect('/albuns');
  }
}
