import { perguntar } from './entrada.js';
import { AlbumController } from '../controllers/AlbumController.js';
import { FotoController } from '../controllers/FotoController.js';
import { UsuarioController } from '../controllers/UserController.js';

async function listarAlbunsDisponiveis() {
  const resultado = await AlbumController.listar();
  if (!resultado.sucesso) {
    console.log(`Erro ao buscar álbuns: ${resultado.mensagem}`);
    return null;
  }
  const albuns = resultado.dados;
  if (albuns.length === 0) {
    console.log('Nenhum álbum disponível.');
    return null;
  }
  console.log('\n--- Álbuns disponíveis ---');
  for (const album of albuns) {
    console.log(`Nome: "${album.nome}" | ID: ${album._id}`);
  }
  console.log('-------------------------');
  return albuns;
}

async function listarFotosDisponiveis() {
  const resultado = await FotoController.buscar();
  if (!resultado.sucesso) {
    console.log(`Erro ao buscar fotos: ${resultado.mensagem}`);
    return null;
  }
  const fotos = resultado.dados;
  if (fotos.length === 0) {
    console.log('Nenhuma foto disponível.');
    return null;
  }
  console.log('\n--- Fotos disponíveis ---');
  for (const foto of fotos) {
    console.log(`Nome: "${foto.nome}" | ID: ${foto._id}`);
  }
  console.log('-------------------------');
  return fotos;
}

async function criarAlbum() {
  const nome = await perguntar('Nome do álbum: ');
  const descricao = await perguntar('Descrição (opcional): ');

  const resultado = await AlbumController.criar({ nome, descricao });
  if (resultado.sucesso) {
    console.log(`Álbum criado com sucesso! (ID: ${resultado.dados})`);
  } else {
    console.log(`Erro: ${resultado.mensagem}`);
  }
}

async function listarAlbuns() {
  const nome = await perguntar('Filtrar por nome (deixe em branco para todos): ');
  const filtros = {};
  if (nome !== '') {
    filtros.nome = nome;
  }

  const resultado = await AlbumController.listar(filtros);
  if (resultado.sucesso) {
    const albuns = resultado.dados;
    if (albuns.length === 0) {
      console.log('Nenhum álbum encontrado.');
      return;
    }
    console.log(`\n--- Álbuns (${albuns.length}) ---`);
    for (const album of albuns) {
      const qtdFotos = album.fotoIds ? album.fotoIds.length : 0;
      console.log(`ID: ${album._id}`);
      console.log(`  Nome: ${album.nome}`);
      if (album.descricao) console.log(`  Descrição: ${album.descricao}`);
      console.log(`  Quantidade de fotos: ${qtdFotos}`);
      console.log('------------------------------');
    }
  } else {
    console.log(`Erro: ${resultado.mensagem}`);
  }
}

async function verDetalhesAlbum() {
  const albuns = await listarAlbunsDisponiveis();
  if (!albuns) return;

  const id = await perguntar('ID do álbum (deixe em branco para cancelar): ');
  if (id === '') {
    console.log('Operação cancelada.');
    return;
  }

  const resultado = await AlbumController.consultar(id);
  if (resultado.sucesso) {
    const album = resultado.dados;
    console.log(`\n=== Álbum: ${album.nome} ===`);
    console.log(`ID: ${album._id}`);
    console.log(`Descrição: ${album.descricao || '(sem descrição)'}`);
    const qtdFotos = album.fotoIds ? album.fotoIds.length : 0;
    console.log(`Total de fotos: ${qtdFotos}`);

    if (qtdFotos > 0) {
      const fotosRes = await AlbumController.listarFotos(id);
      if (fotosRes.sucesso && fotosRes.dados.length > 0) {
        console.log('\nFotos no álbum:');
        for (const foto of fotosRes.dados) {
          const dataStr = foto.data instanceof Date
            ? foto.data.toLocaleDateString('pt-BR')
            : String(foto.data);
          console.log(`  - Nome: "${foto.nome}" | ID: ${foto._id} (${dataStr})`);
        }
      }
    }
  } else {
    console.log(`Erro: ${resultado.mensagem}`);
  }
}

