export const up = function (knex) {
  return knex.schema
    .createTable("subscriptions", function (table) {
      table.increments("id").primary();

      table.string("status").notNullable(); // 'created', 'active', 'cancelled','on_free_plan'
      table.string("source").notNullable(); // 'stripe', 'system',
      table.string("plan").notNullable(); // 'free', 'premium'
      table.integer("premium_credits").notNullable();
      table.integer("credits").notNullable();

      table
        .text("user_id")
        .references("id")
        .inTable("user")
        .notNullable()
        .unique()
        .onDelete("CASCADE");

      table.string("stripe_customer_id").nullable();
      table.string("stripe_subscription_id").unique().nullable();
      table.string("stripe_price_id").nullable();

      table.timestamp("current_period_start").nullable();
      table.timestamp("current_period_end").nullable();

      table.timestamp("cancelled_at").nullable();

      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .then(() => {
      return knex.raw(`
        CREATE TRIGGER update_subscriptions_updated_at
          BEFORE UPDATE ON subscriptions
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
    });
};

export const down = function (knex) {
  return knex.schema.dropTable("subscriptions").then(() => {
    return knex.raw(`
        DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
      `);
  });
};
