'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ReplySchema extends Schema {
  up () {
    this.create('replies', (table) => {
      table.increments()

      table.integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete ('CASCADE');
      
      table.integer('tweet_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tweets')
        .onUpdate('CASCADE')
        .onDelete ('CASCADE');

      table.text('reply').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('replies')
  }
}

module.exports = ReplySchema
