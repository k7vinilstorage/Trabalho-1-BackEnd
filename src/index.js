import { conectar } from './config/database.js';
import { registrarErro } from './utils/logger.js';
import { menuPrincipal } from './views/menuPrincipal.js';

try {
  await conectar();
} catch (erro) {
  await registrarErro('Conectar ao banco', erro);
  console.error(erro.message);
  process.exit(1);
}

await menuPrincipal();
