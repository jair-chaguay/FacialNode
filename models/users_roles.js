const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('users_roles', {
    idusers_roles: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    users_iduser: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'idUser'
      }
    },
    roles_idrole: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'idrole'
      }
    }
  }, {
    sequelize,
    tableName: 'users_roles',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "idusers_roles" },
        ]
      },
      {
        name: "users_iduser",
        using: "BTREE",
        fields: [
          { name: "users_iduser" },
        ]
      },
      {
        name: "roles_idrole",
        using: "BTREE",
        fields: [
          { name: "roles_idrole" },
        ]
      },
    ]
  });
};
