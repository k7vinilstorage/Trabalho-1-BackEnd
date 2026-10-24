import { ObjectId } from 'mongodb';
import { ErroValidacao } from './errors.js';

export function converteId(id){
    const texto = String(id ?? '').trim();
    if(!/^[0-9a-fA-F]{24}$/.test(texto)) {
        throw new ErroValidacao('ID inválido');
    }
    return new ObjectId(texto);
}