import { getBanco, executarNoBanco } from '../config/database.js';
import { converterId, preenchido, escaparRegex } from '../utils/validacao.js';
import { ErroValidacao, ErroNaoEncontrado, ErroConflito } from '../utils/erros.js';

const MSG_NOME_REPETIDO = 'Você já possui um álbum com este nome.';

const colecao = () => getBanco().collection('albuns');

export class Album {
  constructor({ usuarioId, nome, descricao } = {}) {
    this.usuarioId = usuarioId;
    this.nome = nome;
    this.descricao = descricao;
  }

  static validarNome(nome) {
    if (typeof nome !== 'string' || nome.trim() === '') {
      throw new ErroValidacao('Campo "nome" obrigatório.');
    }
    const limpo = nome.trim();
    if (limpo.length > 100) {
      throw new ErroValidacao('O nome do álbum deve ter no máximo 100 caracteres.');
    }
    return limpo;
  }

  static validarDescricao(descricao) {
    if (descricao === undefined || descricao === null) return '';
    if (typeof descricao !== 'string') {
      throw new ErroValidacao('O campo "descrição" deve ser um texto.');
    }
    const limpo = descricao.trim();
    if (limpo.length > 500) {
      throw new ErroValidacao('A descrição deve ter no máximo 500 caracteres.');
    }
    return limpo;
  }

 async inserir() {
    const usuarioId = converterId(this.usuarioId);
    const documento = {
      usuarioId,
      nome: Album.validarNome(this.nome),
      descricao: Album.validarDescricao(this.descricao),
      fotoIds: [],
    };

    const dono = await executarNoBanco('consultar usuário', () =>
      obterBanco().collection('usuarios').findOne({ _id: usuarioId }, { projection: { _id: 1 } })
    );
    if (!dono) throw new ErroNaoEncontrado('Usuário não encontrado.');

    const resultado = await executarNoBanco(
      'inserir álbum',
      () => colecao().insertOne(documento),
      MSG_NOME_REPETIDO
    );
    this._id = resultado.insertedId;
    return this._id;
  }

  static async buscarPorId(usuarioId, id) {
    const consulta = { _id: converterId(id), usuarioId: converterId(usuarioId) };
    const album = await executarNoBanco('consultar álbum', () => colecao().findOne(consulta));
    if (!album) throw new ErroNaoEncontrado('Álbum não encontrado.');
    return album;
  }

  static async listar(usuarioId, filtros = {}) {
    const consulta = { usuarioId: converterId(usuarioId) };
    if (preenchido(filtros.nome)) {
      consulta.nome = { $regex: escaparRegex(String(filtros.nome).trim()), $options: 'i' };
    }
    return await executarNoBanco('listar álbuns', () =>
      colecao().find(consulta).sort({ nome: 1 }).toArray()
    );
  }

  static async atualizar(usuarioId, id, dados = {}) {
    const filtro = { _id: converterId(id), usuarioId: converterId(usuarioId) };
    const campos = {};

    if (dados.nome !== undefined) campos.nome = Album.validarNome(dados.nome);
    if (dados.descricao !== undefined) campos.descricao = Album.validarDescricao(dados.descricao);

    if (Object.keys(campos).length === 0) {
      throw new ErroValidacao('Nenhum campo para atualizar foi informado.');
    }

    const resultado = await executarNoBanco(
      'atualizar álbum',
      () => colecao().updateOne(filtro, { $set: campos }),
      MSG_NOME_REPETIDO
    );
    if (resultado.matchedCount === 0) throw new ErroNaoEncontrado('Álbum não encontrado.');
  }

  static async excluir(usuarioId, id) {
    const filtro = { _id: converterId(id), usuarioId: converterId(usuarioId) };
    const resultado = await executarNoBanco('excluir álbum', () => colecao().deleteOne(filtro));
    if (resultado.deletedCount === 0) throw new ErroNaoEncontrado('Álbum não encontrado.');
  }

  static async adicionarFoto(usuarioId, albumId, fotoId) {
    const dono = converterId(usuarioId);
    const _id = converterId(albumId);
    const idFoto = converterId(fotoId);

    const album = await executarNoBanco('consultar álbum', () =>
      colecao().findOne({ _id, usuarioId: dono }, { projection: { _id: 1 } })
    );
    if (!album) throw new ErroNaoEncontrado('Álbum não encontrado.');

    const foto = await executarNoBanco('consultar foto', () =>
      obterBanco().collection('fotos').findOne({ _id: idFoto, usuarioId: dono }, { projection: { _id: 1 } })
    );
    if (!foto) throw new ErroNaoEncontrado('Foto não encontrada.');

    const resultado = await executarNoBanco('adicionar foto ao álbum', () =>
      colecao().updateOne({ _id, usuarioId: dono }, { $addToSet: { fotoIds: idFoto } })
    );
    if (resultado.modifiedCount === 0) {
      throw new ErroConflito('Esta foto já está neste álbum.');
    }
  }

  static async removerFoto(usuarioId, albumId, fotoId) {
    const dono = converterId(usuarioId);
    const _id = converterId(albumId);
    const idFoto = converterId(fotoId);

    const resultado = await executarNoBanco('remover foto do álbum', () =>
      colecao().updateOne({ _id, usuarioId: dono }, { $pull: { fotoIds: idFoto } })
    );
    if (resultado.matchedCount === 0) throw new ErroNaoEncontrado('Álbum não encontrado.');
    if (resultado.modifiedCount === 0) {
      throw new ErroNaoEncontrado('Esta foto não está neste álbum.');
    }
  }
}