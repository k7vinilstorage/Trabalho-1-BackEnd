import { conectar } from './config/database.js';
import { registrarErro } from './utils/logger.js';

try {
  await conectar();
} catch (erro) {
  await registrarErro('Conectar ao banco', erro);
  console.error(erro.message);
  process.exitCode = 1;
}
