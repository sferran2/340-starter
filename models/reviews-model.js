const pool = require("../database/")

/* ***************************
 *  Add a Review
 * ************************** */
async function addReview(inv_id, account_id, rating, review_text) {
  try {
    const sql = `
      INSERT INTO public.reviews
      (inv_id, account_id, rating, review_text)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `
    const data = await pool.query(sql, [
      inv_id,
      account_id,
      rating,
      review_text,
    ])
    return data.rows[0]
  } catch (error) {
    console.error("addReview error: " + error)
    throw error
  }
}

/* ***************************
 *  Get Reviews by Vehicle
 * ************************** */
async function getReviewsByInvId(inv_id) {
  try {
    const sql = `
      SELECT 
        r.*,
        a.account_firstname,
        a.account_lastname,
        responder.account_firstname AS responder_firstname,
        responder.account_lastname AS responder_lastname
      FROM public.reviews r
      JOIN public.account a
        ON r.account_id = a.account_id
      LEFT JOIN public.account responder
        ON r.response_account_id = responder.account_id
      WHERE r.inv_id = $1
      ORDER BY r.created_at DESC;
    `
    const data = await pool.query(sql, [inv_id])
    return data.rows
  } catch (error) {
    console.error("getReviewsByInvId error: " + error)
    throw error
  }
}

async function addResponse(review_id, response_text, response_account_id) {
  try {
    const sql = `
      UPDATE public.reviews
      SET response_text = $1,
          response_account_id = $2,
          responded_at = CURRENT_TIMESTAMP
      WHERE review_id = $3
      RETURNING *;
    `
    const data = await pool.query(sql, [
      response_text,
      response_account_id,
      review_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("addResponse error: " + error)
    throw error
  }
}

async function getLatestReviews(limit = 5) {
  try {
    const sql = `
      SELECT
        r.review_id,
        r.inv_id,
        r.rating,
        r.review_text,
        r.created_at,
        i.inv_make,
        i.inv_model
      FROM public.reviews r
      JOIN public.inventory i ON r.inv_id = i.inv_id
      ORDER BY r.created_at DESC
      LIMIT $1;
    `
    const data = await pool.query(sql, [limit])
    return data.rows
  } catch (error) {
    console.error("getLatestReviews error: " + error)
    throw error
  }
}




module.exports = {
  addReview,
  getReviewsByInvId,
  addResponse,
  getLatestReviews,
}
