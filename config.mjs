import { MongoClient } from "mongodb";
let connectionString = "";

switch (process.env.NODE_ENV) {
  case "dev": {
    connectionString = process.env.MONGO_URI_DEV;
    break;
  }
  case "staging": {
    connectionString = process.env.MONGO_URI_STAGING;
    break;
  }
  default:
    break;
}

const client = new MongoClient(connectionString);

let connection;

try {
  connection = await client.connect();
} catch (e) {
  console.log(e);
}

export const database = connection.db(process.env.NODE_ENV);

// export const connectToDB = async () => {
//   try {
//     const database = client.db("sample_mflix");
//     const movies = database.collection("movies");
//     // Query for a movie that has the title 'Back to the Future'
//     const query = { title: "Back to the Future" };
//     const movie = await movies.findOne(query);
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// };
// connectToDB().catch(console.dir);
