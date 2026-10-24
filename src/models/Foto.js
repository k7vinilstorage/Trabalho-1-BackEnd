import { getBanco, executarNoBanco } from '../config/database.js';
import { converterId, converterData, preenchido, escaparRegex } from '../utils/validacao.js';
import { ErroValidacao, ErroNaoEncontrado } from '../utils/errors.js';

const FORMATOS_PERMITIDOS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic'];

const colecao = () => getBanco().collection('fotos');

export class Foto {
    constructor({usuarioId, nome, descricao, data, tags, tamanhoKB, formato, local} = {}){
        this.usuarioId = usuarioId;
        this.nome = nome;
        this.descricao = descricao;
        this.data = data;
        this.tags = tags;
        this.tamanhoKB = tamanhoKB;
        this.formato = formato;
        this.local = local;
    }

    static validarNome(nome){
        if (typeof nome !== 'string' || nome.trim() === '') {
            throw new ErroValidacao('Campo "nome" obrigatório.');
        }
        const limpo = nome.trim();
        if (limpo.length > 150) {
            throw new ErroValidacao('O nome da foto deve ter no máximo 150 caracteres.');
        }
        return limpo;
    }

    static validarData(valor, { padraoAgora = false } = {}) {
        if (!preenchido(valor)) {
            if (padraoAgora) return new Date();
            throw new ErroValidacao('O campo "data" não pode ficar vazio.');
        }
        const data = converterData(valor);
        if (data > new Date()) {
            throw new ErroValidacao('A data da foto não pode ser futura.');
        }
        return data;
    }

    static validarTextoOpcional(valor, campo, max) {
        if (valor === undefined || valor === null) return '';
        if (typeof valor !== 'string') {
            throw new ErroValidacao(`O campo "${campo}" deve ser um texto.`);
        }
        const limpo = valor.trim();
        if (limpo.length > max) {
            throw new ErroValidacao(`O campo "${campo}" deve ter no máximo ${max} caracteres.`);
        }
        return limpo;
    }

    static validarTags(valor) {
        if (!preenchido(valor) && !Array.isArray(valor)) return [];
        const lista = Array.isArray(valor) ? valor : String(valor).split(',');
        const tags = [
            ...new Set(
                lista.map((t) => String(t).trim().toLowerCase()).filter((t) => t !== '')
            ),
        ];
        if (tags.length > 20) throw new ErroValidacao('Use no máximo 20 tags.');
        if (tags.some((t) => t.length > 30)) {
            throw new ErroValidacao('Cada tag deve ter no máximo 30 caracteres.');
        }
        return tags;
    }

    static validarTamanho(valor) {
        if (!preenchido(valor)) return null;
        const numero = Number(String(valor).replace(',', '.'));
        if (!Number.isFinite(numero) || numero <= 0) {
            throw new ErroValidacao('O tamanho (KB) deve ser um número maior que zero.');
        }
        return numero;
    }

    static validarFormato(valor) {
        if (!preenchido(valor)) return null;
        const formato = String(valor).trim().toLowerCase().replace(/^\./, '');
        if (!FORMATOS_PERMITIDOS.includes(formato)) {
            throw new ErroValidacao(
                `Formato inválido. Use um destes: ${FORMATOS_PERMITIDOS.join(', ')}.`
            );
        }
        return formato;
    }

    async inserir(){
        const usuarioId = converterId(this.usuarioId);
        const documento = {
            usuarioId,
            nome: Foto.validarNome(this.nome),
            descricao: Foto.validarTextoOpcional(this.descricao, 'descrição', 500),
            data: Foto.validarData(this.data, { padraoAgora: true }),
            tags: Foto.validarTags(this.tags),
            tamanhoKB: Foto.validarTamanho(this.tamanhoKB),
            formato: Foto.validarFormato(this.formato),
            local: Foto.validarTextoOpcional(this.local, 'local', 150),
        };

        const dono = await executarNoBanco('consultar usuário', () =>
            getBanco().collection('usuarios').findOne({ _id: usuarioId }, { projection: { _id: 1 } })
        );
        if (!dono) throw new ErroNaoEncontrado('Usuário não encontrado.');

        const resultado = await executarNoBanco('inserir foto', () =>
            colecao().insertOne(documento)
        );
        this._id = resultado.insertedId;
        return this._id;
    }

