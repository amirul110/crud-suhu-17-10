import { db } from "../core/config/knex.js";

/**
 * Get all master mesin
 **/
export const getAllMasterMesin = async () => db("master_mesin").select("*");

/**
 * Get mesin by ID (FIXED: Search by 'id', not 'kode_mesin')
 **/
export const getMasterMesinById = async (id) => // Parameter diubah menjadi 'id'
  db("master_mesin").where({ id }).first(); // Klausa where diubah menjadi 'id'

/**
 * Create new mesin
 **/
export const addMasterMesin = async ({
  kode_mesin,
  nama_mesin,
  suhu_maksimal,
}) => {
  const [id] = await db("master_mesin").insert({
    kode_mesin,
    nama_mesin,
    suhu_maksimal,
  });
  return db("master_mesin").where({ id }).first();
};

/**
 * Update existing mesin
 **/
export const editMasterMesin = async ({
  id,
  kode_mesin,
  nama_mesin,
  suhu_maksimal,
}) => {
  await db("master_mesin")
    .where({ id })
    .update({ kode_mesin, nama_mesin, suhu_maksimal });
  return db("master_mesin").where({ id }).first();
};

/**
 * Delete existing mesin (FIXED: Logic corrected)
 **/
/**
 * Delete existing mesin
 **/
export const removeMasterMesin = async (id) => {
  // Cek dulu apakah data exists
  const existingMesin = await db("master_mesin").where({ id }).first();
  
  if (!existingMesin) {
    throw new Error("Mesin tidak ditemukan");
  }

  // Hapus data
  await db("master_mesin").where({ id }).delete();
  
  return existingMesin; // Return data yang dihapus
};