# Armazenamento de Fotos — Projeto 2 (Express.js + MongoDB)

## 📌 Temática Escolhida
Armazenamento e gerenciamento pessoal de fotos e álbuns digitais via aplicação Web (Express.js + Handlebars), com persistência em banco de dados NoSQL (MongoDB) e controle de acesso por sessões (`express-session`).

---

## 👥 Integrantes da Equipe
- **Arthur Henrique**
- **João Torezan**

---

## 📖 Descrição da Aplicação
O **Projeto 2** evolui a aplicação em linha de comando desenvolvida no Projeto 1 para uma aplicação Web completa seguindo a arquitetura **MVC (Model–View–Controller)** com **Express.js**, templates server-side (**Handlebars**) e gerenciamento de sessões (**`express-session`**).

Todas as classes de domínio, validações de back-end, regras de integridade referencial, tratamento de erros, criptografia de senhas (`node:crypto`) e registro em arquivo de log (`logs/erros.log`) construídos no Projeto 1 foram integralmente reaproveitados e adaptados ao fluxo HTTP (`GET` e `POST`).

---

## 🏛️ Entidades e Camadas Implementadas

- **Models (`src/models/`)**:
  - **`Usuario` ([`src/models/Usuario.js`](src/models/Usuario.js))**: Armazena `nome`, `email`, `senhaHash`, `salt` e `dataCadastro`. Protege senhas com `crypto.scrypt` e `timingSafeEqual`, garante e-mail único e executa exclusão em cascata (remove usuário, álbuns e fotos associados).
  - **`Album` ([`src/models/Album.js`](src/models/Album.js))**: Armazena `usuarioId`, `nome`, `descricao` e `fotoIds`. Garante nome único por usuário via índice composto no MongoDB e gerencia o vínculo/desvínculo de fotos (`$addToSet` e `$pull`).
  - **`Foto` ([`src/models/Foto.js`](src/models/Foto.js))**: Armazena `usuarioId`, `nome`, `descricao`, `data`, `tags`, `tamanhoKB`, `formato` e `local`. Realiza validações de data (não futura), formatos permitidos (`jpg`, `jpeg`, `png`, `gif`, `webp`, `bmp`, `heic`), tamanho, tags e buscas combinadas. Ao excluir uma foto, remove-a automaticamente de todos os álbuns.
- **Controllers ([`src/controllers/`](src/controllers/))**:
  - `UsuarioController` ([`src/controllers/UserController.js`](src/controllers/UserController.js)), `AlbumController` ([`src/controllers/AlbumController.js`](src/controllers/AlbumController.js)) e `FotoController` ([`src/controllers/FotoController.js`](src/controllers/FotoController.js)): Processam parâmetros `GET`/`POST`, integram-se à sessão (`req.session.usuario`), invocam os Models e renderizam as Views ou redirecionam com mensagens de feedback.
  - [`executar`](src/controllers/executar.js): Wrapper central que captura exceções de negócio e inesperadas, grava em `logs/erros.log` e devolve mensagens amigáveis sem expor detalhes internos.
- **Middlewares e Rotas ([`src/middlewares/`](src/middlewares/) e [`src/routes/`](src/routes/))**:
  - `exigirAutenticacao` ([`src/middlewares/autenticacao.js`](src/middlewares/autenticacao.js)): Bloqueia rotas protegidas quando não há usuário na sessão, registra `ErroAutenticacao` no log e redireciona para `/login`.
  - `indexRoutes`, `usuarioRoutes`, `albumRoutes` e `fotoRoutes`: Organizam as rotas públicas e protegidas da aplicação.
- **Views e Estáticos ([`src/views/`](src/views/) e [`public/`](public/))**:
  - Templates `.hbs` renderizados com `express-handlebars` e layout principal ([`src/views/layouts/main.hbs`](src/views/layouts/main.hbs)), exibindo sempre Nomes e IDs (`_id`) dos registros para facilitar testes e navegação.
