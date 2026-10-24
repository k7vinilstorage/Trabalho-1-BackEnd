# Armazenamento de Fotos (Trabalho 1)

## 📌 Temática Escolhida
Armazenamento e gerenciamento pessoal de fotos e álbuns digitais via terminal, com persistência em banco de dados NoSQL (MongoDB).

---

## 👥 Integrantes da Equipe
- **Arthur Henrique**
- **João Torezan**

---

## 📖 Descrição da Aplicação
Aplicação interativa em linha de comando (CLI) desenvolvida em Node.js com conexão nativa ao MongoDB. O sistema permite que usuários se cadastrem com senhas criptografadas, organizem suas fotos em álbuns, realizem buscas avançadas com múltiplos filtros e gerenciem seus dados de forma intuitiva, exibindo os nomes e IDs dos registros disponíveis para facilitar a navegação.

---

## 🏛️ Entidades / Classes Implementadas

- **`Usuario` ([`src/models/Usuario.js`](src/models/Usuario.js))**:
  - Armazena `nome`, `email`, `senhaHash`, `salt` e `dataCadastro`.
  - Senhas protegidas usando `crypto.scrypt` com salt aleatório.
  - Garante e-mail único e realiza exclusão em cascata (remove usuário, álbuns e fotos associados).

- **`Album` ([`src/models/Album.js`](src/models/Album.js))**:
  - Armazena `usuarioId`, `nome`, `descricao` e `fotoIds` (referências às fotos).
  - Garante nome de álbum único por usuário via índice no MongoDB.
  - Métodos para adicionar, remover e listar fotos vinculadas.

- **`Foto` ([`src/models/Foto.js`](src/models/Foto.js))**:
  - Armazena `usuarioId`, `nome`, `descricao`, `data`, `tags` (array), `tamanhoKB`, `formato` e `local`.
  - Validações de data (não futura), formato permitido (`jpg`, `png`, `webp`, etc.) e tamanho.
  - Ao ser excluída, é automaticamente removida de todos os álbuns em que estava inserida.

- **Camada de Controle e Utilidades**:
  - `UsuarioController`, `AlbumController` e `FotoController`: intermedeiam as regras de negócio e autenticação.
  - `executar`: captura erros e centraliza mensagens amigáveis.
  - `logger`: registra falhas e exceções em `logs/erros.log`.

---

## ⚡ Principais Funcionalidades

1. **Conta de Usuário**:
   - Cadastro e login seguro;
   - Consulta de perfil;
   - Atualização de dados cadastrais;
   - Exclusão de conta (com limpeza em cascata).

2. **Gerenciamento de Álbuns**:
   - Criação de álbuns;
   - Listagem com filtro opcional por nome;
   - Consulta detalhada do álbum e exibição das fotos contidas nele;
   - Atualização de nome e descrição;
   - Adição e remoção de fotos no álbum;
   - Exclusão de álbuns.

3. **Gerenciamento de Fotos**:
   - Cadastro completo de fotos com tags, tamanho, formato e localização;
   - Busca flexível combinando filtros: nome parcial, tag, formato, período de datas e por álbum;
   - Visualização de detalhes completos da foto;
   - Atualização de informações da foto;
   - Exclusão com desvinculação automática de álbuns.

4. **Facilidades na Interface de Terminal**:
   - Listagem automática de nomes e IDs disponíveis antes de solicitar alterações, inclusões ou exclusões.

---

## 💻 Requisitos Necessários

- **Node.js** (versão 18.x ou superior, com suporte nativo a ES Modules)
- **npm** (gerenciador de pacotes do Node.js)
- **MongoDB** (instância ativa localmente na porta padrão `27017`)

---

## 📦 Instalação das Dependências

No diretório raiz do projeto, execute:

```bash
npm install
```

---

## 🗄️ Configuração do MongoDB

A aplicação utiliza o driver oficial do MongoDB e conecta por padrão na URL:
`mongodb://127.0.0.1:27017` no banco `web2_db` (definido em [`src/config/database.js`](src/config/database.js)).

1. Certifique-se de que o serviço do MongoDB está em execução na sua máquina:
   ```bash
   # Em sistemas Linux com systemd:
   sudo systemctl start mongod

   # Ou via Docker (caso prefira contêiner):
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Não é necessário criar coleções ou índices manualmente**: a própria aplicação cria automaticamente os índices únicos necessários (`usuarios.email` e `albuns.usuarioId + nome`) na primeira inicialização.

---

## 🚀 Execução do Projeto

Para iniciar o sistema em modo terminal:

```bash
npm start
```
*(ou execute diretamente: `node src/index.js`)*

### 🔑 Usuário de Teste (Opcional)
Caso queira testar imediatamente com dados pré-carregados (álbuns e fotos já criados):
- **E-mail:** `a@a.c`
- **Senha:** `123456`
