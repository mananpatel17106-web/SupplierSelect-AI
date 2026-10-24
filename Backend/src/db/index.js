import Database from "better-sqlite3";

const db = new Database(
  "src/db/database.sqlite"
);


db.pragma(
  "foreign_keys = ON"
);


db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );


  CREATE TABLE IF NOT EXISTS purchase_requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,

    title TEXT NOT NULL,
    description TEXT,

    quantity REAL,
    max_price REAL,
    max_delivery_days INTEGER,
    min_warranty_years REAL,
    payment_terms TEXT,

    price_weight REAL DEFAULT 0,
    delivery_weight REAL DEFAULT 0,
    warranty_weight REAL DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
  );


  CREATE TABLE IF NOT EXISTS quotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requirement_id INTEGER NOT NULL,

    supplier_name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,

    status TEXT DEFAULT 'pending',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (requirement_id)
      REFERENCES purchase_requirements(id)
      ON DELETE CASCADE
  );


  CREATE TABLE IF NOT EXISTS quotation_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quotation_id INTEGER NOT NULL,

    product_name TEXT,
    quantity REAL,
    unit_price REAL,
    total_price REAL,
    delivery_days INTEGER,
    warranty_years REAL,
    payment_terms TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (quotation_id)
      REFERENCES quotations(id)
      ON DELETE CASCADE
  );


  CREATE TABLE IF NOT EXISTS quotation_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    quotation_id INTEGER NOT NULL UNIQUE,

    mandatory_status TEXT DEFAULT 'pending',
    eligibility_status TEXT DEFAULT 'pending',

    price_score REAL DEFAULT 0,
    delivery_score REAL DEFAULT 0,
    warranty_score REAL DEFAULT 0,
    total_score REAL DEFAULT 0,

    rank INTEGER,

    warnings TEXT,
    explanation TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (quotation_id)
      REFERENCES quotations(id)
      ON DELETE CASCADE
  );
`);


console.log(
  "SQLite database initialized successfully"
);


export default db;