- **Banco de Dados e Utilitários ([`src/config/database.js`](src/config/database.js) e [`src/utils/`](src/utils/))**:
  - Conexão nativa via `mongodb`, wrapper `executarNoBanco()`, classes de erro customizadas (`errors.js`), conversores/validadores (`validacao.js`) e gravador de logs (`logger.js`).

---

## ⚡ Funcionalidades Implementadas

1. **Autenticação, Sessões e Conta de Usuário**:
   - Cadastro com senha criptografada (`scrypt` + `salt` aleatório);
   - Login com criação de sessão via `express-session`;
   - Proteção automática das rotas de conta, álbuns e fotos;
   - Consulta e atualização parcial do perfil;
   - Exclusão de conta com limpeza em cascata e destruição da sessão;
   - Logout com encerramento da sessão.
2. **Gerenciamento de Álbuns**:
   - Criação de álbuns com nome único por usuário;
   - Listagem com filtro via query string `GET /albuns?nome=...`;
   - Visualização de detalhes do álbum e listagem das fotos vinculadas;
   - Adição e remoção de fotos no álbum;
   - Atualização de nome/descrição e exclusão de álbuns.
3. **Gerenciamento de Fotos**:
   - Cadastro completo com descrição, data, tags, tamanho (KB), formato e local;
   - Busca avançada via `GET /fotos` combinando `nome`, `tag`, `formato`, `dataInicial`, `dataFinal` e `albumId`;
   - Visualização de detalhes completos, edição e exclusão com desvinculação automática dos álbuns.
4. **Tratamento de Exceções e Logs**:
   - Erros de validação, conflito, autenticação, registro não encontrado, banco de dados e erros inesperados tratados sem derrubar o servidor e registrados em `logs/erros.log`.

---

## 📁 Organização dos Arquivos

```text
Trabalho-1/
├── app.js                            # Configuração do Express, express-session, Handlebars e rotas
├── src/
│   ├── index.js                      # Entrypoint: conecta ao MongoDB e inicia o servidor HTTP
│   ├── config/
│   │   └── database.js               # Conexão com MongoDB Driver, índices únicos e executarNoBanco()
│   ├── models/
│   │   ├── Usuario.js                # Entidade Usuário e CRUD no MongoDB
│   │   ├── Album.js                  # Entidade Álbum e CRUD no MongoDB
│   │   └── Foto.js                   # Entidade Foto, busca com filtros e CRUD no MongoDB
│   ├── controllers/
│   │   ├── executar.js               # Tratamento centralizado de erros e logging
│   │   ├── UserController.js         # Controller de usuário e autenticação HTTP
│   │   ├── UsuarioController.js      # Re-exportação de compatibilidade
│   │   ├── AlbumController.js        # Controller de álbuns HTTP
│   │   └── FotoController.js         # Controller de fotos HTTP
│   ├── middlewares/
│   │   └── autenticacao.js           # Middleware exigirAutenticacao (proteção por sessão)
│   ├── routes/
│   │   ├── indexRoutes.js            # Rotas iniciais, login, cadastro e logout
│   │   ├── usuarioRoutes.js          # Rotas protegidas da conta (/conta)
│   │   ├── albumRoutes.js            # Rotas protegidas de álbuns (/albuns)
│   │   └── fotoRoutes.js             # Rotas protegidas de fotos (/fotos)
│   ├── views/                        # Templates Handlebars (.hbs)
│   │   ├── layouts/main.hbs
│   │   ├── auth/
│   │   ├── usuario/
│   │   ├── albuns/
│   │   ├── fotos/
│   │   └── erro.hbs
│   └── utils/
│       ├── errors.js                 # Classes de erro customizadas
│       ├── erros.js                  # Re-exportação de compatibilidade
│       ├── validacao.js              # Validação/conversão de ObjectId, datas e regex
│       └── logger.js                 # Gravação de logs em logs/erros.log
├── public/
│   └── css/
│       └── estilo.css                # Folha de estilos da aplicação Web
├── logs/
│   └── erros.log                     # Arquivo de registro de erros (gerado em runtime)
├── package.json
└── README.md
```

