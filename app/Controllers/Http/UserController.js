"use strict";

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const User = use("App/Models/User");

/**
 * Resourceful controller for interacting with users
 */
class UserController {
  /**
   * Show a list of all users.
   * GET users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, view }) {
    const users = await User.all();

    return response.json(users);
  }

  /**
   * Create/save a new user.
   * POST users
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async signup({ request, response, auth }) {
    const userData = request.only(["name", "username", "email", "password"]);
    // console.log (userData)

    try {
      const user = await User.create(userData);

      const token = await auth.generate(user);

      return response.json({
        status: "success",
        data: token,
      });
    } catch (error) {
      return response.status(500).json({
        status: "error",
        message: "Ocorreu um erro inesperado!",
        technical: error,
      });
    }
  }

  async login({ request, response, auth }) {
    try {
      const token = await auth.attempt(
        request.input("email"),
        request.input("password")
      );

      return response.json({
        status: "success",
        data: token,
      });
    } catch (error) {
      return response.status(500).json({
        status: "error",
        message: "E-mail ou Senha inválidos.",
      });
    }
  }

  /**
   * Display a single user.
   * GET users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show({ params, response }) {
    try {
      return response.json(await User.findOrFail(params.id));
    } catch (error) {
      return response.status(404).json({
        status: "error",
        message: "Usuário não encontrado!",
      });
    }
  }

  /**
   * Update user details.
   * PUT or PATCH users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async updateProfile({ auth, request, response }) {
    const userData = request.only([
      "name",
      "username",
      "email",
      "password",
      "bio",
      "website_url",
      "location",
    ]);

    try {
      const user = auth.current.user;

      user.name = userData.name;
      user.username = userData.username;
      user.email = userData.email;
      user.password = userData.password;
      user.bio = userData.bio;
      user.website_url = userData.website_url;
      user.location = userData.location;

      await user.save();
    } catch (error) {
      return response.status(404).json({
        status: "error",
        message: "Não foi possível atualizar o seu perfil!",
      });
    }
  }
  // PUT http://localhost:3333/users/3
  async update({ auth, params, request, response }) {
    const userData = request.only([
      "name",
      "username",
      "email",
      "password",
      "bio",
      "website_url",
      "location",
    ]);

    try {
      const user = await User.findOrFail(params.id);

      user.name = userData.name;
      user.username = userData.username;
      user.email = userData.email;
      user.password = userData.password;
      user.bio = userData.bio;
      user.website_url = userData.website_url;
      user.location = userData.location;

      await user.save();
    } catch (error) {
      return response.status(404).json({
        status: "error",
        message: "Não foi possível atualizar o seu perfil!",
      });
    }
  }

  /**
   * Delete a user with id.
   * DELETE users/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, auth, request, response }) {
    try {
      const user = await User.findOrFail(params.id);

      await user.delete();

      return response.json({
        status: "success",
        message: "Usuário removido com o sucesso!",
      });
    } catch (error) {
      return response.status(404).json({
        status: "error",
        message: "Usuário não encontrado!",
      });
    }
  }
}

module.exports = UserController;
