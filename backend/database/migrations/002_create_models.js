export const up = function (knex) {
  return knex.schema
    .createTable("models", function (table) {
      table.increments("id").primary();
      table.string("value", 255).notNullable().unique(); // (hope no collisions)
      table.string("provider", 255).nullable();
      table.string("label", 50).notNullable();
      table.boolean("premium").notNullable().defaultTo(true); // better assume premium by default

      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
      table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
      table.index(["created_at"]);
    })
    .then(() => {
      return knex.raw(`
        CREATE TRIGGER update_models_updated_at
          BEFORE UPDATE ON models
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `);
    });
};

export const down = function (knex) {
  return knex.schema
    .raw("DROP TRIGGER IF EXISTS update_models_updated_at ON models")
    .then(() => knex.schema.dropTableIfExists("models"));
};
