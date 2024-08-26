var DataTypes = require("sequelize").DataTypes;
var _asistencia = require("./asistencia");
var _roles = require("./roles");
var _user_images = require("./user_images");
var _users = require("./users");
var _users_roles = require("./users_roles");

function initModels(sequelize) {
  var asistencia = _asistencia(sequelize, DataTypes);
  var roles = _roles(sequelize, DataTypes);
  var user_images = _user_images(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var users_roles = _users_roles(sequelize, DataTypes);

  users_roles.belongsTo(roles, { as: "roles_idrole_role", foreignKey: "roles_idrole"});
  roles.hasMany(users_roles, { as: "users_roles", foreignKey: "roles_idrole"});
  asistencia.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(asistencia, { as: "asistencia", foreignKey: "userId"});
  user_images.belongsTo(users, { as: "user", foreignKey: "userId"});
  users.hasMany(user_images, { as: "user_images", foreignKey: "userId"});
  users_roles.belongsTo(users, { as: "users_iduser_user", foreignKey: "users_iduser"});
  users.hasMany(users_roles, { as: "users_roles", foreignKey: "users_iduser"});

  return {
    asistencia,
    roles,
    user_images,
    users,
    users_roles,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
