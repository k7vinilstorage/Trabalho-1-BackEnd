import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const pastaAtual = path.dirname(fileURLToPath(import.meta.url));
const PASTA_LOGS = path.resolve(pastaAtual, '..', '..', 'logs');
const ARQUIVO_LOG = path.join(PASTA_LOGS, 'erros.log');

function dataHoraAtual(){
    const agora = new Date();
    const dois = (n) => String(n).padStart(2,'0');
    const data = `${dois(agora.getDate())}/${dois(agora.getMonth() + 1)}/${agora.getFullYear()}`;
    const hora = `${dois(agora.getHours())}:${dois(agora.getMinutes())}:${dois(agora.getSeconds())}`;
    return `${data} ${hora}`;
}

export async function registrarErro(operacao, erro) {
    const registro = 
        `[${dataHoraAtual()}]\n`+
        `ERRO: Falha ao executar a operação "${operacao}"\n` +
        `TIPO: ${erro?.name ?? 'Erro desconhecido'}\n` +
        `MENSAGEM: ${erro?.message ?? String(erro)}\n\n`;

    try {
        await mkdir(PASTA_LOGS, {recursive: true});
        await appendFile(ARQUIVO_LOG, registro, 'utf-8');
    } catch (erroAoGravar) {
        console.error('Não foi possível gravar no arquivo de log:', erroAoGravar.message);
    }
}