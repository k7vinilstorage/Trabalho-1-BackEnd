import { perguntar } from './entrada.js';
import { FotoController } from '../controllers/FotoController.js';
import { AlbumController } from '../controllers/AlbumController.js';
import { UsuarioController } from '../controllers/UserController.js';

function formatarData(data) {
  if (!data) return '';
  if (data instanceof Date) return data.toLocaleDateString('pt-BR');
  return String(data);
}

function exibirFoto(foto) {
  console.log(`ID: ${foto._id}`);
  console.log(`  Nome: ${foto.nome}`);
  if (foto.descricao) console.log(`  Descrição: ${foto.descricao}`);
  console.log(`  Data: ${formatarData(foto.data)}`);
  if (foto.tags && foto.tags.length > 0) console.log(`  Tags: ${foto.tags.join(', ')}`);
  if (foto.formato) console.log(`  Formato: ${foto.formato}`);
  if (foto.tamanhoKB !== null && foto.tamanhoKB !== undefined) console.log(`  Tamanho: ${foto.tamanhoKB} KB`);
  if (foto.local) console.log(`  Local: ${foto.local}`);
  console.log('------------------------------');
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

async function listarAlbunsDisponiveis() {
  const resultado = await AlbumController.listar();
  if (!resultado.sucesso) return null;
  const albuns = resultado.dados;
  if (albuns.length === 0) return null;
  console.log('\n--- Álbuns disponíveis (opcional) ---');
  for (const album of albuns) {
    console.log(`Nome: "${album.nome}" | ID: ${album._id}`);
  }
  console.log('------------------------------------');
  return albuns;
}

async function cadastrarFoto() {
  const nome = await perguntar('Nome da foto: ');
  const descricao = await perguntar('Descrição (opcional): ');
  const data = await perguntar('Data (dd/mm/aaaa ou deixe em branco para hoje): ');
  const tags = await perguntar('Tags (separadas por vírgula, opcional): ');
  const tamanhoKB = await perguntar('Tamanho em KB (opcional): ');
  const formato = await perguntar('Formato (jpg, png, gif, webp, etc. - opcional): ');
  const local = await perguntar('Local (opcional): ');

  const dados = { nome };
  if (descricao !== '') dados.descricao = descricao;
  if (data !== '') dados.data = data;
  if (tags !== '') dados.tags = tags;
  if (tamanhoKB !== '') dados.tamanhoKB = tamanhoKB;
  if (formato !== '') dados.formato = formato;
  if (local !== '') dados.local = local;

  const resultado = await FotoController.cadastrar(dados);
  if (resultado.sucesso) {
    console.log(`Foto cadastrada com sucesso! (ID: ${resultado.dados})`);
  } else {
    console.log(`Erro: ${resultado.mensagem}`);
  }
}

async function buscarFotos() {
  console.log('\n--- Filtros de busca (deixe em branco para ignorar) ---');
  const nome = await perguntar('Nome parcial: ');
  const tag = await perguntar('Tag: ');
  const formato = await perguntar('Formato: ');
  const dataInicial = await perguntar('Data inicial (dd/mm/aaaa): ');
  const dataFinal = await perguntar('Data final (dd/mm/aaaa): ');

  await listarAlbunsDisponiveis();
  const albumId = await perguntar('ID do álbum: ');

  const filtros = {};
  if (nome !== '') filtros.nome = nome;
  if (tag !== '') filtros.tag = tag;
  if (formato !== '') filtros.formato = formato;
  if (dataInicial !== '') filtros.dataInicial = dataInicial;
  if (dataFinal !== '') filtros.dataFinal = dataFinal;
  if (albumId !== '') filtros.albumId = albumId;

  const resultado = await FotoController.buscar(filtros);
  if (resultado.sucesso) {
    const fotos = resultado.dados;
    if (fotos.length === 0) {
      console.log('Nenhuma foto encontrada.');
      return;
    }
    console.log(`\n--- Fotos encontradas (${fotos.length}) ---`);
    for (const foto of fotos) {
      exibirFoto(foto);
    }
  } else {
    console.log(`Erro: ${resultado.mensagem}`);
  }
}

async function verDetalhesFoto() {
  const fotos = await listarFotosDisponiveis();
  if (!fotos) return;

  const id = await perguntar('ID da foto (deixe em branco para cancelar): ');
  if (id === '') {
    console.log('Operação cancelada.');
    return;
  }

  const resultado = await FotoController.consultar(id);
  if (resultado.sucesso) {
    const foto = resultado.dados;
    console.log(`\n=== Detalhes da Foto ===`);
    exibirFoto(foto);
  } else {
    console.log(`Erro: ${resultado.mensagem}`);
  }
}

async function atualizarFoto() {
  const fotos = await listarFotosDisponiveis();
  if (!fotos) return;

  const id = await perguntar('ID da foto a atualizar (deixe em branco para cancelar): ');
  if (id === '') {
    console.log('Operação cancelada.');
    return;
  }

  console.log('Deixe em branco para manter o valor atual.');
  const nome = await perguntar('Novo nome: ');
  const descricao = await perguntar('Nova descrição: ');
  const data = await perguntar('Nova data (dd/mm/aaaa): ');
  const tags = await perguntar('Novas tags (separadas por vírgula): ');
  const tamanhoKB = await perguntar('Novo tamanho em KB: ');
  const formato = await perguntar('Novo formato: ');
  const local = await perguntar('Novo local: ');

  const dados = {};
  if (nome !== '') dados.nome = nome;
  if (descricao !== '') dados.descricao = descricao;
  if (data !== '') dados.data = data;
  if (tags !== '') dados.tags = tags;
  if (tamanhoKB !== '') dados.tamanhoKB = tamanhoKB;
  if (formato !== '') dados.formato = formato;
  if (local !== '') dados.local = local;

  const resultado = await FotoController.atualizar(id, dados);
  if (resultado.sucesso) {
    console.log('Foto atualizada com sucesso!');
  } else {
    console.log(`Erro: ${resultado.mensagem}`);
  }
}

async function excluirFoto() {
  const fotos = await listarFotosDisponiveis();
  if (!fotos) return;

  const id = await perguntar('ID da foto a excluir (deixe em branco para cancelar): ');
  if (id === '') {
    console.log('Operação cancelada.');
    return;
  }

  const confirmacao = await perguntar('Tem certeza que deseja excluir esta foto? (s/n): ');
  if (confirmacao.toLowerCase() !== 's') {
    console.log('Exclusão cancelada.');
    return;
  }

  const resultado = await FotoController.excluir(id);
  if (resultado.sucesso) {
    console.log('Foto excluída com sucesso!');
  } else {
    console.log(`Erro: ${resultado.mensagem}`);
  }
}

export async function menuFoto() {
  let voltar = false;
  while (!voltar) {
    console.log('\n=== Gerenciar Fotos ===');
    console.log('1 - Cadastrar foto');
    console.log('2 - Buscar / Listar fotos');
    console.log('3 - Ver detalhes da foto');
    console.log('4 - Atualizar foto');
    console.log('5 - Excluir foto');
    console.log('0 - Voltar');

    const opcao = await perguntar('Opção: ');
    switch (opcao) {
      case '1': await cadastrarFoto(); break;
      case '2': await buscarFotos(); break;
      case '3': await verDetalhesFoto(); break;
      case '4': await atualizarFoto(); break;
      case '5': await excluirFoto(); break;
      case '0': voltar = true; break;
      default: console.log('Opção inválida.');
    }

    if (!UsuarioController.usuarioLogado) {
      voltar = true;
    }
  }
}
