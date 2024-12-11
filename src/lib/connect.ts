import { MongoClient } from "mongodb";

export async function connectToDatabase(uri: string, database: string) {
    const client = new MongoClient(uri);
    
    try {
      await client.connect();
      // console.log(chalk.green('Connected to MongoDB.'));
      console.log('Connected to MongoDB.');
      return client.db(database);
    } catch (err) {
      // console.error(chalk.red('Failed to connect to MongoDB.'), err);
      console.error('Failed to connect to MongoDB.', err);
      process.exit(1);
    }
  }