---

## 🌐 Mapa de Rotas (`GET` e `POST`)

### Rotas Públicas e Sessão
| Método | Rota | Parâmetros | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | — | Redireciona para `/albuns` (autenticado) ou `/login` (deslogado) |
| `GET` | `/login` | — | Formulário de login |
| `POST` | `/login` | `req.body`: `email`, `senha` | Autentica usuário e cria sessão |
| `GET` | `/cadastro` | — | Formulário de cadastro |
| `POST` | `/cadastro` | `req.body`: `nome`, `email`, `senha` | Cadastra novo usuário no MongoDB |
| `POST` / `GET` | `/logout` | — | Encerra a sessão ativa |

### Rotas de Conta (Protegidas)
| Método | Rota | Parâmetros | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/conta` | — | Exibe perfil e formulários de atualização/exclusão |
| `POST` | `/conta/atualizar` | `req.body`: `nome`, `email`, `senha` | Atualiza campos informados do usuário logado |
| `POST` | `/conta/excluir` | — | Exclui conta, álbuns e fotos em cascata e encerra a sessão |

### Rotas de Álbuns (Protegidas)
| Método | Rota | Parâmetros | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/albuns` | `req.query`: `nome` | Lista álbuns com filtro opcional por nome |
| `POST` | `/albuns` | `req.body`: `nome`, `descricao` | Cria um novo álbum |
| `GET` | `/albuns/:id` | `req.params`: `id` | Exibe detalhes, fotos vinculadas e formulário de vínculo |
| `GET` | `/albuns/:id/editar` | `req.params`: `id` | Formulário de edição do álbum |
| `POST` | `/albuns/:id/atualizar` *(e `/albuns/atualizar`)* | `req.params.id` / `req.body.id`, `nome`, `descricao` | Atualiza álbum |
| `POST` | `/albuns/:id/excluir` *(e `/albuns/excluir`)* | `req.params.id` / `req.body.id` | Exclui álbum |
| `POST` | `/albuns/:id/adicionar-foto` | `req.params.id`, `req.body.fotoId` | Adiciona foto ao álbum |
| `POST` | `/albuns/:id/remover-foto` | `req.params.id`, `req.body.fotoId` | Remove foto do álbum |

### Rotas de Fotos (Protegidas)
| Método | Rota | Parâmetros | Descrição |
| :--- | :--- | :--- | :--- |
| `GET` | `/fotos` | `req.query`: `nome`, `tag`, `formato`, `dataInicial`, `dataFinal`, `albumId` | Lista e filtra fotos do usuário |
| `GET` | `/fotos/nova` | — | Formulário de cadastro de foto |
| `POST` | `/fotos` | `req.body`: `nome`, `descricao`, `data`, `tags`, `tamanhoKB`, `formato`, `local` | Cadastra nova foto |
| `GET` | `/fotos/:id` | `req.params`: `id` | Exibe detalhes completos da foto |
| `GET` | `/fotos/:id/editar` | `req.params`: `id` | Formulário de edição da foto |
| `POST` | `/fotos/:id/atualizar` *(e `/fotos/atualizar`)* | `req.params.id` / `req.body.id` + campos da foto | Atualiza dados da foto |
| `POST` | `/fotos/:id/excluir` *(e `/fotos/excluir`)* | `req.params.id` / `req.body.id` | Exclui foto e remove referência dos álbuns |

---

## 💻 Dependências Necessárias

- **Node.js** (versão 20.x ou superior, com suporte a ES Modules)
- **npm**
- **MongoDB** (em execução local na porta `27017`)
- Pacotes declarados em [`package.json`](package.json):
  - `express`
  - `express-session`
  - `express-handlebars`
  - `mongodb`

---

## 📦 Instalação e Configuração do MongoDB

1. No diretório raiz do projeto, instale as dependências:
   ```bash
   npm install
   ```

