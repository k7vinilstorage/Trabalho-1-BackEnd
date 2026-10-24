import { registrarErro } from '../utils/logger.js';

const ERROS_CONHECIDOS = [
  'ErroValidacao',
  'ErroNaoEncontrado',
  'ErroConflito',
  'ErroAutenticacao',
  'ErroBanco',
];

// Executa "funcao"; se der erro, registra no log e devolve uma resposta amigável.
export async function executar(operacao, funcao) {
  try {
    const dados = await funcao();
    return { sucesso: true, dados };
  } catch (erro) {
    await registrarErro(operacao, erro);
    const conhecido = ERROS_CONHECIDOS.includes(erro?.name);
    return {
      sucesso: false,
      // Erros nossos têm mensagem própria; os inesperados não expõem detalhes técnicos
      mensagem: conhecido
        ? erro.message
        : 'Ocorreu um erro inesperado. Consulte o arquivo de log.',
    };
  }
}