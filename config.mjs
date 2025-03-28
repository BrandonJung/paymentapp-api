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

export const connectToDB = async () => {
  try {
    const database = client.db("sample_mflix");
    const movies = database.collection("movies");
    // Query for a movie that has the title 'Back to the Future'
    const query = { title: "Back to the Future" };
    const movie = await movies.findOne(query);
    console.log(movie);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
};
connectToDB().catch(console.dir);
