import express, { json }  from "express";
import dotenv from "dotenv";

import { queryDB } from './db.js';


const app = express();
dotenv.config();
app.use(json());

const PORT = process.env.PORT;

app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Function to create products table if it doesn't exist
const createProductsTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            stock INTEGER NOT NULL,
            price REAL NOT NULL
        );
    `;

    try {
        await queryDB(createTableQuery);
        console.log('Products table is ready.');
    } catch (err) {
        console.error('Error creating products table:', err);
    }
};

// Call the function to create the table
createProductsTable();

// Get all Products----------------------------------------------------------------
app.get('/api/v1/products', async (req, res) => {
    try {
      const users = await queryDB('SELECT * FROM products');
      res.json(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

// Get a single Product by ID--------------------------------------------------------
app.get('/api/v1/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const user = await queryDB('SELECT * FROM products WHERE id = $1', [id]);
      if (user.length === 0) {
        return res.status(404).json({ error: 'product not found' });
      }
      res.json(user[0]);
    } catch (err) {
      console.error('Error fetching user:', err);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });

// Add or create  a new Product inside the table------------------------------------
app.post('/api/v1/products', async (req, res) => {
    try {
      const { name,description, stock, price } = req.body;
      const result = await queryDB('INSERT INTO products (name, description, stock, price) VALUES ($1, $2, $3, $4) RETURNING *', [name, description, stock, price]);
      res.json(result[0]);
    } catch (err) {
      console.error('Error adding user:', err);
      res.status(500).json({ error: 'Failed to add product' });
    }
  });  
  
  // Update an existing product in the table--------------------------------
  app.put('/api/v1/products/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10); 
        const { name, description, stock, price } = req.body;

        // Update the product in the database
        const result = await queryDB(
            'UPDATE products SET name = $1, description = $2, stock = $3, price = $4 WHERE id = $5 RETURNING *',
            [name, description, stock, price, id]
        );

        // Check if the result is empty, meaning the product was not found
        if (result.length === 0) {
            return res.status(404).json({ error: 'product not found' });
        }

        // Return the updated product
        res.json(result[0]);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete a product from the table------------------------------------------------
app.delete('/api/v1/products/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10); 
        const result = await queryDB('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (result.length === 0) {
            return res.status(404).json({ error: 'product not found' });
        }
        res.json({ message: 'product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

//delete all the contents from the table-------------------------------------
app.delete('/api/v1/products', async (req, res) => {
    try {
        const result = await queryDB('DELETE FROM products');
        res.json({ message: 'products deleted successfully' });
    } catch (err) {
        console.error('Error deleting products:', err);
        res.status(500).json({ error: 'Failed to delete products' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running http://localhost:${PORT}`);
  });
  

  
