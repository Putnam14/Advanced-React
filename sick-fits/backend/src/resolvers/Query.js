const { forwardTo } = require("prisma-binding");
const { hasPermission } = require("../utils");

const Query = {
  items: forwardTo("db"),
  item: forwardTo("db"),
  itemsConnection: forwardTo("db"),
  me(parent, args, ctx, info) {
    // Check if there is a current userId
    if (!ctx.request.userId) return null;
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info // Always need to pass the info (Query coming from the client side)
    );
  },
  async users(parent, args, ctx, info) {
    // Check if logged in
    if (!ctx.request.userId) throw new Error("You must be logged in!");

    // Check if user has permissions to query all the users
    hasPermission(ctx.request.user, ["ADMIN", "PERMISSIONUPDATE"]);

    // If they do, query all the users
    return ctx.db.query.users({}, info); // info includes the graphql query coming from the client
  }
};

module.exports = Query;
