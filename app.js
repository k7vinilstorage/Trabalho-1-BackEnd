import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import session from 'express-session';
import { engine } from 'express-handlebars';
import { indexRoutes } from './src/routes/indexRoutes.js';
import { usuarioRoutes } from './src/routes/usuarioRoutes.js';
import { albumRoutes } from './src/routes/albumRoutes.js';
import { fotoRoutes } from './src/routes/fotoRoutes.js';
import { registrarErro } from './src/utils/logger.js';

const pastaRaiz = path.dirname(fileURLToPath(import.meta.url));

function formatarData(data) {
  if (!data) return '';
  if (data instanceof Date) {
    return Number.isNaN(data.getTime()) ? '' : data.toLocaleDateString('pt-BR');
  }
  return String(data);
}

function formatarDataHora(data) {
  if (!data) return '';
  if (data instanceof Date) {
    return Number.isNaN(data.getTime()) ? '' : data.toLocaleString('pt-BR');
  }
  return String(data);
}

function juntarTags(tags) {
  if (Array.isArray(tags)) return tags.join(', ');
  return String(tags ?? '');
}

function igual(a, b) {
  return String(a ?? '') === String(b ?? '');
}

function contar(lista) {
  return Array.isArray(lista) ? lista.length : 0;
}

export const app = express();

app.engine(
  '.hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(pastaRaiz, 'src', 'views', 'layouts'),
    helpers: {
      formatarData,
      formatarDataHora,
      juntarTags,
      igual,
      contar,
    },
  })
);
app.set('view engine', '.hbs');
app.set('views', path.join(pastaRaiz, 'src', 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(pastaRaiz, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'segredo-trabalho2-web-back-fotos',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 2 },
  })
);

app.use((req, res, next) => {
  res.locals.usuarioLogado = req.session?.usuario ?? null;
  res.locals.mensagemSucesso = req.session?.mensagemSucesso ?? null;
  res.locals.mensagemErro = req.session?.mensagemErro ?? null;
  if (req.session) {
    delete req.session.mensagemSucesso;
    delete req.session.mensagemErro;
  }
  next();
});

app.use('/', indexRoutes);
app.use('/conta', usuarioRoutes);
app.use('/albuns', albumRoutes);
app.use('/fotos', fotoRoutes);

app.use((req, res) => {
  return res.status(404).render('erro', {
    titulo: 'Página não encontrada',
    mensagem: 'A página solicitada não foi encontrada.',
  });
});

app.use(async (erro, req, res, _next) => {
  await registrarErro(`Erro HTTP (${req.method} ${req.originalUrl})`, erro);
  return res.status(500).render('erro', {
    titulo: 'Erro interno',
    mensagem: 'Ocorreu um erro inesperado. Consulte o arquivo de log.',
  });
});
