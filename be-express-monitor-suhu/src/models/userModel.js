import { db } from "../core/config/knex.js";

/**
 * Get all users
 **/
export const getAllUsers = async () => db("users").select("*");

/**
 * Get user by ID
 **/
export const getUserById = async (id) => db("users").where({ id }).first();

/**
 * Get user by email
 **/
export const getUserByEmail = async (email) =>
  db("users").where({ email }).first();

/**
 * Create new user
 **/
export const addUser = async ({ name, email, password, role = "user" }) => {
  const [id] = await db("users").insert({ name, email, password, role });
  return db("users").where({ id }).first();
};


export const updateUser = async (id, { name, email, role, password = null }) => {
  const updateData = { name, email, role };
  
  // Only update password if provided
  if (password) {
    updateData.password = password;
  }
  
  await db("users").where({ id }).update(updateData);
  return db("users").where({ id }).first();
};


/**
 * Delete user by ID
 **/
export const deleteUser = async (id) => {
  return db("users").where({ id }).del();
};