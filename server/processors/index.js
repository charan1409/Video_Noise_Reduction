const Queue = require('bull');
const videoProcessor = require('./videoProcessor');

const videoProcessorQueue = new Queue('video-processing', 'redis://127.0.0.1:6379');
videoProcessorQueue.process(videoProcessor);

module.exports = videoProcessorQueue;
