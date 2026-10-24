import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const rl = readline.createInterface({ input, output });

export async function perguntar(texto) {
  const resposta = await rl.question(texto);
  return resposta.trim();
}

export function fecharEntrada() {
  rl.close();
}
