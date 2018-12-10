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
  },
  async order(parent, args, ctx, info) {
    // 1. Make sure they are logged in
    if (!ctx.request.userId) throw new Error("You must be logged in!");
    // 2. Query the current order
    const order = await ctx.db.query.order({ where: { id: args.id } }, info);
    // 3. Check if they have the permissions to see this order
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes(
      "ADMIN"
    );
    if (!ownsOrder || !hasPermissionToSeeOrder)
      throw new Error("You can't see this.");
    // 4. Return the order
    return order;
  }
};

module.exports = Query;
