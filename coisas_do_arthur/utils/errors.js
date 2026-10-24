export class ErroValidacao extends Erros{
    constructor(message){
        super(message);
        this.name = 'ErroValidacao';
    }    
}

export class ErroNaoencontrado extends Erros{
    constructor(message){
        super(message);
        this.name = "ErroNaoEncontrado";
    }    
}

export class ErroConflito extends Erros{
    constructor(message){
        super(message);
        this.name = 'ErroConflito';
    }    
}

export class ErroAutenticacao extends Erros{
    constructor(message){
        super(message);
        this.name = 'ErroAutenticacao';
    }    
}

export class ErroBanco extends Erros{
    constructor(message){
        super(message);
        this.name = 'ErroBanco';
    }    
}
