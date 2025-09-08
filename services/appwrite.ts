import { Client, Account, ID, Models } from 'react-native-appwrite';
import 'react-native-url-polyfill/auto';

// Initialize the client
const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ?? '') // Your API Endpoint
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ?? '') // Your project ID
  .setPlatform('com.kabth.movieapp'); // Your Android package name (important!)

// Initialize the account service
const account = new Account(client);

export { client, account, ID, Models };
