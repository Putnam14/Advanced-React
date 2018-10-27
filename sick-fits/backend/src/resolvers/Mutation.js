const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Mutations = {
  async createItem(parent, args, ctx, info) {
    //TODO Check if logged in

    // Context passed from createServer
    const item = await ctx.db.mutation.createItem(
      {
        // mutation creates a promise
        data: {
          ...args //Same as desc: args.desc, title: args.title, etc...
        }
      },
      info
    ); // Makes sure item is returned upon creation);
    return item;
  },
  updateItem(parent, args, ctx, info) {
    // Take a copy of updates (need ID in args for the update method)
    const updates = { ...args };
    // Remove ID from updates
    delete updates.id;
    // Run update method found in prisma.graphql
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // Find the item
    const item = await ctx.db.query.item({ where }, `{ id title }`);
    // Check for permissions
    //TODO
    // Delete
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    // Hash the password (10 tells bcrypt to generate a salt 10 characters long)
    const password = await bcrypt.hash(args.password, 10);
    // Create user in the database
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] }
        }
      },
      info
    );
    // Create JWT token for user (sign them in)
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // Set JWT as a cookie on the response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });
    // Return the user to the browser
    return user;
  }
};

module.exports = Mutations;
