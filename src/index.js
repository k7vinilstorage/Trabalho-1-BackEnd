import { app } from '../app.js';
import { conectar } from './config/database.js';
import { registrarErro } from './utils/logger.js';

const PORTA = process.env.PORT || 3000;

try {
  await conectar();
} catch (erro) {
  await registrarErro('Conectar ao banco', erro);
  console.error(erro.message);
  process.exit(1);
}

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
