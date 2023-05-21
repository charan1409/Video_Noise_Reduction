const mongoose = require('mongoose');

const VideoData = new mongoose.Schema({
    job_id: {
        type: String,
    },
    input_video_url: {
        type: String,
    },
    output_video_url: {
        type: String,
    },
    status: {
        type: String,
        default: 'pending',
    }
});

module.exports = mongoose.model('Video_Data', VideoData);
