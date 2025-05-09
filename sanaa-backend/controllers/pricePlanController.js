// sanaa-backend/controllers/pricePlanController.js
const pool = require('../config/db');

exports.getAllPricePlans = async (req, res) => {
    console.log("Request received to get all active price plans");
    try {
        const result = await pool.query(
            `SELECT plan_id, name_key, description_key, price, currency, billing_period, course_id, features_keys, is_featured, display_order
             FROM price_plans
             WHERE is_active = TRUE
             ORDER BY display_order ASC, plan_id ASC`
        );
        console.log('Fetched active price plans from DB:', result.rows); // <-- Log added
        res.status(200).json({
            message: "Active price plans fetched successfully.",
            count: result.rows.length,
            plans: result.rows
        });
    } catch (err) {
        console.error("Error fetching active price plans:", err);
        res.status(500).json({ message: "Server error fetching price plans." });
    }
};

exports.getAllPricePlansAdmin = async (req, res) => {
    console.log("Admin request received to get all price plans");
    try {
        const result = await pool.query(
            `SELECT plan_id, name_key, description_key, price, currency, billing_period, course_id, features_keys, is_active, is_featured, display_order, created_at, updated_at
             FROM price_plans
             ORDER BY display_order ASC, plan_id ASC`
        );
        console.log('Fetched all price plans (admin) from DB:', result.rows); // <-- Log added
        res.status(200).json({
            message: "All price plans fetched successfully for admin.",
            count: result.rows.length,
            plans: result.rows
        });
    } catch (err) {
        console.error("Error fetching all price plans for admin:", err);
        res.status(500).json({ message: "Server error fetching price plans." });
    }
};

exports.addPricePlan = async (req, res) => {
    const {
        name_key, description_key, price, currency = 'USD', billing_period,
        course_id, features_keys, is_active = true, is_featured = false, display_order = 0
    } = req.body;
    console.log("Admin request to add new price plan:", req.body);

    if (!name_key || price === undefined || !billing_period) {
        return res.status(400).json({ message: "Name key, price, and billing period are required." });
    }
    if (price < 0) {
        return res.status(400).json({ message: "Price cannot be negative." });
    }
    const validBillingPeriods = ['monthly', 'yearly', 'one_time'];
    if (!validBillingPeriods.includes(billing_period)) {
        return res.status(400).json({ message: "Invalid billing period." });
    }
    const featuresArray = Array.isArray(features_keys) ? features_keys : (features_keys ? String(features_keys).split(',').map(s => s.trim()).filter(s => s) : []);

    try {
        if (course_id) {
            const courseCheck = await pool.query('SELECT course_id FROM courses WHERE course_id = $1', [course_id]);
            if (courseCheck.rows.length === 0) {
                return res.status(400).json({ message: `Course with ID ${course_id} not found.` });
            }
        }

        const insertQuery = `
            INSERT INTO price_plans (
                name_key, description_key, price, currency, billing_period,
                course_id, features_keys, is_active, is_featured, display_order,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
            RETURNING *;
        `;
        const values = [
            name_key, description_key || null, parseFloat(price), currency.toUpperCase(), billing_period,
            course_id || null, featuresArray, Boolean(is_active), Boolean(is_featured), parseInt(display_order, 10)
        ];
        const newPricePlanResult = await pool.query(insertQuery, values);
        console.log('Price plan added successfully:', newPricePlanResult.rows[0]); // <-- Log added
        res.status(201).json({
            message: "Price plan added successfully.",
            plan: newPricePlanResult.rows[0]
        });
    } catch (err) {
        console.error("Error adding price plan:", err);
        if (err.code === '23505') {
            return res.status(409).json({ message: `Price plan creation failed. The name key '${name_key}' might already exist.` });
        }
        res.status(500).json({ message: "Server error adding price plan." });
    }
};

