import mongoose from "mongoose"
const disasterSchema = new mongoose.Schema({
    disaster: {
        type: String,
        require: true,
    },
    location: {
        type: String,
        require: true,
    },
    longitude: {
        type: Number,
        require: true
    },
    latitude: {
        type: Number,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    satelliteImage: {
        type: String,
        require: true

    },
    aiImage: {
        type: String,
        require: true

    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId || String,
        ref: 'User'
    }
}, {
    timestamps: true
})
export default mongoose.model("Disaster", disasterSchema)