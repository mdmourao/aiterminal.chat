// migrations/<timestamp>_create_chats_and_messages_tables.js

export const up = function (knex) {
  return knex.schema
    .createTable("chats", function (table) {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table.string("title", 255).nullable();
      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
      table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
      table.index(["created_at"]);
    })
    .createTable("messages", function (table) {
      table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
      table
        .uuid("chat_id")
        .notNullable()
        .references("id")
        .inTable("chats")
        .onDelete("CASCADE");

      table.string("role", 50).notNullable();
      table.string("model", 100).nullable();
      table.text("content").notNullable();
      table.boolean("streamed_complete").notNullable().defaultTo(false);

      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
      table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

      table.index(["chat_id", "created_at"]);
      table.index(["chat_id"]);
      table.index(["created_at"]);
    })
    .then(() => {
      return knex.raw(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);
    })
    .then(() => {
      return knex.raw(`
        CREATE TRIGGER update_chats_updated_at 
          BEFORE UPDATE ON chats 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
      `);
    })
    .then(() => {
      return knex.raw(`
        CREATE TRIGGER update_messages_updated_at 
          BEFORE UPDATE ON messages 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
      `);
    });
};

export const down = function (knex) {
  return knex.schema
    .raw("DROP TRIGGER IF EXISTS update_chats_updated_at ON chats")
    .then(() =>
      knex.raw("DROP TRIGGER IF EXISTS update_messages_updated_at ON messages")
    )
    .then(() => knex.schema.dropTableIfExists("messages"))
    .then(() => knex.schema.dropTableIfExists("chats"))
    .then(() => knex.raw("DROP FUNCTION IF EXISTS update_updated_at_column()"));
};
