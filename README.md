REST API for Music Album database, see routes below

Using Vercel.

HTTP VERB URL OPERATION
GET https://project-2-rest-api.vercel.app/api/getall Return all documents in collection
GET https://project-2-rest-api.vercel.app/api/:id Return one item with the given id - commented out in favour of search
GET https://project-2-rest-api.vercel.app/api/search? Return one item based on given search parameter
POST https://project-2-rest-api.vercel.app/api/add Create a new document in the collection
PUT/PATCH https://project-2-rest-api.vercel.app/api/:id Update the document with the given id
DELETE https://project-2-rest-api.vercel.app/api/:id Delete the item with the given id

Future additions could be updating various parts not just id, and deleting an item with a given title etc.
