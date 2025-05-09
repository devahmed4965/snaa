// sanaa-backend/controllers/dictionaryController.js
const pool = require('../config/db');

exports.getAllEntries = async (req, res) => {
    console.log("Request received to get dictionary entries", req.query);
    const { term } = req.query;

    try {
        let query = `
            SELECT entry_id, term, definition, root, example, created_at, updated_at
            FROM dictionary_entries
        `;
        const queryParams = [];

        if (term) {
            query += ' WHERE term ILIKE $1';
            queryParams.push(`%${term}%`); // Search for term containing the string
        }
        query += ' ORDER BY term ASC';

        const result = await pool.query(query, queryParams);
        console.log('Fetched dictionary entries from DB:', result.rows); // <-- Log added

        res.status(200).json({
            message: "Dictionary entries fetched successfully.",
            count: result.rows.length,
            dictionaries: result.rows
        });
    } catch (err) {
        console.error("Error fetching dictionary entries:", err);
        res.status(500).json({ message: "Server error fetching dictionary entries." });
    }
};

exports.getEntryById = async (req, res) => {
    const { id } = req.params;
    console.log(`Request received to get dictionary entry with ID: ${id}`);
    try {
        const result = await pool.query(
            `SELECT entry_id, term, definition, root, example, created_at, updated_at
             FROM dictionary_entries
             WHERE entry_id = $1`,
            [id]
        );
        console.log(`Fetched dictionary entry ${id} from DB:`, result.rows[0]); // <-- Log added

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Dictionary entry not found.' });
        }
        res.status(200).json({
            message: "Dictionary entry fetched successfully.",
            entry: result.rows[0]
        });
    } catch (err) {
        console.error(`Error fetching dictionary entry ${id}:`, err);
        res.status(500).json({ message: "Server error fetching dictionary entry details." });
    }
};

exports.addEntry = async (req, res) => {
    const { term, definition, root, example } = req.body;
    console.log("Admin request to add new dictionary entry:", { term });

    if (!term || !definition) {
        return res.status(400).json({ message: "Term and definition are required." });
    }

    try {
        const termCheck = await pool.query('SELECT entry_id FROM dictionary_entries WHERE term = $1', [term]);
        if (termCheck.rows.length > 0) {
            return res.status(409).json({ message: `The term '${term}' already exists in the dictionary.` });
        }

        const insertQuery = `
            INSERT INTO dictionary_entries (term, definition, root, example, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *;
        `;
        const values = [term, definition, root || null, example || null];
        const newEntryResult = await pool.query(insertQuery, values);
        console.log('Dictionary entry added successfully:', newEntryResult.rows[0]); // <-- Log added
        res.status(201).json({
            message: "Dictionary entry added successfully.",
            entry: newEntryResult.rows[0]
        });
    } catch (err) {
        console.error("Error adding dictionary entry:", err);
        if (err.code === '23505') {
             return res.status(409).json({ message: 'Dictionary entry creation failed. The term might already exist.' });
        }
        res.status(500).json({ message: "Server error adding dictionary entry." });
    }
};

exports.updateEntry = async (req, res) => {
    const { id } = req.params;
    const { term, definition, root, example } = req.body;
    console.log(`Admin request to update dictionary entry ID: ${id} with data:`, { term });

    const fieldsToUpdate = [];
    const values = [];
    let queryIndex = 1;

    if (term !== undefined) { fieldsToUpdate.push(`term = $${queryIndex++}`); values.push(term); }
    if (definition !== undefined) { fieldsToUpdate.push(`definition = $${queryIndex++}`); values.push(definition); }
    if (root !== undefined) { fieldsToUpdate.push(`root = $${queryIndex++}`); values.push(root || null); }
    if (example !== undefined) { fieldsToUpdate.push(`example = $${queryIndex++}`); values.push(example || null); }

    if (values.length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    fieldsToUpdate.push(`updated_at = NOW()`);
    values.push(id);

    const updateQuery = `
        UPDATE dictionary_entries
        SET ${fieldsToUpdate.join(', ')}
        WHERE entry_id = $${queryIndex}
        RETURNING *;
    `;

    try {
         if (term) {
            const termCheck = await pool.query(
                'SELECT entry_id FROM dictionary_entries WHERE term = $1 AND entry_id != $2',
                [term, id]
            );
            if (termCheck.rows.length > 0) {
                return res.status(409).json({ message: `The term '${term}' is already used by another entry.` });
            }
        }

        const updatedEntryResult = await pool.query(updateQuery, values);
        if (updatedEntryResult.rows.length === 0) {
            return res.status(404).json({ message: 'Dictionary entry not found or update failed.' });
        }
        console.log('Dictionary entry updated successfully:', updatedEntryResult.rows[0]); // <-- Log added
        res.status(200).json({
            message: 'Dictionary entry updated successfully.',
            entry: updatedEntryResult.rows[0]
        });
    } catch (err) {
        console.error(`Error updating dictionary entry ${id}:`, err);
        if (err.code === '23505') {
             return res.status(409).json({ message: 'Update failed due to conflicting data (term already exists).' });
        }
        res.status(500).json({ message: 'Server error updating dictionary entry.' });
    }
};

exports.deleteEntry = async (req, res) => {
    const { id } = req.params;
    console.log(`Admin request to delete dictionary entry ID: ${id}`);
    try {
        const deleteResult = await pool.query('DELETE FROM dictionary_entries WHERE entry_id = $1 RETURNING entry_id', [id]);
        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ message: 'Dictionary entry not found.' });
        }
        console.log(`Dictionary entry ${id} deleted successfully.`); // <-- Log added
        res.status(200).json({ message: `Dictionary entry ${id} deleted successfully.` });
    } catch (err) {
        console.error(`Error deleting dictionary entry ${id}:`, err);
        res.status(500).json({ message: 'Server error deleting dictionary entry.' });
    }
};
