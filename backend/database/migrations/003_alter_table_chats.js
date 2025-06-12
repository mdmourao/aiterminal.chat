export const up = function (knex) {
  return knex.schema.alterTable("chats", function (table) {
    table
      .text("user_id")
      .references("id")
      .inTable("user")
      .notNullable()
      .onDelete("CASCADE");
  });
};

export const down = function (knex) {
  return knex.schema.alterTable("chats", function (table) {
    table.dropColumn("user_id");
  });
};
