const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { dbFile } = require('../config');

let dbInstance = null;
let SQL = null;

async function getDb() {
  if (dbInstance) return dbInstance;

  SQL = await initSqlJs({ locateFile: (file) => path.join(__dirname, '..', '..', 'node_modules', 'sql.js', 'dist', file) });

  let rawDb;
  if (fs.existsSync(dbFile)) {
    const buf = fs.readFileSync(dbFile);
    rawDb = new SQL.Database(new Uint8Array(buf));
  } else {
    rawDb = new SQL.Database();
  }

  const persist = () => fs.writeFileSync(dbFile, Buffer.from(rawDb.export()));
  // ensure directory exists before persisting
  const ensurePersist = () => {
    const dir = path.dirname(dbFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dbFile, Buffer.from(rawDb.export()));
  };

  const run = (sql, params = []) => {
    const stmt = rawDb.prepare(sql);
    stmt.bind(params);
    stmt.step();
    stmt.free();
    ensurePersist();
  };

  const get = (sql, params = []) => {
    const stmt = rawDb.prepare(sql);
    stmt.bind(params);
    let res = null;
    if (stmt.step()) res = stmt.getAsObject();
    stmt.free();
    return res;
  };

  const all = (sql, params = []) => {
    const stmt = rawDb.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  };

  dbInstance = { run, get, all, _raw: rawDb };
  return dbInstance;
}

module.exports = { getDb };
