const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const db = require("./db");
const jwt = require("jsonwebtoken");

const server = createServer();

//  Middleware to handle cookies (JWT)
server.express.use(cookieParser());

// Middleware to populate current user (decode JWT)
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    // Verify that nobody has monkeyed with the token
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    // Put userId on the request for future requests to access
    req.userId = userId;
  }
  next();
});

server.start(
  {
    cors: {
      // Requirements for accessing endpoint
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  //Callback function
  deets => {
    console.log(`Server is now running on port http:/localhost:${deets.port}`);
  }
);