    static async buscarPorId(usuarioId, id) {
        const consulta = { _id: converterId(id), usuarioId: converterId(usuarioId) };
        const foto = await executarNoBanco('consultar foto', () => colecao().findOne(consulta));
        if (!foto) throw new ErroNaoEncontrado('Foto não encontrada.');
        return foto;
    }

    static async buscar(usuarioId, filtros = {}) {
        const consulta = { usuarioId: converterId(usuarioId) };

        if (preenchido(filtros.nome)) {
            consulta.nome = { $regex: escaparRegex(String(filtros.nome).trim()), $options: 'i' };
        }

        if (preenchido(filtros.tag)) {
            consulta.tags = String(filtros.tag).trim().toLowerCase();
        }

        if (preenchido(filtros.formato)) {
            consulta.formato = Foto.validarFormato(filtros.formato);
        }

        const inicial = preenchido(filtros.dataInicial) ? converterData(filtros.dataInicial) : null;
        const final = preenchido(filtros.dataFinal) ? converterData(filtros.dataFinal) : null;
        if (inicial && final && inicial > final) {
            throw new ErroValidacao('A data inicial não pode ser maior que a data final.');
        }
        if (inicial || final) {
            consulta.data = {};
            if (inicial) consulta.data.$gte = inicial;
            if (final) {
                consulta.data.$lte = new Date(
                    final.getFullYear(), final.getMonth(), final.getDate(), 23, 59, 59, 999
                );
            }
        }

        if (preenchido(filtros.albumId)) {
            const albumId = converterId(filtros.albumId);
            const album = await executarNoBanco('consultar álbum', () =>
                getBanco().collection('albuns').findOne({ _id: albumId, usuarioId: consulta.usuarioId })
            );
            if (!album) throw new ErroNaoEncontrado('Álbum não encontrado.');
            consulta._id = { $in: album.fotoIds ?? [] };
        }

        return await executarNoBanco('buscar fotos', () =>
            colecao().find(consulta).sort({ data: -1 }).toArray()
        );
    }

    static async atualizar(usuarioId, id, dados = {}) {
        const filtro = { _id: converterId(id), usuarioId: converterId(usuarioId) };
        const campos = {};

        if (dados.nome !== undefined) campos.nome = Foto.validarNome(dados.nome);
        if (dados.data !== undefined) campos.data = Foto.validarData(dados.data);
        if (dados.descricao !== undefined)
            campos.descricao = Foto.validarTextoOpcional(dados.descricao, 'descrição', 500);
        if (dados.tags !== undefined) campos.tags = Foto.validarTags(dados.tags);
        if (dados.tamanhoKB !== undefined) campos.tamanhoKB = Foto.validarTamanho(dados.tamanhoKB);
        if (dados.formato !== undefined) campos.formato = Foto.validarFormato(dados.formato);
        if (dados.local !== undefined)
            campos.local = Foto.validarTextoOpcional(dados.local, 'local', 150);

        if (Object.keys(campos).length === 0) {
            throw new ErroValidacao('Nenhum campo para atualizar foi informado.');
        }

        const resultado = await executarNoBanco('atualizar foto', () =>
            colecao().updateOne(filtro, { $set: campos })
        );
        if (resultado.matchedCount === 0) throw new ErroNaoEncontrado('Foto não encontrada.');
    }

    static async excluir(usuarioId, id) {
        const _id = converterId(id);
        const dono = converterId(usuarioId);

        const foto = await executarNoBanco('consultar foto', () =>
            colecao().findOne({ _id, usuarioId: dono }, { projection: { _id: 1 } })
        );
        if (!foto) throw new ErroNaoEncontrado('Foto não encontrada.');

        await executarNoBanco('excluir foto', async () => {
            await getBanco()
                .collection('albuns')
                .updateMany({ usuarioId: dono, fotoIds: _id }, { $pull: { fotoIds: _id } });
            await colecao().deleteOne({ _id, usuarioId: dono });
        });
    }
}
