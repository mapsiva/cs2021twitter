'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments() 
      table.string ('name', 512).notNullable ()
      table.string('username', 80).notNullable().unique()
      table.string('email', 254).notNullable().unique()
      table.string('password', 60).notNullable()
      table.string('location', 60).nullable()
      table.string('website_url', 60).nullable ()
      table.text('bio').nullable ()
      table.timestamps() 
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
