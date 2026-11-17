import { Foto } from '../models/Foto.js';
import { UsuarioController } from './UserController.js';
import { AlbumController } from './AlbumController.js';
import { executar } from './executar.js';
import { preenchido } from '../utils/validacao.js';

export class FotoController {
  static cadastrar(dados, usuarioSessao) {
    return executar('Cadastrar foto', async () => {
      const usuario = UsuarioController.exigirLogin(usuarioSessao);
      const foto = new Foto({ ...dados, usuarioId: usuario._id });
      return await foto.inserir();
    });
  }

  static consultar(id, usuarioSessao) {
    return executar('Consultar foto', async () => {
      const usuario = UsuarioController.exigirLogin(usuarioSessao);
      return await Foto.buscarPorId(usuario._id, id);
    });
  }

  static buscar(filtros, usuarioSessao) {
    return executar('Buscar fotos', async () => {
      const usuario = UsuarioController.exigirLogin(usuarioSessao);
      return await Foto.buscar(usuario._id, filtros);
    });
  }

  static atualizar(id, dados, usuarioSessao) {
    return executar('Atualizar foto', async () => {
      const usuario = UsuarioController.exigirLogin(usuarioSessao);
      await Foto.atualizar(usuario._id, id, dados);
    });
  }

  static excluir(id, usuarioSessao) {
    return executar('Excluir foto', async () => {
      const usuario = UsuarioController.exigirLogin(usuarioSessao);
      await Foto.excluir(usuario._id, id);
    });
  }

  static async exibirLista(req, res) {
    const usuarioSessao = req.session?.usuario;
    const filtrosConsulta = {
      nome: String(req.query?.nome ?? ''),
      tag: String(req.query?.tag ?? ''),
      formato: String(req.query?.formato ?? ''),
      dataInicial: String(req.query?.dataInicial ?? ''),
      dataFinal: String(req.query?.dataFinal ?? ''),
      albumId: String(req.query?.albumId ?? ''),
    };

    const filtros = {};
    if (preenchido(filtrosConsulta.nome)) filtros.nome = filtrosConsulta.nome;
    if (preenchido(filtrosConsulta.tag)) filtros.tag = filtrosConsulta.tag;
    if (preenchido(filtrosConsulta.formato)) filtros.formato = filtrosConsulta.formato;
    if (preenchido(filtrosConsulta.dataInicial)) filtros.dataInicial = filtrosConsulta.dataInicial;
    if (preenchido(filtrosConsulta.dataFinal)) filtros.dataFinal = filtrosConsulta.dataFinal;
    if (preenchido(filtrosConsulta.albumId)) filtros.albumId = filtrosConsulta.albumId;

    const resultado = await FotoController.buscar(filtros, usuarioSessao);
    const albunsRes = await AlbumController.listar({}, usuarioSessao);

    return res.render('fotos/lista', {
      titulo: 'Minhas Fotos',
      fotos: resultado.dados ?? [],
      albuns: albunsRes.dados ?? [],
      filtros: filtrosConsulta,
      erro: resultado.sucesso ? null : resultado.mensagem,
    });
  }

  static exibirFormularioNova(req, res) {
    return res.render('fotos/form', {
      titulo: 'Cadastrar Foto',
      editando: false,
      acao: '/fotos',
      foto: {},
    });
  }

  static async processarCadastro(req, res) {
    const { nome, descricao, data, tags, tamanhoKB, formato, local } = req.body ?? {};
    const dados = { nome };

    if (preenchido(descricao)) dados.descricao = descricao;
    if (preenchido(data)) dados.data = data;
    if (preenchido(tags)) dados.tags = tags;
    if (preenchido(tamanhoKB)) dados.tamanhoKB = tamanhoKB;
    if (preenchido(formato)) dados.formato = formato;
    if (preenchido(local)) dados.local = local;

    const resultado = await FotoController.cadastrar(dados, req.session?.usuario);

    if (resultado.sucesso) {
      req.session.mensagemSucesso = `Foto cadastrada com sucesso! (ID: ${resultado.dados})`;
      return res.redirect('/fotos');
    }

    return res.status(400).render('fotos/form', {
      titulo: 'Cadastrar Foto',
      editando: false,
      acao: '/fotos',
      erro: resultado.mensagem,
      foto: {
        nome: String(nome ?? ''),
        descricao: String(descricao ?? ''),
        data: String(data ?? ''),
        tags: String(tags ?? ''),
        tamanhoKB: String(tamanhoKB ?? ''),
        formato: String(formato ?? ''),
        local: String(local ?? ''),
      },
    });
  }

  static async exibirDetalhes(req, res) {
    const id = req.params.id;
    const resultado = await FotoController.consultar(id, req.session?.usuario);

    if (!resultado.sucesso) {
      req.session.mensagemErro = resultado.mensagem;
      return res.redirect('/fotos');
    }

    return res.render('fotos/detalhes', {
      titulo: `Foto: ${resultado.dados.nome}`,
      foto: resultado.dados,
    });
  }

  static async exibirEdicao(req, res) {
    const id = req.params.id;
    const resultado = await FotoController.consultar(id, req.session?.usuario);

    if (!resultado.sucesso) {
      req.session.mensagemErro = resultado.mensagem;
      return res.redirect('/fotos');
    }

    return res.render('fotos/form', {
      titulo: 'Editar Foto',
      editando: true,
      acao: `/fotos/${id}/atualizar`,
      foto: resultado.dados,
    });
  }

  static async processarAtualizacao(req, res) {
    const id = req.params.id || req.body?.id;
    const { nome, descricao, data, tags, tamanhoKB, formato, local } = req.body ?? {};
    const dados = {};

    if (preenchido(nome)) dados.nome = nome;
    if (preenchido(descricao)) dados.descricao = descricao;
    if (preenchido(data)) dados.data = data;
    if (preenchido(tags)) dados.tags = tags;
    if (preenchido(tamanhoKB)) dados.tamanhoKB = tamanhoKB;
    if (preenchido(formato)) dados.formato = formato;
    if (preenchido(local)) dados.local = local;

    const resultado = await FotoController.atualizar(id, dados, req.session?.usuario);
    const idValido = preenchido(id) && /^[0-9a-fA-F]{24}$/.test(String(id).trim());

    if (resultado.sucesso) {
      req.session.mensagemSucesso = 'Foto atualizada com sucesso!';
      return res.redirect(idValido ? `/fotos/${String(id).trim()}` : '/fotos');
    }

    req.session.mensagemErro = resultado.mensagem;
    return res.redirect(idValido ? `/fotos/${String(id).trim()}/editar` : '/fotos');
  }

  static async processarExclusao(req, res) {
    const id = req.params.id || req.body?.id;
    const resultado = await FotoController.excluir(id, req.session?.usuario);

    if (resultado.sucesso) {
      req.session.mensagemSucesso = 'Foto excluída com sucesso!';
    } else {
      req.session.mensagemErro = resultado.mensagem;
    }

    return res.redirect('/fotos');
  }
}
