'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')


class Favorite extends Model {
    tweet () {
        return this.belongsTo ('App/Models/Tweet')
    }

    user () {
        return this.belongsTo ('App/Models/User')
    }
}

module.exports = Favorite
