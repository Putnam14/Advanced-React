const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");
const { transport, makeANiceEmail } = require("../mail");
const { hasPermission } = require("../utils");
const stripe = require("../stripe");

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // Check if logged in
    if (!ctx.request.userId)
      throw new Error("Items can only be created if you are logged in.");
    // Context passed from createServer
    const item = await ctx.db.mutation.createItem(
      {
        // mutation creates a promise
        data: {
          // This is how we create a relationship between the item and the user
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
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
    const item = await ctx.db.query.item({ where }, `{ id title user { id }}`);
    // Check for permissions, or if they own the item
    const ownsItem = item.user.id === ctx.request.user.id;
    const hasPermission = ctx.request.user.permissions.some(perm =>
      ["ADMIN", "ITEMDELETE"].includes(perm)
    );
    if (!ownsItem && !hasPermission)
      throw new Error("You do not have permission to delete this.");
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
  },
  async signin(parent, { email, password }, ctx, info) {
    // Check if there is a user with this email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      // If this were a more security-sensitive app, use a generic 'invalid user/password'
      throw new Error(`No user found for email ${email}`);
    }
    // Check if password is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid password");
    }
    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // Set cookie with JWT
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });
    // Return the user
    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "Goodbye!" };
  },
  async requestReset(parent, args, ctx, info) {
    // Check if this is a real user
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) throw new Error(`No such user found for email ${args.email}`);
    // Set a reset token and expiry
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    const res = await ctx.db.mutation.updateUser({
      // Update the user with the reset token and expiry
      where: { email: args.email },
      data: { resetToken: resetToken, resetTokenExpiry }
    });
    // Email the token
    const mailRes = await transport.sendMail({
      from: "hey@sawtooth.digital",
      to: user.email,
      subject: "Your Password Reset Token",
      html: makeANiceEmail(`
        Your password reset token is here!
        \n\n
        Your token is: ${resetToken}
        \n\n
        <a href="${
          process.env.FRONTEND_URL
        }/reset?resetToken=${resetToken}">Click here to reset your password</a>
      `)
    });
    // Return a message
    return { message: "Thanks!" };
  },
  async resetPassword(parents, args, ctx, info) {
    // Check if the passwords match
    if (args.password !== args.confirmPassword)
      throw new Error("Yo passwords don't match");
    // Check if it's a legit reset token
    // Check if it's expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });
    if (!user) throw new Error("This token is either invalid or expired");
    // Hash the new password
    const password = await bcrypt.hash(args.password, 10);
    // Save the new password to the user and remove old reset token fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: {
        email: user.email
      },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    // Generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // Set JWT cookie
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    // Return new logged in user
    return updatedUser;
  },
  async updatePermissions(parents, args, ctx, info) {
    // Check if logged in
    if (!ctx.request.userId) throw new Error("Please log in!");
    // Query the current user
    const currentUser = await ctx.db.query.user(
      { where: { id: ctx.request.userId } },
      info
    );
    // Check if they have permission
    hasPermission(currentUser, ["ADMIN", "PERMISSIONUPDATE"]);
    // Update the permissions
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            // Need to use set since it has its own data type
            set: args.permissions
          }
        },
        where: {
          // Using args.userId since ctx gives your own
          // Updating permissions is often done to another user
          id: args.userId
        }
      },
      info
    );
  },
  async addToCart(parents, args, ctx, info) {
    //Make sure user is signed in
    const { userId } = ctx.request;
    if (!userId) throw new Error("You must be signed in");
    //Query current cart state
    const [existingCartItem] = await ctx.db.query.cartItems({
      //cartItems since we want to search by userId
      where: {
        user: { id: userId },
        item: { id: args.id }
      }
    });
    //Check if item is already in cart (add or increment)
    if (existingCartItem) {
      console.log("This item is already in their cart");
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 }
        },
        info
      );
    }
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: { connect: { id: userId } },
          item: { connect: { id: args.id } }
        }
      },
      info
    );
  },
  async removeFromCart(parent, args, ctx, info) {
    // Find the cart item
    const cartItem = await ctx.db.query.cartItem(
      {
        where: {
          id: args.id
        }
      },
      `{ id, user { id }}`
    );
    // Make sure we found an item
    if (!cartItem) throw new Error("No cart item found!");
    // Make sure they own that cart item
    if (cartItem.user.id !== ctx.request.userId)
      throw new Error("Can't do that yo");
    // Delete cart item
    return ctx.db.mutation.deleteCartItem(
      {
        where: {
          id: args.id
        }
      },
      info
    );
  },
  async createOrder(parent, args, ctx, info) {
    // Query the current user
    const { userId } = ctx.request;
    // Make sure they are signed in
    if (!userId) throw new Error("Must be signed in to complete this order");
    const user = await ctx.db.query.user(
      { where: { id: userId } },
      `{
        id
        name
        email
        cart {
          id
          quantity
          item {
            id
            title
            price
            description
            image
            largeImage
          }
        }
      }`
    );
    // Recalculate the total for the price (server-side price verification)
    const amount = user.cart.reduce(
      (tally, item) => tally + item.item.price * item.quantity,
      0
    );
    console.log(`GOing to charge for a totla of ${amount}`);
    // Create the Stripe charge
    const charge = await stripe.charges.create({
      amount,
      currency: "USD",
      source: args.token
    });
    // Convert the cart items to order items
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: userId } }
      };
      delete orderItem.id;
      return orderItem;
    });
    // Create the order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: userId } }
      }
    });
    // Clear the user's cart
    const cartItemIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: { id_in: cartItemIds }
    });
    // Return the order to the client
    return order;
  }
};

module.exports = Mutations;
