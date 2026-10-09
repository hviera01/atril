const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');
const { LIBROS, normalizar } = require('./libros');
const { interpretarReferencia } = require('./referencias');

const MAX_RESULTADOS = 80;

class Datos {
  constructor(archivo, archivoBiblia) {
    fs.mkdirSync(path.dirname(archivo), { recursive: true });
    this.db = new DatabaseSync(archivo);
    this.db.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA foreign_keys = ON;');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS versiculos (
        libro INTEGER NOT NULL,
        capitulo INTEGER NOT NULL,
        versiculo INTEGER NOT NULL,
        texto TEXT NOT NULL,
        norm TEXT NOT NULL,
        PRIMARY KEY (libro, capitulo, versiculo)
      ) WITHOUT ROWID;
      CREATE TABLE IF NOT EXISTS canciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        autor TEXT NOT NULL DEFAULT '',
        letra TEXT NOT NULL DEFAULT '',
        norm TEXT NOT NULL DEFAULT '',
        usos INTEGER NOT NULL DEFAULT 0,
        actualizado INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS servicios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        creado INTEGER NOT NULL,
        actualizado INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS elementos (
        servicio_id INTEGER NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
        pos INTEGER NOT NULL,
        datos TEXT NOT NULL,
        PRIMARY KEY (servicio_id, pos)
      ) WITHOUT ROWID;
      CREATE TABLE IF NOT EXISTS ajustes (
        clave TEXT PRIMARY KEY,
        valor TEXT NOT NULL
      );
    `);
    this.sembrarBiblia(archivoBiblia);
  }

  sembrarBiblia(archivoBiblia) {
    const { n } = this.db.prepare('SELECT COUNT(*) AS n FROM versiculos').get();
    if (n >= 31000) return;
    const libros = JSON.parse(fs.readFileSync(archivoBiblia, 'utf8'));
    this.db.exec('BEGIN');
    try {
      this.db.exec('DELETE FROM versiculos');
      const ins = this.db.prepare('INSERT INTO versiculos (libro, capitulo, versiculo, texto, norm) VALUES (?, ?, ?, ?, ?)');
      libros.forEach((caps, li) => caps.forEach((vers, ci) => vers.forEach((texto, vi) => {
        ins.run(li + 1, ci + 1, vi + 1, texto, normalizar(texto).replace(/[^a-z0-9ñ ]+/g, ' '));
      })));
      this.db.exec('COMMIT');
    } catch (e) {
      this.db.exec('ROLLBACK');
      throw e;
    }
  }

  capitulo(libro, capitulo) {
    return this.db.prepare('SELECT versiculo AS v, texto AS t FROM versiculos WHERE libro = ? AND capitulo = ? ORDER BY versiculo').all(libro, capitulo);
  }

  buscarPalabras(consulta, limite = MAX_RESULTADOS) {
    const palabras = normalizar(consulta).replace(/[^a-z0-9ñ ]+/g, ' ').split(/\s+/).filter((p) => p.length >= 2);
    if (!palabras.length) return [];
    const cond = palabras.map(() => 'norm LIKE ?').join(' AND ');
    const params = palabras.map((p) => `%${p}%`);
    return this.db.prepare(`SELECT libro, capitulo, versiculo, texto FROM versiculos WHERE ${cond} ORDER BY libro, capitulo, versiculo LIMIT ?`).all(...params, limite);
  }

  buscar(consulta) {
    const q = String(consulta || '').trim();
    const salida = { referencia: null, versiculos: [], palabras: [], canciones: [], libros: [] };
    if (!q) return salida;
    const ref = interpretarReferencia(q);
    if (ref) {
      salida.libros = ref.libros;
      if (ref.libros.length === 1 && ref.capitulo) {
        const libro = ref.libros[0];
        const maxCap = LIBROS[libro - 1].capitulos;
        if (ref.capitulo >= 1 && ref.capitulo <= maxCap) {
          salida.referencia = { libro, capitulo: ref.capitulo, desde: ref.desde, hasta: ref.hasta };
          salida.versiculos = this.capitulo(libro, ref.capitulo);
        }
      }
    }
    if (!salida.referencia && !(ref && ref.capitulo)) salida.palabras = this.buscarPalabras(q);
    salida.canciones = this.listarCanciones(q).slice(0, 12);
    return salida;
  }

  listarCanciones(consulta = '') {
    const palabras = normalizar(consulta).replace(/[^a-z0-9ñ ]+/g, ' ').split(/\s+/).filter(Boolean);
    if (!palabras.length) {
      return this.db.prepare('SELECT id, titulo, autor, usos, actualizado FROM canciones ORDER BY titulo COLLATE NOCASE').all();
    }
    const cond = palabras.map(() => 'norm LIKE ?').join(' AND ');
    return this.db.prepare(`SELECT id, titulo, autor, usos, actualizado FROM canciones WHERE ${cond} ORDER BY usos DESC, titulo COLLATE NOCASE`).all(...palabras.map((p) => `%${p}%`));
  }

  obtenerCancion(id) {
    return this.db.prepare('SELECT id, titulo, autor, letra, usos FROM canciones WHERE id = ?').get(id) || null;
  }

  guardarCancion({ id, titulo, autor = '', letra = '' }) {
    const ahora = Date.now();
    const norm = normalizar(`${titulo} ${autor} ${letra}`).replace(/[^a-z0-9ñ ]+/g, ' ');
    if (id) {
      this.db.prepare('UPDATE canciones SET titulo = ?, autor = ?, letra = ?, norm = ?, actualizado = ? WHERE id = ?').run(titulo, autor, letra, norm, ahora, id);
      return id;
    }
    const r = this.db.prepare('INSERT INTO canciones (titulo, autor, letra, norm, actualizado) VALUES (?, ?, ?, ?, ?)').run(titulo, autor, letra, norm, ahora);
    return Number(r.lastInsertRowid);
  }

  borrarCancion(id) {
    this.db.prepare('DELETE FROM canciones WHERE id = ?').run(id);
  }

  sumarUsoCancion(id) {
    this.db.prepare('UPDATE canciones SET usos = usos + 1 WHERE id = ?').run(id);
  }

  listarServicios() {
    return this.db.prepare('SELECT id, nombre, creado, actualizado FROM servicios ORDER BY actualizado DESC').all();
  }

  crearServicio(nombre) {
    const ahora = Date.now();
    const r = this.db.prepare('INSERT INTO servicios (nombre, creado, actualizado) VALUES (?, ?, ?)').run(nombre, ahora, ahora);
    return Number(r.lastInsertRowid);
  }

  renombrarServicio(id, nombre) {
    this.db.prepare('UPDATE servicios SET nombre = ?, actualizado = ? WHERE id = ?').run(nombre, Date.now(), id);
  }

  borrarServicio(id) {
    this.db.prepare('DELETE FROM servicios WHERE id = ?').run(id);
  }

  duplicarServicio(id, nombre) {
    const nuevo = this.crearServicio(nombre);
    this.guardarElementos(nuevo, this.elementos(id));
    return nuevo;
  }

  elementos(servicioId) {
    return this.db.prepare('SELECT datos FROM elementos WHERE servicio_id = ? ORDER BY pos').all(servicioId).map((f) => JSON.parse(f.datos));
  }

  guardarElementos(servicioId, elementos) {
    this.db.exec('BEGIN');
    try {
      this.db.prepare('DELETE FROM elementos WHERE servicio_id = ?').run(servicioId);
      const ins = this.db.prepare('INSERT INTO elementos (servicio_id, pos, datos) VALUES (?, ?, ?)');
      elementos.forEach((e, i) => ins.run(servicioId, i, JSON.stringify(e)));
      this.db.prepare('UPDATE servicios SET actualizado = ? WHERE id = ?').run(Date.now(), servicioId);
      this.db.exec('COMMIT');
    } catch (e) {
      this.db.exec('ROLLBACK');
      throw e;
    }
  }

  ajuste(clave, porDefecto = null) {
    const f = this.db.prepare('SELECT valor FROM ajustes WHERE clave = ?').get(clave);
    if (!f) return porDefecto;
    try { return JSON.parse(f.valor); } catch { return porDefecto; }
  }

  guardarAjuste(clave, valor) {
    this.db.prepare('INSERT INTO ajustes (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor').run(clave, JSON.stringify(valor));
  }

  exportar() {
    return {
      formato: 'atril-respaldo',
      version: 1,
      fecha: new Date().toISOString(),
      canciones: this.db.prepare('SELECT titulo, autor, letra FROM canciones ORDER BY titulo').all(),
      servicios: this.listarServicios().map((s) => ({ nombre: s.nombre, elementos: this.elementos(s.id) })),
      ajustes: this.db.prepare('SELECT clave, valor FROM ajustes').all().filter((a) => ['temas', 'temaActivo'].includes(a.clave)),
    };
  }

  importar(respaldo) {
    if (!respaldo || respaldo.formato !== 'atril-respaldo') throw new Error('El archivo no es un respaldo de Atril');
    const existentes = new Set(this.db.prepare('SELECT titulo FROM canciones').all().map((c) => normalizar(c.titulo)));
    let canciones = 0;
    for (const c of respaldo.canciones || []) {
      if (existentes.has(normalizar(c.titulo))) continue;
      this.guardarCancion(c);
      canciones++;
    }
    let servicios = 0;
    for (const s of respaldo.servicios || []) {
      const id = this.crearServicio(s.nombre);
      this.guardarElementos(id, s.elementos || []);
      servicios++;
    }
    return { canciones, servicios };
  }

  cerrar() {
    try { this.db.close(); } catch {}
  }
}

module.exports = { Datos };
