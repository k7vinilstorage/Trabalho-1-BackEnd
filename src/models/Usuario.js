import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { getBanco } from '../config/database.js';
import { converteId } from '../utils/validacao.js';
import { ErroAutenticacao, ErroBanco, ErroConflito, ErroValidacao, ErroNaoencontrado } from '../utils/errors.js';

const scryptAsync = promisify(scrypt);
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const colecao = () => getBanco().collection('usuarios');

async function gerarHash(senha, salt){
    const hash = await scryptAsync(senha, salt, 64);
    return hash.toString('hex');
}

async function executarNoBanco(descricao, funcao){
    try {
        return await funcao();
    } catch (erro) {
        if(erro.code === 11000){
            throw new ErroConflito('Já existe um usuário com este e-mail');
        }
        throw new ErroBanco(`Falha ao ${descricao}: ${erro.message}`);
    }
}

export class Usuario {
    constructor({nome, email, senha} = {}){
        this.nome = nome;
        this.email = email;
        this.senha = senha;
    }

    static validarNome(nome){
        if(typeof nome !== 'string' || nome.trim() === ''){
            throw new ErroValidacao('Campo "nome" obrigatório.');
        }
        const limpo = nome.trim();
        if(limpo.length < 2 || limpo.length > 100){
            throw new ErroValidacao('O nome deve ter entre 2 e 100 caracteres.');
        }
        return limpo;
    }

    static validarEmail(email){
        if(typeof email !== 'string' || email.trim() === ''){
            throw new ErroValidacao('Campo "email" obrigatório.');
        }
        const limpo = email.trim().toLowerCase();
        if(!REGEX_EMAIL.test(limpo)){
            throw new ErroValidacao('E-mail em formato inválido.');
        }
        return limpo;
    }

    static validarSenha(senha){
        if(typeof senha !== 'string' || senha === ''){
            throw new ErroValidacao('Campo "senha" obrigatório.');
        }
        if (senha.length < 6){
            throw new ErroValidacao('A senha deve ter pelo menos 6 caracteres.');
        }
        return senha;
    }

    validar() {
        this.nome = Usuario.validarNome(this.nome);
        this.email = Usuario.validarEmail(this.email);
        this.senha = Usuario.validarSenha(this.senha);
    }

// Criar Usuário

    async inserir(){
        this.validar();

        const salt = randomBytes(16).toString('hex');
        const senhaHash = await gerarHash(this.senha, salt);
        this.senha = undefined;

        const documento = {
            nome: this.nome,
            email: this.email,
            senhaHash,
            salt,
            dataCadastro: new Date(),
        };

        const resultado = await executarNoBanco('inserir usuário', () => colecao().insertOne(documento));

        this._id = resultado.insertedId;
        return this._id;
    }

    static async autenticar(email, senha) {
        if (typeof email !== 'string' || email.trim() === '' || typeof senha !== 'string' || senha === '') {
        throw new ErroValidacao('Informe e-mail e senha.');
        }

        const usuario = await executarNoBanco('consultar usuário', () =>
        colecao().findOne({ email: email.trim().toLowerCase() })
        );

        const erroLogin = new ErroAutenticacao('E-mail ou senha incorretos.');
        if (!usuario) throw erroLogin;

        const hashInformado = Buffer.from(await gerarHash(senha, usuario.salt), 'hex');
        const hashSalvo = Buffer.from(usuario.senhaHash, 'hex');

        if(!timingSafeEqual(hashInformado, hashSalvo)) throw erroLogin;

        return { _id: usuario._id, nome: usuario.nome, email: usuario.email };
    }

    static async buscarPorId(id){
        const _id = converteId(id);
        const usuario = await executarNoBanco('consultar usuario', () => colecao().findOne({ _id }, { projection: { senhaHash: 0, salt: 0 } }));
        if(!usuario) throw new ErroNaoencontrado('Usuário não encontrado');
        return usuario;
    }

    static async atualizar(id, dados = {}){
        const _id = converteId(id);
        const campos = {};

        if(dados.nome !== undefined) campos.nome = Usuario.validarNome(dados.nome);
        if(dados.email !== undefined) campos.email = Usuario.validarEmail(dados.email);
        if(dados.senha !== undefined){
            const senha = Usuario.validarSenha(dados.senha);
            campos.salt = randomBytes(16).toString('hex');
            campos.senhaHash = await gerarHash(senha, campos.salt);
        }

        if(Object.keys(campos).length === 0){
            throw new ErroValidacao('Nenhum campo para atualizar foi informado');
        }

        const resultado = await executarNoBanco('atualizar usuário', () =>
        colecao().updateOne({ _id }, { $set: campos }));
        if(resultado.matchedCount === 0){
            throw new ErroNaoencontrado('Usuário não encontrado.');
        }
    }

    static async excluir(id){
        const _id = converteId(id);

        const existe = await executarNoBanco('consultar usuário', () =>
        colecao().findOne({ _id }, { projection: { _id: 1 } })
        );
        if (!existe) throw new ErroNaoencontrado('Usuário não encontrado.');

        await executarNoBanco('excluir usuário', async () => {
        const banco = getBanco();
        await banco.collection('albuns').deleteMany({ usuarioId: _id });
        await banco.collection('fotos').deleteMany({ usuarioId: _id });
        await colecao().deleteOne({ _id });
        });
    }
}



