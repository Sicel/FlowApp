const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.FB_API_KEY;
const PROJECT_ID = process.env.FB_PROJECT_ID;
const PROJECT_ID_URL = process.env.FB_PROJECT_ID_URL;
const MESSAGING_ID = process.env.FB_MESSAGING_ID;
const APP_ID = process.env.FB_APP_ID;
const MEASUREMENT_ID = process.env.FB_MEASUREMENT_ID;

exports.firebaseConfig = {
    apiKey: `${API_KEY}`,
    authDomain: `${PROJECT_ID}.firebaseapp.com`,
    databaseURL: `https://${PROJECT_ID_URL}.firebaseio.com`,
    projectId: `${PROJECT_ID}`,
    storageBucket: `${PROJECT_ID}.appspot.com`,
    messagingSenderId: `${MESSAGING_ID}`,
    appId: `${APP_ID}`,
    measurementId: `G-${MEASUREMENT_ID}`
  };