import express from 'express';
import { initDB } from './db.js';

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json());

let db;
initDB().then(database => {
  db = database;
});

// GET todos los items
app.get('/items', async (req, res) => {
  const items = await db.all('SELECT * FROM items');
  res.json(items);
});

// GET un solo item
app.get('/items/:id', async (req, res) => {
  const item = await db.get('SELECT * FROM items WHERE id = ?', req.params.id);
  item ? res.json(item) : res.status(404).json({ error: 'Item not found' });
});

// POST crear un nuevo item
app.post('/items', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const result = await db.run('INSERT INTO items (name, description) VALUES (?, ?)', name, description);
  const newItem = await db.get('SELECT * FROM items WHERE id = ?', result.lastID);
  res.status(201).json(newItem);
});

// PUT actualizar un item
app.put('/items/:id', async (req, res) => {
  const { name, description } = req.body;
  const result = await db.run(
    'UPDATE items SET name = ?, description = ? WHERE id = ?',
    name,
    description,
    req.params.id
  );

  if (result.changes === 0) return res.status(404).json({ error: 'Item not found' });

  const updatedItem = await db.get('SELECT * FROM items WHERE id = ?', req.params.id);
  res.json(updatedItem);
});

// DELETE eliminar un item
app.delete('/items/:id', async (req, res) => {
  const result = await db.run('DELETE FROM items WHERE id = ?', req.params.id);
  result.changes
    ? res.json({ message: 'Item deleted' })
    : res.status(404).json({ error: 'Item not found' });
});

// Iniciar servidor
app.listen(PORT,HOST,() => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});
