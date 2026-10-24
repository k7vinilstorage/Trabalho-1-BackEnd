import { perguntar, fecharEntrada } from './entrada.js';
import { menuUsuario } from './menuUsuario.js';
import { menuAlbum } from './menuAlbum.js';
import { menuFoto } from './menuFoto.js';
import { UsuarioController } from '../controllers/UserController.js';
import { desconectar } from '../config/database.js';

async function cadastrar() {
  const nome = await perguntar('Nome: ');
  const email = await perguntar('E-mail: ');
  const senha = await perguntar('Senha: ');

  const resultado = await UsuarioController.cadastrar({ nome, email, senha });
  if (resultado.sucesso) {
    console.log('Usuário cadastrado com sucesso!');
  } else {
    console.log(`Erro: ${resultado.mensagem}`);
  }
}

async function login() {
  const email = await perguntar('E-mail: ');
  const senha = await perguntar('Senha: ');

  const resultado = await UsuarioController.login(email, senha);
  if (resultado.sucesso) {
    console.log(`Bem-vindo(a), ${resultado.dados.nome}!`);
  } else {
    console.log(`Erro: ${resultado.mensagem}`);
  }
}

// Retorna false quando o usuário escolhe sair
async function menuDeslogado() {
  console.log('\n=== Armazenamento de Fotos ===');
  console.log('1 - Cadastrar');
  console.log('2 - Login');
  console.log('0 - Sair');

  const opcao = await perguntar('Opção: ');
  switch (opcao) {
    case '1': await cadastrar(); break;
    case '2': await login(); break;
    case '0': return false;
    default: console.log('Opção inválida.');
  }
  return true;
}

async function menuLogado() {
  console.log(`\n=== Olá, ${UsuarioController.usuarioLogado.nome} ===`);
  console.log('1 - Minha conta');
  console.log('2 - Álbuns');
  console.log('3 - Fotos');
  console.log('4 - Logout');
  console.log('0 - Sair');

  const opcao = await perguntar('Opção: ');
  switch (opcao) {
    case '1': await menuUsuario(); break;
    case '2': await menuAlbum(); break;
    case '3': await menuFoto(); break;
    case '4':
      UsuarioController.logout();
      console.log('Logout realizado.');
      break;
    case '0': return false;
    default: console.log('Opção inválida.');
  }
  return true;
}

export async function menuPrincipal() {
  let rodando = true;
  while (rodando) {
    if (UsuarioController.usuarioLogado) {
      rodando = await menuLogado();
    } else {
      rodando = await menuDeslogado();
    }
  }

  fecharEntrada();
  await desconectar();
}
