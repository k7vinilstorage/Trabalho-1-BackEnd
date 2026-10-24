import { MongoClient } from 'mongodb';
import { ErroConflito, ErroBanco } from '../utils/errors.js';

export const StringCon = {
  connection: 'mongodb://127.0.0.1:27017',
  dbName: 'web2_db'
};

const client = new MongoClient(StringCon.connection);
let banco = null;

export async function conectar() {
  try {
    await client.connect();
    banco = client.db(StringCon.dbName);

    await banco.collection('usuarios').createIndex({ email: 1 }, { unique: true });
  } catch (erro) {
    throw new ErroBanco(`Falha ao conectar ao banco: ${erro.message}`);
  }

  console.log('conectado');
  return banco;
}

export async function desconectar() {
  await client.close();
  banco = null;
}

export function getBanco() {
  if (!banco) {
    throw new ErroBanco('Banco não conectado.');
  }
  return banco;
}

export async function executarNoBanco(descricao, funcao, mensagemConflito = 'Já existe um registro com estes dados'){
  try {
    return await funcao();
  } catch (erro) {
    if(erro.code === 11000){
      throw new ErroConflito(mensagemConflito);
    }
    throw new ErroBanco(`Falha ao ${descricao}: ${erro.message}`);
  }
}
