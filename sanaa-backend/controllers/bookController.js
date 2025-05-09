// sanaa-backend/controllers/bookController.js
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

const getFullFileUrl = (req, filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }
    const basePath = '/uploads/';
    const relativePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const baseUrl = process.env.NODE_ENV === 'production' ? process.env.BASE_URL : `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}${basePath}${relativePath}`;
};

exports.getAllBooks = async (req, res) => {
    console.log("Request received to get all books", req.query);
    const { category } = req.query;

    try {
        let query = `
            SELECT book_id, title, author, description, cover_url, file_url, category, published_year, created_at
            FROM books
        `;
        const queryParams = [];
        if (category) {
            query += ' WHERE category ILIKE $1';
            queryParams.push(`%${category}%`);
        }
        query += ' ORDER BY created_at DESC'; // Or title ASC for public view

        const result = await pool.query(query, queryParams);
        console.log('Fetched books from DB:', result.rows); // <-- Log added

        const booksWithUrls = result.rows.map(book => ({
            ...book,
            cover_url: getFullFileUrl(req, book.cover_url),
            file_url: getFullFileUrl(req, book.file_url)
        }));

        res.status(200).json({
            message: "Books fetched successfully.",
            count: result.rows.length,
            books: booksWithUrls
        });
    } catch (err) {
        console.error("Error fetching books:", err);
        res.status(500).json({ message: "Server error fetching books." });
    }
};

exports.getBookById = async (req, res) => {
    const { id } = req.params;
    console.log(`Request received to get book with ID: ${id}`);
    try {
        const result = await pool.query(
            `SELECT book_id, title, author, description, cover_url, file_url, category, published_year, created_at
             FROM books
             WHERE book_id = $1`,
            [id]
        );
        console.log(`Fetched book ${id} from DB:`, result.rows[0]); // <-- Log added

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Book not found.' });
        }
        const book = result.rows[0];
        book.cover_url = getFullFileUrl(req, book.cover_url);
        book.file_url = getFullFileUrl(req, book.file_url);
        res.status(200).json({
            message: "Book fetched successfully.",
            book: book
        });
    } catch (err) {
        console.error(`Error fetching book ${id}:`, err);
        res.status(500).json({ message: "Server error fetching book details." });
    }
};

exports.addBook = async (req, res) => {
    const { title, author, description, category, published_year } = req.body;
    const coverFile = req.files?.coverFile?.[0];
    const bookFile = req.files?.bookFile?.[0];
    console.log("Admin request to add new book:", { title, author, coverFile: coverFile?.filename, bookFile: bookFile?.filename });

    if (!title) {
        if (coverFile) fs.unlink(coverFile.path, (err) => { if (err) console.error("Error deleting uploaded cover on validation fail:", err); });
        if (bookFile) fs.unlink(bookFile.path, (err) => { if (err) console.error("Error deleting uploaded book file on validation fail:", err); });
        return res.status(400).json({ message: "Book title is required." });
    }

    const coverDbPath = coverFile ? path.join('books', 'covers', coverFile.filename).replace(/\\/g, '/') : null;
    const fileDbPath = bookFile ? path.join('books', 'files', bookFile.filename).replace(/\\/g, '/') : null;

    try {
        const insertQuery = `
            INSERT INTO books (title, author, description, cover_url, file_url, category, published_year, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING *;
        `;
        const values = [
            title, author || null, description || null, coverDbPath, fileDbPath,
            category || null, published_year ? parseInt(published_year, 10) : null
        ];
        const newBookResult = await pool.query(insertQuery, values);
        const newBook = newBookResult.rows[0];
        newBook.cover_url = getFullFileUrl(req, newBook.cover_url);
        newBook.file_url = getFullFileUrl(req, newBook.file_url);
        console.log('Book added successfully:', newBook); // <-- Log added
        res.status(201).json({
            message: "Book added successfully.",
            book: newBook
        });
    } catch (err) {
        console.error("Error adding book:", err);
        if (coverFile) fs.unlink(coverFile.path, (unlinkErr) => { if (unlinkErr) console.error("Error deleting uploaded cover after DB error:", unlinkErr); });
        if (bookFile) fs.unlink(bookFile.path, (unlinkErr) => { if (unlinkErr) console.error("Error deleting uploaded book file after DB error:", unlinkErr); });
        res.status(500).json({ message: "Server error adding book." });
    }
};

