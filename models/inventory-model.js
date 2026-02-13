const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get inventory item by inv_id
 * ************************** */
async function getInventoryById(inv_id) {
  try {
    const sql = "SELECT * FROM public.inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("getInventoryById error " + error)
    throw error
  }
}

/* ******************************************
 *  Add a new classification to the database
 * ****************************************** */

async function addClassification(classification_name) {
  try {
    const sql = `
      INSERT INTO public.classification (classification_name)
      VALUES ($1)
      RETURNING *;
    `
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

/* ******************************************
 *  Add a new inventory item to the database
 * ****************************************** */

async function addInventoryItem(
  classification_id,
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color
) {
  try {
    const sql = `
      INSERT INTO public.inventory
      (classification_id, inv_make, inv_model, inv_year, inv_description,
       inv_image, inv_thumbnail, inv_price, inv_miles, inv_color)
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `
    return await pool.query(sql, [
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    ])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_status,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql = `
      UPDATE public.inventory
      SET inv_status = $1,
          inv_make = $2,
          inv_model = $3,
          inv_description = $4,
          inv_image = $5,
          inv_thumbnail = $6,
          inv_price = $7,
          inv_year = $8,
          inv_miles = $9,
          inv_color = $10,
          classification_id = $11
      WHERE inv_id = $12
      RETURNING *;
    `

    const data = await pool.query(sql, [
      inv_status,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id,
    ])

    return data.rows[0]
  } catch (error) {
    console.error("updateInventory model error: " + error)
    throw error
  }
}


/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data.rowCount // 1 = deleted, 0 = not deleted
  } catch (error) {
    console.error("deleteInventoryItem model error: " + error)
  }
}

/* ***************************
 *  Update Vehicle Status
 * ************************** */

async function updateVehicleStatus(inv_id, inv_status) {
  try {
    const sql = `
      UPDATE public.inventory
      SET inv_status = $1
      WHERE inv_id = $2
      RETURNING *;
    `
    const data = await pool.query(sql, [inv_status, inv_id])
    return data.rows[0]
  } catch (error) {
    throw error
  }
}

/* ***************************
 * Get featured vehicle (Delorean) dynamically
 * ************************** */
async function getFeaturedVehicle() {
  try {
    const sql = `
      SELECT i.inv_id, i.inv_make, i.inv_model
      FROM public.inventory i
      JOIN public.reviews r ON r.inv_id = i.inv_id
      ORDER BY r.created_at DESC
      LIMIT 1;
    `
    const data = await pool.query(sql)
    return data.rows[0]
  } catch (error) {
    console.error("getFeaturedVehicle error: " + error)
    throw error
  }
}



module.exports = {
  getClassifications, getInventoryByClassificationId, getInventoryById, addClassification,
  addInventoryItem, updateInventory, deleteInventoryItem, updateVehicleStatus, getFeaturedVehicle
};