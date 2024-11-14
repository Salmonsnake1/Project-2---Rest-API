const express = require('express'); // Imports express
const mongoose = require('mongoose'); // Imports mongoose
const app = express(); // Creates express application instance, used for defining HTTP routes etc.

app.use(express.json()); // Allows parsing of JSON data - middleware

// Define a schema for our "Item" (Music Album) model
const itemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    genre: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    countryOfOrigin: { type: String, default: "Unknown" },
    rating: { type: Number, min: 0, max: 10 } // rating must be between 0 and 10
});

// Create the Item model based on the schema
const Item = mongoose.model('Item', itemSchema);

// MongoDB connection URI
const mongoURI = process.env.MONGODB_URI;

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });

// Sample data for testing the "Add" POST route
// Uncomment the addSampleData() call to add this data to MongoDB when the server starts.
const sampleData = [
    {
        title: 'Abbey Road',
        artist: 'The Beatles',
        genre: 'Rock',
        releaseDate: new Date('1969-09-26'),
        duration: 47
    },
    {
        title: 'Thriller',
        artist: 'Michael Jackson',
        genre: 'Pop',
        releaseDate: new Date('1982-11-30'),
        duration: 42
    }
];

async function addSampleData() {
    await Item.insertMany(sampleData);
    console.log('Sample data added!');
}
// addSampleData(); // Uncomment to add sample data when the server starts

// Routes

// 1. Get all items (GET /api/getall)
app.get('/api/getall', async (req, res) => {
    try {
        const items = await Item.find(); // Fetch all items from the database
        res.status(200).json(items); // Send the items as JSON
    } catch (err) {
        res.status(500).json({ message: 'Error fetching items', error: err });
    }
});

// 2. Flexible Search Route (GET /api/search)
app.get('/api/search', async (req, res) => {
    try {
        const query = {}; // Initialize an empty query object

        // Add conditions to the query object based on request query parameters
        if (req.query.title) {
            query.title = { $regex: req.query.title, $options: 'i' }; // Case-insensitive search
        }
        if (req.query.artist) {
            query.artist = { $regex: req.query.artist, $options: 'i' };
        }
        if (req.query.genre) {
            query.genre = { $regex: req.query.genre, $options: 'i' };
        }
        if (req.query.releaseDate) {
            query.releaseDate = new Date(req.query.releaseDate); // Convert to date
        }
        if (req.query.duration) {
            query.duration = Number(req.query.duration); // Convert to number
        }
        if (req.query.rating) {
            query.rating = Number(req.query.rating); // Exact match for rating
        }
        if (req.query.countryOfOrigin) {
            query.countryOfOrigin = { $regex: req.query.countryOfOrigin, $options: 'i' }; // Case-insensitive search
        }

        const results = await Item.find(query); // Execute the query
        res.json(results); // Return the results as JSON
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving items', error });
    }
});

// 0. Get a specific item by ID (GET /api/:id)
//app.get('/api/:id', async (req, res) => {
    //try {
        //const item = await Item.findById(req.params.id); // Fetch the item by its MongoDB ID
        //if (item) {
            //res.status(200).json(item);
        //} else {
            //res.status(404).json({ message: 'Item not found' });
       //}
    //} catch (err) {
        //res.status(500).json({ message: 'Error fetching item', error: err });
    //}
//});


// 3. Add a new item (POST /api/add)
app.post('/api/add', async (req, res) => {
    const { title, artist, genre, releaseDate, duration, countryOfOrigin, rating } = req.body;

    // Validate rating range
    if (rating < 0 || rating > 10) {
        return res.status(400).json({ message: "Rating must be between 0 and 10" });
    }

    // Create new item with provided or default values
    const newItem = new Item({
        title,
        artist,
        genre,
        releaseDate,
        duration,
        countryOfOrigin: countryOfOrigin || "Unknown", // Set default if not provided
        rating: rating || 5 // Optional default rating
    });

    try {
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(400).json({ message: 'Error saving item', error: err });
    }
});

// 4. Update an existing item (PUT /api/update/:id)
app.put('/api/update/:id', async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedItem) {
            res.status(200).json(updatedItem); // Return the updated item
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error updating item', error: err });
    }
});

// 5. Delete an item by ID (DELETE /api/delete/:id)
app.delete('/api/delete/:id', async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id); // Delete the item
        if (deletedItem) {
            res.status(200).json({ message: 'Item deleted' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error deleting item', error: err });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