2. Certifique-se de que o serviço do MongoDB está rodando em `mongodb://127.0.0.1:27017` (banco `web2_db`, configurado em [`src/config/database.js`](src/config/database.js)):
   ```bash
   # Linux com systemd:
   sudo systemctl start mongod

   # Ou via Docker:
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```
   > Os índices únicos (`usuarios.email` e `albuns.usuarioId + nome`) são criados automaticamente na inicialização da aplicação.

---

## 🚀 Execução do Projeto

Inicie o servidor Web:
```bash
npm start
```
*(ou `node src/index.js`)*

Acesse no navegador: **`http://localhost:3000`**

---

## 🧪 Roteiro para Testar Login, Sessões, Rotas e Logs

### 1. Testando Proteção de Rotas (Sem Sessão)
1. Com o navegador em aba anônima (sem login), acesse diretamente `http://localhost:3000/albuns`, `http://localhost:3000/fotos` ou `http://localhost:3000/conta`.
2. **Resultado esperado:** A aplicação bloqueia o acesso, redireciona para `http://localhost:3000/login` com a mensagem `"Faça login para realizar esta operação."` e registra o `ErroAutenticacao` no arquivo `logs/erros.log`.

### 2. Testando Cadastro, Login e Sessão
- **Criar uma conta nova:** Acesse `http://localhost:3000/cadastro` e preencha nome, e-mail e senha (mínimo 6 caracteres).
- **Ou usar usuário de teste (caso já possua dados do Projeto 1 no mesmo banco):**
  - **E-mail:** `a@a.c`
  - **Senha:** `123456`
- Após o login em `/login`, o cabeçalho exibirá `Olá, <Nome>`, os links internos (`Álbuns`, `Fotos`, `Minha Conta`, `Logout`) e o cookie de sessão manterá o acesso autenticado entre requisições.
- Teste o encerramento clicando em **Logout** (`POST /logout`) e tente acessar `/fotos` novamente para confirmar que a sessão foi destruída.

### 3. Testando Parâmetros `GET`, `POST` e CRUD
1. **Álbuns (`POST` e `GET`)**:
   - Em `/albuns`, crie dois álbuns via formulário (`POST /albuns`).
   - Utilize o campo de busca por nome (`GET /albuns?nome=...`) para validar o recebimento de parâmetros via `req.query`.
   - Clique em **Ver Detalhes** (`/albuns/:id`) para inspecionar o parâmetro de rota `req.params.id`.
2. **Fotos (`POST` e `GET`)**:
   - Em `/fotos/nova`, cadastre fotos com data (`dd/mm/aaaa`), tags separadas por vírgula, formato (`jpg`, `png`, `webp`) e local (`POST /fotos`).
   - Em `/fotos`, combine múltiplos filtros (`nome`, `tag`, `formato`, `dataInicial`, `dataFinal`, `albumId`) e observe a query string na URL (`GET /fotos?...`).
3. **Relacionamento Álbum ↔ Foto**:
   - Abra um álbum em `/albuns/:id`, selecione uma foto disponível na lista (com Nome e ID visíveis) e clique em **Adicionar Foto** (`POST /albuns/:id/adicionar-foto`).
   - Remova a foto do álbum com **Remover do Álbum** (`POST /albuns/:id/remover-foto`).
4. **Atualização e Exclusão**:
   - Edite os dados de uma foto (`/fotos/:id/editar` -> `POST /fotos/:id/atualizar`) e de um álbum (`/albuns/:id/editar` -> `POST /albuns/:id/atualizar`).
   - Exclua uma foto (`POST /fotos/:id/excluir`) e verifique que ela também é desvinculada dos álbuns.

### 4. Testando Validações e Logs (`logs/erros.log`)
- Tente cadastrar um usuário com senha menor que 6 caracteres, uma foto com data futura ou formato inválido (ex.: `.exe`), criar dois álbuns com o mesmo nome, ou acessar `/fotos/id-invalido`.
- **Resultado esperado:** O servidor permanece rodando normalmente, exibe a mensagem compreensível na interface Web e registra data, horário, operação, tipo do erro e mensagem em [`logs/erros.log`](logs/erros.log).
