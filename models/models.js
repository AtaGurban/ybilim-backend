const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const Course = sequelize.define("course", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: { type: DataTypes.STRING, defaultValue: null },
  description: { type: DataTypes.STRING, defaultValue: null },
  img: { type: DataTypes.STRING, defaultValue: null },
  favourite: { type: DataTypes.BOOLEAN, defaultValue: true },
});

const Video = sequelize.define("video", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: { type: DataTypes.STRING, defaultValue: null },
  video: { type: DataTypes.STRING, defaultValue: null },
  description: { type: DataTypes.STRING, defaultValue: null },
  img: { type: DataTypes.STRING, defaultValue: null },

});

const User = sequelize.define(
  "user",
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true,},
    avatar: { type: DataTypes.STRING, defaultValue: null },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    first_name: { type: DataTypes.STRING, defaultValue: null },
    last_name: { type: DataTypes.STRING, defaultValue: null },
    description: { type: DataTypes.STRING, defaultValue: null }, 
    role: {type: DataTypes.STRING, defaultValue: 'USER'}
  }
);

const Transaction = sequelize.define(
  "transaction",
  {
    id: { type: DataTypes.BIGINT, primaryKey: true, },
  }
);

  
User.belongsToMany(Course, {through: Transaction}) 
Course.belongsToMany(User, {through: Transaction})

Course.hasMany(Video, { as: "video" });
Video.belongsTo(Course, {as: 'course'});

User.hasMany(Course, { as: "course" });
Course.belongsTo(User, {as: 'user'});

module.exports = {
  Course,
  User,
  Video
}