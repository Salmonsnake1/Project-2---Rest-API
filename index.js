const express = require('express'); // Imports express
const mongoose = require('mongoose'); // Imports mongoose
const app = express(); // Creates express application instance, used for defining HTTP routes etc.

app.use(express.json()); // Allows parsing of JSON data - middleware


const itemSchema = new mongoose.Schema({ // creating schema for mongoose for music albums, required means has to be added, default sets it to Unknown and rating must be between 0-1
    title: { type: String, required: true }, 
    artist: { type: String, required: true },
    genre: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    countryOfOrigin: { type: String, default: "Unknown" },
    rating: { type: Number, min: 0, max: 10 } 
});

const Item = mongoose.model('Item', itemSchema); // creates an Item model based on the schema

const mongoURI = 'mongodb+srv://TestUser:TestPass@clusterproject2.i1d3f.mongodb.net/musicDB?retryWrites=true&w=majority&appName=ClusterProject2'; // connection for mongodb URI

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true }) // Connecting to Atlas with Mongoose
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch(err => { // error catch
        console.error('Error connecting to MongoDB:', err);
    });


app.get('/', (req, res) => { // quick route to test the connection is working
    res.send('MongoDB Atlas connection is working!');
});

// /api/getall route - shows all database
app.get('/api/getall', async (req, res) => { // sets up the route, seen in other routes
    try {
        const items = await Item.find(); // gets items from db
        res.status(200).json(items); // sets em as JSON
    } catch (err) { // error catch
        res.status(500).json({ message: 'Error fetching items', error: err });
    }
});

// /api/search route - can search by any parameter
app.get('/api/search', async (req, res) => { 
    try {
        const query = {}; // creates empty query object

        if (req.query.id) {
            if (mongoose.Types.ObjectId.isValid(req.query.id)) {
                query._id = req.query.id; 
            } else {
                return res.status(400).json({ message: 'Invalid ID format' });
            }
        }

        if (req.query.title) {
            query.title = { $regex: req.query.title, $options: 'i' }; // options i part is case insensitive search
        }
        if (req.query.artist) {
            query.artist = { $regex: req.query.artist, $options: 'i' };
        }
        if (req.query.genre) {
            query.genre = { $regex: req.query.genre, $options: 'i' };
        }
        if (req.query.releaseDate) {
            query.releaseDate = new Date(req.query.releaseDate); // changes it to date
        }
        if (req.query.duration) {
            query.duration = Number(req.query.duration); // changes it to number
        }
        if (req.query.rating) {
            query.rating = Number(req.query.rating); // changes to number
        }
        if (req.query.countryOfOrigin) {
            query.countryOfOrigin = { $regex: req.query.countryOfOrigin, $options: 'i' }; 
        }

        const results = await Item.find(query); // initiates query

        if (results.length === 0) { // message if no results found
            return res.status(404).json({ message: 'No matching items found' });
        }

        res.json(results); // gives query as JSON
    } catch (error) { // error catch
        res.status(500).json({ message: 'Error retrieving items', error });
    }
});

// This route gets api by :id. I commented it out as the search also does this but left the code in here to prove it works
//app.get('/api/:id', async (req, res) => {
    //try {
        //const item = await Item.findById(req.params.id); // finds the item by the ID
        //if (item) {
            //res.status(200).json(item);
        //} else {
            //res.status(404).json({ message: 'Item not found' });
       //}
    //} catch (err) { // error catch
        //res.status(500).json({ message: 'Error fetching item', error: err });
    //}
//});


// /api/add - adding a new entry to the database 
app.post('/api/add', async (req, res) => {
    const { title, artist, genre, releaseDate, duration, countryOfOrigin, rating } = req.body; // parsing incoming JSON body as variables

    // checks the rating should be between 0 and 10
    if (rating < 0 || rating > 10) {
        return res.status(400).json({ message: "Rating must be between 0 and 10" });
    }

    // creating the item with the new values or defaults
    const newItem = new Item({
        title,
        artist,
        genre,
        releaseDate,
        duration,
        countryOfOrigin: countryOfOrigin || "Unknown", // default
        rating: rating || 5 // default
    });

    try {
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) { // error catch
        res.status(400).json({ message: 'Error saving item', error: err });
    }
});

// /api/update/:id route updates the entry
app.put('/api/update/:id', async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true }); // finds item by params.id, the req.body updates it, the new: true checks updated returns
        if (updatedItem) {
            res.status(200).json(updatedItem); // updated item returns
        } else {
            res.status(404).json({ message: 'Item not found' }); // if item not there
        }
    } catch (err) { // error catch
        res.status(500).json({ message: 'Error updating item', error: err });
    }
});

// /api/delete/:id route - deletes the existing id
app.delete('/api/delete/:id', async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id); // finds item and deletes it
        if (deletedItem) {
            res.status(200).json({ message: 'Item deleted' });
        } else {
            res.status(404).json({ message: 'Item not found' }); // if item not there
        }
    } catch (err) { // error catch
        res.status(500).json({ message: 'Error deleting item', error: err });
    }
});

// starts the server
const PORT = process.env.PORT || 3000; // default port is 3000
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
