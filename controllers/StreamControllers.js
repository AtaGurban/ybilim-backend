const ApiError = require("../error/ApiError");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");


const {
    Course
} = require("../models/models");


class StreamControllers {
    async stream(req, res, next) {
        const { q } = req.query
        // Ensure there is a range given for the video
        const range = req.headers.range;
        if (!range) {
            res.status(400).send("Requires Range header");
        }
        const videoPath = q === 1 ? "output2.mp4" : 'gg.mp4';
        const videoSize = fs.statSync(videoPath).size;
        const CHUNK_SIZE = (10 ** 6) / 2; // 1MB
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
    }

    async add(req, res, next) {
        // const { name, description } = req.body;
        const {img, video} = req.files
        const fileNameImg = uuid.v4() + ".jpg";
        const fileNameVideo = uuid.v4();
        img.mv(path.resolve(__dirname, "..", "files", "images", fileNameImg))
        video.mv(path.resolve(__dirname, "..", "files", "videos", (fileNameVideo + '720.mp4')))
        const pathConvertVideo = path.resolve(__dirname, "..", "files", "videos", fileNameVideo)
        ffmpeg(pathConvertVideo).size('854x480').save(path.resolve(__dirname, "..", "files", "videos", (fileNameVideo + '480.mp4')))
        ffmpeg(pathConvertVideo).size('640x360').save(path.resolve(__dirname, "..", "files", "videos", (fileNameVideo + '360.mp4')))
        // console.log(path.resolve(__dirname, "..", "files", "videos", 'fileNameVideo'));
    }



}


module.exports = new StreamControllers(); 