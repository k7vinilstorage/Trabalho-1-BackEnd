export class ErroValidacao extends Error{
    constructor(message){
        super(message);
        this.name = 'ErroValidacao';
    }    
}

export class ErroNaoencontrado extends Error{
    constructor(message){
        super(message);
        this.name = "ErroNaoEncontrado";
    }    
}

export class ErroConflito extends Error{
    constructor(message){
        super(message);
        this.name = 'ErroConflito';
    }    
}

export class ErroAutenticacao extends Error{
    constructor(message){
        super(message);
        this.name = 'ErroAutenticacao';
    }    
}

export class ErroBanco extends Error{
    constructor(message){
        super(message);
        this.name = 'ErroBanco';
    }    
}