exports.updatePricePlan = async (req, res) => {
    const { planId } = req.params;
    const {
        name_key, description_key, price, currency, billing_period,
        course_id, features_keys, is_active, is_featured, display_order
    } = req.body;
    console.log(`Admin request to update price plan ID: ${planId} with data:`, req.body);

    const fieldsToUpdate = [];
    const values = [];
    let queryIndex = 1;

    if (name_key !== undefined) { fieldsToUpdate.push(`name_key = $${queryIndex++}`); values.push(name_key); }
    if (description_key !== undefined) { fieldsToUpdate.push(`description_key = $${queryIndex++}`); values.push(description_key || null); }
    if (price !== undefined) { fieldsToUpdate.push(`price = $${queryIndex++}`); values.push(parseFloat(price)); }
    if (currency !== undefined) { fieldsToUpdate.push(`currency = $${queryIndex++}`); values.push(currency.toUpperCase()); }
    if (billing_period !== undefined) { fieldsToUpdate.push(`billing_period = $${queryIndex++}`); values.push(billing_period); }
    if (course_id !== undefined) {
        if (course_id && course_id !== '') {
            const courseCheck = await pool.query('SELECT course_id FROM courses WHERE course_id = $1', [course_id]);
            if (courseCheck.rows.length === 0) {
                return res.status(400).json({ message: `Course with ID ${course_id} not found for update.` });
            }
        }
        fieldsToUpdate.push(`course_id = $${queryIndex++}`); values.push(course_id || null);
    }
    if (features_keys !== undefined) {
        const featuresArray = Array.isArray(features_keys) ? features_keys : (features_keys ? String(features_keys).split(',').map(s => s.trim()).filter(s => s) : []);
        fieldsToUpdate.push(`features_keys = $${queryIndex++}`); values.push(featuresArray);
    }
    if (is_active !== undefined) { fieldsToUpdate.push(`is_active = $${queryIndex++}`); values.push(Boolean(is_active)); }
    if (is_featured !== undefined) { fieldsToUpdate.push(`is_featured = $${queryIndex++}`); values.push(Boolean(is_featured)); }
    if (display_order !== undefined) { fieldsToUpdate.push(`display_order = $${queryIndex++}`); values.push(parseInt(display_order, 10)); }

    if (fieldsToUpdate.length === 0) {
        // Fetch current data to return if no fields were actually changed
        const currentPlanResult = await pool.query('SELECT * FROM price_plans WHERE plan_id = $1', [planId]);
        if (currentPlanResult.rows.length === 0) {
            return res.status(404).json({ message: 'Price plan not found.' });
        }
        return res.status(200).json({ message: 'No changes detected.', plan: currentPlanResult.rows[0] });
    }

    fieldsToUpdate.push(`updated_at = NOW()`);
    values.push(planId);

    const updateQuery = `
        UPDATE price_plans
        SET ${fieldsToUpdate.join(', ')}
        WHERE plan_id = $${queryIndex}
        RETURNING *;
    `;

    try {
        if (name_key) {
            const nameKeyCheck = await pool.query(
                'SELECT plan_id FROM price_plans WHERE name_key = $1 AND plan_id != $2',
                [name_key, planId]
            );
            if (nameKeyCheck.rows.length > 0) {
                return res.status(409).json({ message: `Price plan name key '${name_key}' is already used by another plan.` });
            }
        }

        const updatedPlanResult = await pool.query(updateQuery, values);
        if (updatedPlanResult.rows.length === 0) {
            return res.status(404).json({ message: 'Price plan not found or update failed.' });
        }
        console.log('Price plan updated successfully:', updatedPlanResult.rows[0]); // <-- Log added
        res.status(200).json({
            message: 'Price plan updated successfully.',
            plan: updatedPlanResult.rows[0]
        });
    } catch (err) {
        console.error(`Error updating price plan ${planId}:`, err);
        if (err.code === '23505') {
            return res.status(409).json({ message: 'Update failed due to conflicting data (e.g., name key already exists).' });
        }
        res.status(500).json({ message: 'Server error updating price plan.' });
    }
};

exports.deletePricePlan = async (req, res) => {
    const { planId } = req.params;
    console.log(`Admin request to delete price plan ID: ${planId}`);
    try {
        const deleteResult = await pool.query('DELETE FROM price_plans WHERE plan_id = $1 RETURNING plan_id', [planId]);
        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ message: 'Price plan not found.' });
        }
        console.log(`Price plan ${planId} deleted successfully.`); // <-- Log added
        res.status(200).json({ message: `Price plan ${planId} deleted successfully.` });
    } catch (err) {
        console.error(`Error deleting price plan ${planId}:`, err);
        res.status(500).json({ message: 'Server error deleting price plan.' });
    }
};