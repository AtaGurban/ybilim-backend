const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Course = sequelize.define("course", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  description: { type: DataTypes.STRING, defaultValue: null },
  video: { type: DataTypes.STRING, defaultValue: null },
  img: { type: DataTypes.STRING, defaultValue: null },

});

module.exports = {
  Course
}