async function atualizarAlbum() {
  const albuns = await listarAlbunsDisponiveis();
  if (!albuns) return;

  const id = await perguntar('ID do álbum a atualizar (deixe em branco para cancelar): ');
  if (id === '') {
    console.log('Operação cancelada.');
    return;
  }

  console.log('Deixe em branco para manter o valor atual.');
  const nome = await perguntar('Novo nome: ');
  const descricao = await perguntar('Nova descrição: ');

  const dados = {};
  if (nome !== '') dados.nome = nome;
  if (descricao !== '') dados.descricao = descricao;

  const resultado = await AlbumController.atualizar(id, dados);
  if (resultado.sucesso) {
    console.log('Álbum atualizado com sucesso!');
  } else {
    console.log(`Erro: ${resultado.mensagem}`);
  }
}

async function adicionarFotoAoAlbum() {
  const albuns = await listarAlbunsDisponiveis();
  if (!albuns) return;

  const albumId = await perguntar('ID do álbum (deixe em branco para cancelar): ');
  if (albumId === '') {
    console.log('Operação cancelada.');
    return;
  }

  const fotos = await listarFotosDisponiveis();
  if (!fotos) return;

  const fotoId = await perguntar('ID da foto (deixe em branco para cancelar): ');
  if (fotoId === '') {
    console.log('Operação cancelada.');
    return;
  }

  const resultado = await AlbumController.adicionarFoto(albumId, fotoId);
  if (resultado.sucesso) {
    console.log('Foto adicionada ao álbum com sucesso!');
  } else {
    console.log(`Erro: ${resultado.mensagem}`);
  }
}

async function removerFotoDoAlbum() {
  const albuns = await listarAlbunsDisponiveis();
  if (!albuns) return;

  const albumId = await perguntar('ID do álbum (deixe em branco para cancelar): ');
  if (albumId === '') {
    console.log('Operação cancelada.');
    return;
  }

  const fotosRes = await AlbumController.listarFotos(albumId);
  if (!fotosRes.sucesso) {
    console.log(`Erro ao buscar fotos do álbum: ${fotosRes.mensagem}`);
    return;
  }
  const fotos = fotosRes.dados;
  if (fotos.length === 0) {
    console.log('Este álbum não possui fotos.');
    return;
  }

  console.log('\n--- Fotos neste álbum ---');
  for (const foto of fotos) {
    console.log(`Nome: "${foto.nome}" | ID: ${foto._id}`);
  }
  console.log('-------------------------');

  const fotoId = await perguntar('ID da foto a remover (deixe em branco para cancelar): ');
  if (fotoId === '') {
    console.log('Operação cancelada.');
    return;
  }

  const resultado = await AlbumController.removerFoto(albumId, fotoId);
  if (resultado.sucesso) {
    console.log('Foto removida do álbum com sucesso!');
  } else {
    console.log(`Erro: ${resultado.mensagem}`);
  }
}

async function excluirAlbum() {
  const albuns = await listarAlbunsDisponiveis();
  if (!albuns) return;

  const id = await perguntar('ID do álbum a excluir (deixe em branco para cancelar): ');
  if (id === '') {
    console.log('Operação cancelada.');
    return;
  }

  const confirmacao = await perguntar('Tem certeza que deseja excluir este álbum? (s/n): ');
  if (confirmacao.toLowerCase() !== 's') {
    console.log('Exclusão cancelada.');
    return;
  }

  const resultado = await AlbumController.excluir(id);
  if (resultado.sucesso) {
    console.log('Álbum excluído com sucesso!');
  } else {
    console.log(`Erro: ${resultado.mensagem}`);
  }
}

export async function menuAlbum() {
  let voltar = false;
  while (!voltar) {
    console.log('\n=== Gerenciar Álbuns ===');
    console.log('1 - Criar álbum');
    console.log('2 - Listar álbuns');
    console.log('3 - Ver detalhes do álbum');
    console.log('4 - Atualizar álbum');
    console.log('5 - Adicionar foto ao álbum');
    console.log('6 - Remover foto do álbum');
    console.log('7 - Excluir álbum');
    console.log('0 - Voltar');

    const opcao = await perguntar('Opção: ');
    switch (opcao) {
      case '1': await criarAlbum(); break;
      case '2': await listarAlbuns(); break;
      case '3': await verDetalhesAlbum(); break;
      case '4': await atualizarAlbum(); break;
      case '5': await adicionarFotoAoAlbum(); break;
      case '6': await removerFotoDoAlbum(); break;
      case '7': await excluirAlbum(); break;
      case '0': voltar = true; break;
      default: console.log('Opção inválida.');
    }

    if (!UsuarioController.usuarioLogado) {
      voltar = true;
    }
  }
}
