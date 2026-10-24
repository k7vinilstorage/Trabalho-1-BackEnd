import { perguntar } from './entrada.js';
import { UsuarioController } from '../controllers/UserController.js';

async function verPerfil() {
  const resultado = await UsuarioController.consultarPerfil();
  if (resultado.sucesso) {
    const usuario = resultado.dados;
    console.log(`Nome: ${usuario.nome}`);
    console.log(`E-mail: ${usuario.email}`);
    console.log(`Cadastrado em: ${usuario.dataCadastro.toLocaleString('pt-BR')}`);
  } else {
    console.log(`Erro: ${resultado.mensagem}`);
  }
}

async function atualizarDados() {
  console.log('Deixe em branco para manter o valor atual.');
  const nome = await perguntar('Novo nome: ');
  const email = await perguntar('Novo e-mail: ');
  const senha = await perguntar('Nova senha: ');

  // Só envia os campos que foram preenchidos
  const dados = {};
  if (nome !== '') {
    dados.nome = nome;
  }
  if (email !== '') {
    dados.email = email;
  }
  if (senha !== '') {
    dados.senha = senha;
  }

  const resultado = await UsuarioController.atualizarPerfil(dados);
  if (resultado.sucesso) {
    console.log('Dados atualizados com sucesso!');
  } else {
    console.log(`Erro: ${resultado.mensagem}`);
  }
}

async function excluirConta() {
  const confirmacao = await perguntar('Tem certeza? Seus álbuns e fotos também serão apagados (s/n): ');
  if (confirmacao.toLowerCase() !== 's') {
    console.log('Exclusão cancelada.');
    return;
  }

  const resultado = await UsuarioController.excluirConta();
  if (resultado.sucesso) {
    console.log('Conta excluída.');
  } else {
    console.log(`Erro: ${resultado.mensagem}`);
  }
}

export async function menuUsuario() {
  let voltar = false;
  while (!voltar) {
    console.log('\n=== Minha conta ===');
    console.log('1 - Ver perfil');
    console.log('2 - Atualizar dados');
    console.log('3 - Excluir conta');
    console.log('0 - Voltar');

    const opcao = await perguntar('Opção: ');
    switch (opcao) {
      case '1': await verPerfil(); break;
      case '2': await atualizarDados(); break;
      case '3': await excluirConta(); break;
      case '0': voltar = true; break;
      default: console.log('Opção inválida.');
    }

    if (!UsuarioController.usuarioLogado) {
      voltar = true;
    }
  }
}