exports.updateBook = async (req, res) => {
    const { id } = req.params;
    const { title, author, description, category, published_year } = req.body;
    const coverFile = req.files?.coverFile?.[0];
    const bookFile = req.files?.bookFile?.[0];
    console.log(`Admin request to update book ID: ${id} with data:`, { title, coverFile: coverFile?.filename, bookFile: bookFile?.filename });

    let oldCoverPath = null;
    let oldFilePath = null;
    const uploadsBaseDir = path.join(__dirname, '..', 'uploads');

    try {
        const existingResult = await pool.query('SELECT cover_url, file_url FROM books WHERE book_id = $1', [id]);
        if (existingResult.rows.length === 0) {
             if (coverFile) fs.unlink(coverFile.path, (err) => { if (err) console.error("Error deleting new cover for non-existent book:", err); });
             if (bookFile) fs.unlink(bookFile.path, (err) => { if (err) console.error("Error deleting new book file for non-existent book:", err); });
            return res.status(404).json({ message: 'Book not found.' });
        }
        oldCoverPath = existingResult.rows[0].cover_url;
        oldFilePath = existingResult.rows[0].file_url;

        const fieldsToUpdate = [];
        const values = [];
        let queryIndex = 1;

        if (title !== undefined) { fieldsToUpdate.push(`title = $${queryIndex++}`); values.push(title); }
        if (author !== undefined) { fieldsToUpdate.push(`author = $${queryIndex++}`); values.push(author || null); }
        if (description !== undefined) { fieldsToUpdate.push(`description = $${queryIndex++}`); values.push(description || null); }
        if (category !== undefined) { fieldsToUpdate.push(`category = $${queryIndex++}`); values.push(category || null); }
        if (published_year !== undefined) { fieldsToUpdate.push(`published_year = $${queryIndex++}`); values.push(published_year ? parseInt(published_year, 10) : null); }

        if (coverFile) {
            const newCoverDbPath = path.join('books', 'covers', coverFile.filename).replace(/\\/g, '/');
            fieldsToUpdate.push(`cover_url = $${queryIndex++}`);
            values.push(newCoverDbPath);
        }
         if (bookFile) {
            const newFileDbPath = path.join('books', 'files', bookFile.filename).replace(/\\/g, '/');
            fieldsToUpdate.push(`file_url = $${queryIndex++}`);
            values.push(newFileDbPath);
        }

        if (fieldsToUpdate.length === 0) {
             if (coverFile) fs.unlink(coverFile.path, (err) => { if (err) console.error("Error deleting unused new cover:", err); });
             if (bookFile) fs.unlink(bookFile.path, (err) => { if (err) console.error("Error deleting unused new book file:", err); });
             const currentData = await pool.query('SELECT * FROM books WHERE book_id = $1', [id]);
             const currentBook = currentData.rows[0];
             currentBook.cover_url = getFullFileUrl(req, currentBook.cover_url);
             currentBook.file_url = getFullFileUrl(req, currentBook.file_url);
            return res.status(200).json({ message: "No changes detected.", book: currentBook });
        }

        fieldsToUpdate.push(`updated_at = NOW()`);
        values.push(id);

        const updateQuery = `
            UPDATE books
            SET ${fieldsToUpdate.join(', ')}
            WHERE book_id = $${queryIndex}
            RETURNING *;
        `;
        const updatedBookResult = await pool.query(updateQuery, values);
        const updatedBook = updatedBookResult.rows[0];

        if (coverFile && oldCoverPath && oldCoverPath !== updatedBook.cover_url) {
            const fullOldCoverPath = path.join(uploadsBaseDir, oldCoverPath);
            fs.unlink(fullOldCoverPath, (err) => {
                if (err && err.code !== 'ENOENT') console.error(`Error deleting old cover file ${fullOldCoverPath}:`, err);
                else if (!err) console.log(`Deleted old cover file: ${fullOldCoverPath}`);
            });
        }
        if (bookFile && oldFilePath && oldFilePath !== updatedBook.file_url) {
            const fullOldFilePath = path.join(uploadsBaseDir, oldFilePath);
            fs.unlink(fullOldFilePath, (err) => {
                if (err && err.code !== 'ENOENT') console.error(`Error deleting old book file ${fullOldFilePath}:`, err);
                 else if (!err) console.log(`Deleted old book file: ${fullOldFilePath}`);
            });
        }
        updatedBook.cover_url = getFullFileUrl(req, updatedBook.cover_url);
        updatedBook.file_url = getFullFileUrl(req, updatedBook.file_url);
        console.log('Book updated successfully:', updatedBook); // <-- Log added
        res.status(200).json({
            message: 'Book updated successfully.',
            book: updatedBook
        });
    } catch (err) {
        console.error(`Error updating book ${id}:`, err);
        if (coverFile) fs.unlink(coverFile.path, (unlinkErr) => { if (unlinkErr) console.error("Error deleting new cover after update error:", unlinkErr); });
        if (bookFile) fs.unlink(bookFile.path, (unlinkErr) => { if (unlinkErr) console.error("Error deleting new book file after update error:", unlinkErr); });
        res.status(500).json({ message: 'Server error updating book.' });
    }
};

exports.deleteBook = async (req, res) => {
    const { id } = req.params;
    console.log(`Admin request to delete book ID: ${id}`);
    let coverPathToDelete = null;
    let filePathToDelete = null;
    const uploadsBaseDir = path.join(__dirname, '..', 'uploads');

    try {
        const fileResult = await pool.query('SELECT cover_url, file_url FROM books WHERE book_id = $1', [id]);
        if (fileResult.rows.length === 0) {
            return res.status(404).json({ message: 'Book not found.' });
        }
        if(fileResult.rows[0].cover_url) {
            coverPathToDelete = path.join(uploadsBaseDir, fileResult.rows[0].cover_url);
        }
        if(fileResult.rows[0].file_url) {
            filePathToDelete = path.join(uploadsBaseDir, fileResult.rows[0].file_url);
        }

        const deleteResult = await pool.query('DELETE FROM books WHERE book_id = $1 RETURNING book_id', [id]);
        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ message: 'Book not found during deletion attempt.' });
        }

        if (coverPathToDelete) {
            fs.unlink(coverPathToDelete, (err) => {
                if (err && err.code !== 'ENOENT') console.error(`Error deleting cover file ${coverPathToDelete}:`, err);
                else if (!err) console.log(`Deleted cover file: ${coverPathToDelete}`);
            });
        }
        if (filePathToDelete) {
            fs.unlink(filePathToDelete, (err) => {
                if (err && err.code !== 'ENOENT') console.error(`Error deleting book file ${filePathToDelete}:`, err);
                 else if (!err) console.log(`Deleted book file: ${filePathToDelete}`);
            });
        }
        console.log(`Book ${id} deleted successfully.`); // <-- Log added
        res.status(200).json({ message: `Book ${id} deleted successfully.` });
    } catch (err) {
        console.error(`Error deleting book ${id}:`, err);
        res.status(500).json({ message: 'Server error deleting book.' });
    }
};
