# REST API for Music Album database using Mongodb, mongoose and Vercel. See added routes below:

- GET https://project-2-rest-api.vercel.app/api/getall Return all documents in collection
- GET https://project-2-rest-api.vercel.app/api/:id Return one item with the given id - commented out in favour of search
- GET https://project-2-rest-api.vercel.app/api/search? Return one item based on given search parameter
- POST https://project-2-rest-api.vercel.app/api/add Create a new document in the collection
- PUT/PATCH https://project-2-rest-api.vercel.app/api/:id Update the document with the given id
- DELETE https://project-2-rest-api.vercel.app/api/:id Delete the item with the given id

### Future Updates
PUT/PATCH and DELETE could be updated that entries can be deleted by whatever selected id, title, genre similar to GET/SEARCH
Project-3 will be using React for the front-end. 
