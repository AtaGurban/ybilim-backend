const ApiError = require("../error/ApiError");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");

const { Course, Video, User } = require("../models/models");
const { where } = require("sequelize");

class StreamControllers {
  async stream(req, res, next) {
    try {
        const { id, q } = req.query;
        const video = await Video.findOne({ where: { id: id } });
        const videoName = `${q}${video.video}`;
        // Ensure there is a range given for the video
        const range = req.headers.range;
        if (!range) {
          res.status(400).send("Requires Range header");
        }
        const videoPath = path.resolve(
          __dirname,
          "..",
          "files",
          "ConvertedVideo",
          videoName
        );
        const videoSize = fs.statSync(videoPath).size;
        const CHUNK_SIZE = 10 ** 6 / 2; // 1MB
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    
        // Create headers
        const contentLength = end - start + 1;
        const headers = {
          "Content-Range": `bytes ${start}-${end}/${videoSize}`,
          "Accept-Ranges": "bytes", 
          "Content-Length": contentLength, 
          "Content-Type": "video/mp4",
        };
        res.writeHead(206, headers);
    
        // create video read stream for this particular chunk
        const videoStream = fs.createReadStream(videoPath, { start, end });
    
        // Stream the video chunk to the client
        videoStream.pipe(res);
    } catch (error) {
        return res.json(error)
    }


  }

  // async add(req, res, next) {
  //     try {
  //         const { name, description } = req.body;
  //         const {img, video} = req.files
  //         const fileNameImg = uuid.v4() + ".jpg";
  //         const fileNameVideo = uuid.v4() + '.mp4';
  //         img.mv(path.resolve(__dirname, "..", "files", "images", fileNameImg))
  //         video.mv(path.resolve(__dirname, "..", "files", "videos", (fileNameVideo)))
  //         const pathConvertVideo = path.resolve(__dirname, "..", "files", "videos", fileNameVideo)
  //         await ffmpeg(pathConvertVideo)
  //         .size('1280x720').audioBitrate(96).videoBitrate(800).save(path.resolve(__dirname, "..", "files", "ConvertedVideo", ('720' + fileNameVideo)))
  //         await ffmpeg(pathConvertVideo)
  //         .size('854x480').audioBitrate(96).videoBitrate(500).save(path.resolve(__dirname, "..", "files", "ConvertedVideo", ('480' + fileNameVideo)))
  //         await ffmpeg(pathConvertVideo)
  //         .size('640x360').audioBitrate(96).videoBitrate(500).save(path.resolve(__dirname, "..", "files", "ConvertedVideo", ('360' + fileNameVideo)))
  //         // .size('854x480').audioBitrate(96).videoBitrate(500).save(path.resolve(__dirname, "..", "files", "ConvertedVideo", ('480' + fileNameVideo)))
  //         // .size('640x360').audioBitrate(96).videoBitrate(300).save(path.resolve(__dirname, "..", "files", "ConvertedVideo", ('360' + fileNameVideo)))
  //         const result = await Course.create({
  //             name,
  //             description,
  //             video:fileNameVideo,
  //             img:fileNameImg,
  //         })
  //     } catch (error) {
  //         console.log(error);
  //     }

  //     // ffmpeg(pathConvertVideo).size('640x360').save(path.resolve(__dirname, "..", "files", "videos", (fileNameVideo + '360.mp4')))
  //     // console.log(path.resolve(__dirname, "..", "files", "videos", 'fileNameVideo'));
  // }

  async list(req, res, next) {
    const { id, videoId } = req.query;
    if (id) {
      const course = await Course.findOne({ where: { id: id }, include:{model:Video, as:'video'} });
      return res.json(course);
    } 
    if (videoId){
        const video = await Video.findOne({where:{id:videoId}, include:{model: Course, as: 'course'}})
        const nextVideoId = (await Video.findOne({where:{courseId:video.course.id, number: video.number + 1}}))?.id
        const teacher = await User.findOne({where:{id:video.course.userId}})
        return res.json({video, nextVideoId, teacher});
    }
  }

  // async remove(req, res, next){ 
  //     const {id} = req.query
  //     const course = await Course.findOne({where:{id:id}})
  //     const courseImg = course.img
  //     const courseVideo = course.video
  //     fs.unlink(path.resolve(__dirname, "..", "files", "images", courseImg), (err) => {
  //         if (err) throw err;

  //         console.log('Deleted');
  //       });
  //     fs.unlink(path.resolve(__dirname, "..", "files", "videos", courseVideo), (err) => {
  //         if (err) throw err;

  //         console.log('Deleted');
  //       });
  //     fs.unlink(path.resolve(__dirname, "..", "files", "convertedVideo", '360' + courseVideo), (err) => {
  //         if (err) throw err;

  //         console.log('Deleted');
  //       });
  //     fs.unlink(path.resolve(__dirname, "..", "files", "convertedVideo", '480' + courseVideo), (err) => {
  //         if (err) throw err;

  //         console.log('Deleted');
  //       });
  //     fs.unlink(path.resolve(__dirname, "..", "files", "convertedVideo", '720' + courseVideo), (err) => {
  //         if (err) throw err;

  //         console.log('Deleted');
  //       });
  //       await Course.destroy({where:{id:id}})
  //     return res.json(course)
  // } 
}

module.exports = new StreamControllers();
