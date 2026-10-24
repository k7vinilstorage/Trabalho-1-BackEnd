const { MongoClient } = require('mongodb');

const StringCon = {
  connection: 'mongodb://127.0.0.1:27017',
  dbName: 'web2_db'
};

const client = new MongoClient(StringCon.connection);
let db = null;

async function conectar() {
  await client.connect();
  db = client.db(StringCon.dbName);

  await db.collection('usuarios').createIndex({ email: 1 }, { unique: true });

  console.log('conectado');
  return db;
}

function getDb() {
  if (!db) {
    throw new Error('banco não conectado');
  }
  return db;
}

module.exports = { StringCon, conectar, getDb };
