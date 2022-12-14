const ApiError = require("../error/ApiError");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");

const { Course, Video, User } = require("../models/models");

class StreamControllers {
  async stream(req, res, next) {
    try {
      const { id, q } = req.query;
      const video = await Video.findOne({ where: { id: id } });
      const videoName = `${q}${video.video}`;
      // Ensure there is a range given for the video
      const videoPath = path.resolve(
        __dirname,
        "..",
        "files",
        "ConvertedVideo",
        videoName
      );
      const options = {};

      let start;
      let end;
      const CHUNK_SIZE = 10 ** 6 / 10
      const range = req.headers.range;
      if (range) {
        const bytesPrefix = "bytes=";
        if (range.startsWith(bytesPrefix)) {
          const bytesRange = range.substring(bytesPrefix.length);
          const parts = bytesRange.split("-");
          // parts[1] = `${(+parts[0]) + CHUNK_SIZE}`;
          if (parts.length === 2) {
            const rangeStart = parts[0] && parts[0].trim();
            if (rangeStart && rangeStart.length > 0) {
              options.start = start = parseInt(rangeStart);
            }
            const rangeEnd = parts[1] && parts[1].trim();
            if (rangeEnd && rangeEnd.length > 0) {
              options.end = end = parseInt(rangeEnd);
            }
          }
        }
      }

      res.setHeader("content-type", "video/mp4");

      fs.stat(videoPath, (err, stat) => {
        if (err) {
          console.error(`File stat error for ${videoPath}.`);
          console.error(err);
          res.sendStatus(500);
          return;
        }

        let contentLength = stat.size;

        if (req.method === "HEAD") {
          res.statusCode = 200;
          res.setHeader("accept-ranges", "bytes");
          res.setHeader("content-length", contentLength);
          res.end();
        } else {
          let retrievedLength;
          if (start !== undefined && end !== undefined) {
            retrievedLength = end + 1 - start;
          } else if (start !== undefined) {
            retrievedLength = contentLength - start;
          } else if (end !== undefined) {
            retrievedLength = end + 1;
          } else {
            retrievedLength = contentLength;
          }

          res.statusCode = start !== undefined || end !== undefined ? 206 : 200;

          res.setHeader("content-length", retrievedLength);

          if (range !== undefined) {
            res.setHeader(
              "content-range",
              `bytes ${start || 0}-${end || contentLength - 1}/${contentLength}`
            );
            console.log(start);
            console.log(`bytes ${start || 0}-${end || contentLength - 1}/${contentLength}`);
            res.setHeader("accept-ranges", "bytes");
          }

          const fileStream = fs.createReadStream(videoPath, options);
          fileStream.on("error", (error) => {
            console.log(`Error reading file ${videoPath}.`);
            console.log(error);
            res.sendStatus(500);
          });

          fileStream.pipe(res);
        }
      });
    } catch (error) {
      return res.json(error);
    }
  }

  async list(req, res, next) {
    const { id, videoId } = req.query;
    if (id) {
      const course = await Course.findOne({
        where: { id: id },
        include: { model: Video, as: "video" },
      });
      return res.json(course);
    }
    if (videoId) {
      const video = await Video.findOne({
        where: { id: videoId },
        include: { model: Course, as: "course" },
      });
      const nextVideoId = (
        await Video.findOne({
          where: { courseId: video.course.id, number: video.number + 1 },
        })
      )?.id;
      const teacher = await User.findOne({
        where: { id: video.course.userId },
      });
      return res.json({ video, nextVideoId, teacher });
    }
  }
}

module.exports = new StreamControllers();
