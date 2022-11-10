const { Course, Video, User, Transaction } = require("../models/models");
const fs = require("fs");
const ApiError = require("../error/ApiError");
const uuid = require("uuid");
const path = require("path");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

class AdminController {
  async createCourse(req, res, next) {
    try {
      const { name, description, favourite, teacher } = req.body;
      if (!name || !description || !favourite || !teacher){
        return next(ApiError.internal("Maglumatlar doly dal"));
      }
      const teacherdata = await User.findOne({where:{phone:teacher}})
      if (!teacherdata){
        return next(ApiError.internal("Munun yaly mugallym yok"));
      }
      
      const { imgFile } = req.files;
      let img = uuid.v4() + ".jpg";

      imgFile.mv(path.resolve(__dirname, "..", "files", "images", img));

      const course = await Course.create({ name, img, description, favourite, user:teacherdata.id });

      return res.json(course);
    } catch (error) {
      next(ApiError.internal(error.message));
    }
  }
  async createVideo(req, res, next) {
    try {
        const { name,  number, courseId } = req.body;
        const {img, video} = req.files 
        const fileNameImg = uuid.v4() + ".jpg";  
        const fileNameVideo = (uuid.v4() + '.mp4');    
        const fileNameVideoPath = '720' + fileNameVideo;    
        img.mv(path.resolve(__dirname, "..", "files", "images", fileNameImg))
        video.mv(path.resolve(__dirname, "..", "files", "convertedVideo", (fileNameVideoPath)))
        const pathConvertVideo = path.resolve(__dirname, "..", "files", "convertedVideo", fileNameVideoPath)
        // await ffmpeg(pathConvertVideo)
        // .size('1280x720').audioBitrate(96).videoBitrate(800).save(path.resolve(__dirname, "..", "files", "convertedVideo", ('720' + fileNameVideo)))
        await ffmpeg(pathConvertVideo)
        .size('854x480').audioBitrate(96).videoBitrate(400).save(path.resolve(__dirname, "..", "files", "convertedVideo", ('480' + fileNameVideo)))
        await ffmpeg(pathConvertVideo)
        .size('640x360').audioBitrate(96).videoBitrate(250).save(path.resolve(__dirname, "..", "files", "convertedVideo", ('360' + fileNameVideo)))
        // .size('854x480').audioBitrate(96).videoBitrate(500).save(path.resolve(__dirname, "..", "files", "ConvertedVideo", ('480' + fileNameVideo)))
        // .size('640x360').audioBitrate(96).videoBitrate(300).save(path.resolve(__dirname, "..", "files", "ConvertedVideo", ('360' + fileNameVideo)))
        const result = await Video.create({
            name,
            courseId,
            number,   
            video:fileNameVideo,
            img:fileNameImg,
        })
        return res.json(result)
    } catch (error) { 
        console.log(error);
    }
  }

  async getAll(req, res) {
    const list = await Course.findAll();
    return res.json(list);
  }

  async getFavouriteCourse(req, res) {
    const list = await Course.findAll({where:{favourite:true}});
    return res.json(list);
  }
  async getAllVideo(req, res) {
    const {id} = req.query
    const list = await Video.findAll({where:{courseId:id}});
    return res.json(list);
  }
  async getAllUsers(req, res) {
    const page = req.query.page || 1;
    const limit = 10;
    const offset = (page - 1) * limit
    const users = await User.findAndCountAll({offset, limit});
    // users.rows = users.rows.slice((page - 1 ) * limit, page * limit) 
    return res.json(users);
  }

  async buyCourse(req, res) {
    const {number, userId} = req.body
    const course = await Course.findOne({where:{id:number}})
    const user = await User.findOne({where:{id:userId}})
    if (!user || !course){
      return next(ApiError.internal("Girizilen maglumatlar yalnys"));
    }
    const transaction = await Transaction.create({
      userId,
      courseId:number
    })
    return res.json(transaction);
  }

  // async update(req, res) {
  //   const brand = req.body;
  //   let id = brand.id;
  //   let img = req.files;

  //   if (img.img) {
  //     img = img.img;
  //     let imgName = uuid.v4() + ".jpg";
  //     img.mv(path.resolve(__dirname, "..", "files", "images", imgName));
  //     brand.img = imgName;
  //   }

  //   if (!brand.id) {
  //     res.status(400).json({ message: "ID yok" });
  //   }

  //   const updatedPost = await Brand.update(brand, { where: { id } });

  //   return res.json(updatedPost);
  // }

  async deleteCourse(req, res) {
    const { id } = req.query;
    const course = await Course.findOne({ where: { id } });
    const courseWideos = await Video.findAll({where:{courseId:id}})
    courseWideos.map((i)=>{
      fs.unlink(
        path.resolve(__dirname, "..", "files", "images", i.img),
        function (err) {
          if (err) {
            console.log(err);
          }
        }
      );
      fs.unlink(
        path.resolve(__dirname, "..", "files", "convertedVideo", `720${i.video}`),
        function (err) {
          if (err) {
            console.log(err);
          }
        }
      );
      fs.unlink(
        path.resolve(__dirname, "..", "files", "convertedVideo", `480${i.video}`),
        function (err) {
          if (err) {
            console.log(err);
          }
        }
      );
      fs.unlink(
        path.resolve(__dirname, "..", "files", "convertedVideo", `360${i.video}`),
        function (err) {
          if (err) {
            console.log(err);
          }
        }
      );
      i.destroy()
    })
      fs.unlink(
      path.resolve(__dirname, "..", "files", "images", course.img),
      function (err) {
        if (err) {
          console.log(err);
        }
      }
    );
    course.destroy();
    const transactionsItems = await Transaction.findAll({where:{courseId:null}})
    transactionsItems.map(async (i)=>{
      await Transaction.destroy({where:{id: i.id}})
    })
    return res.json(course);
  }
  async deleteVideo(req, res) {
    const { id } = req.query;
    const course = await Video.findOne({ where: { id } });

    fs.unlink(
      path.resolve(__dirname, "..", "files", "images", course.img),
      function (err) {
        if (err) {
          console.log(err);
        }
      }
    );
    fs.unlink(
      path.resolve(__dirname, "..", "files", "convertedVideo", `720${course.video}`),
      function (err) {
        if (err) {
          console.log(err);
        }
      }
    );
    fs.unlink(
      path.resolve(__dirname, "..", "files", "convertedVideo", `480${course.video}`),
      function (err) {
        if (err) {
          console.log(err);
        }
      }
    );
    fs.unlink(
      path.resolve(__dirname, "..", "files", "convertedVideo", `360${course.video}`),
      function (err) {
        if (err) {
          console.log(err);
        }
      }
    );
    course.destroy()
    return res.json(course);
  }
}

module.exports = new AdminController();
