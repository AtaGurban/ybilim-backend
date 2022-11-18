const ApiError = require("../error/ApiError");
const fs = require("fs");
const uuid = require("uuid");
const path = require("path");

const removeImg = async (img)=>{
    fs.unlink(
        path.resolve(__dirname, "..", "files", "images", img),
        function (err) {
          if (err) {
            console.log(err);
          }
        }
      );
}
const { Course, Video, User, City, Collage, Direction } = require("../models/models");

class EducationControllers {

  async getAllCity(req, res, next) {
    const cityes = await City.findAll()
    return res.json(cityes)
  }
  async removeCity(req, res, next) {
    const {id} = req.query
    const city = await City.findOne({where:{id}})
    await removeImg(city.img)
    await city.destroy()
    const collages = await Collage.findAll({where:{cityId:null}})
    collages.map(async (i)=>{
        await removeImg(i.img)
        await i.destroy()
    })
    const directions = await Direction.findAll({where:{collageId:null}})
    directions.map(async (i)=>{
        await removeImg(i.img)
        await i.destroy()
    })
    return res.json(city)
  }
  async createCity(req, res, next) {
    const {name, price} = req.body
    const {imgFile} = req.files
    let img = uuid.v4() + ".jpg";
    imgFile.mv(path.resolve(__dirname, "..", "files", "images", img));
    const city = await City.create({
        img, price, name
    })
    return res.json(city)
  }

}

module.exports = new EducationControllers();
