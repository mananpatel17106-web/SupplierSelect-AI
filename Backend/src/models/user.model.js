import db from "../db/index.js";


// ================= CREATE USER =================

const createUser = (
  name,
  email,
  password
) => {

  const statement = db.prepare(`
    INSERT INTO users (
      name,
      email,
      password
    )
    VALUES (?, ?, ?)
  `);


  const result =
    statement.run(
      name,
      email,
      password
    );


  return getUserById(
    Number(result.lastInsertRowid)
  );
};


// ================= GET USER BY EMAIL =================

const getUserByEmail = (
  email
) => {

  return db
    .prepare(`
      SELECT
        id,
        name,
        email,
        role,
        created_at AS createdAt,
        updated_at AS updatedAt

      FROM users

      WHERE email = ?
    `)
    .get(email);
};


// ================= GET USER BY ID =================

const getUserById = (
  id
) => {

  return db
    .prepare(`
      SELECT
        id,
        name,
        email,
        role,
        created_at AS createdAt,
        updated_at AS updatedAt

      FROM users

      WHERE id = ?
    `)
    .get(id);
};


// ================= GET USER WITH PASSWORD =================
//
// Password is intentionally returned only here.
// Normal user queries do not expose password.
//

const getUserWithPasswordById = (
  id
) => {

  return db
    .prepare(`
      SELECT
        id,
        name,
        email,
        password,
        role,
        created_at AS createdAt,
        updated_at AS updatedAt

      FROM users

      WHERE id = ?
    `)
    .get(id);
};


// ================= UPDATE PASSWORD =================

const updatePassword = (
  id,
  password
) => {

  return db
    .prepare(`
      UPDATE users

      SET
        password = ?,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = ?
    `)
    .run(
      password,
      id
    );
};


// ================= EXPORT =================

export {
  createUser,
  getUserByEmail,
  getUserById,
  getUserWithPasswordById,
  updatePassword,
};