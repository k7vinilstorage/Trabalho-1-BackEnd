import { ObjectId } from 'mongodb';
import { ErroValidacao } from './errors.js';

export function converteId(id){
    const texto = String(id ?? '').trim();
    if(!/^[0-9a-fA-F]{24}$/.test(texto)) {
        throw new ErroValidacao('ID inválido');
    }
    return new ObjectId(texto);
}

export function converterData(valor) {
  if (valor instanceof Date) {
    if (Number.isNaN(valor.getTime())) throw new ErroValidacao('Data inválida.');
    return valor;
  }

  const texto = String(valor ?? '').trim();
  let dia;
  let mes;
  let ano;

  let partes = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (partes) {
    dia = Number(partes[1]);
    mes = Number(partes[2]);
    ano = Number(partes[3]);
  } else {
    partes = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!partes) throw new ErroValidacao('Data inválida. Use o formato dd/mm/aaaa.');
    ano = Number(partes[1]);
    mes = Number(partes[2]);
    dia = Number(partes[3]);
  }

  const data = new Date(ano, mes - 1, dia);
  if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) {
    throw new ErroValidacao('Data inválida: esse dia não existe no calendário.');
  }
  return data;
}