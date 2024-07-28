import Disaster from "../models/disaster.model.js";
import io from "../index.js"
import axios from "axios";
import userModel from "../models/user.model.js";
import OpenWeatherAPI from "openweather-api-node";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import { PythonShell } from "python-shell";
export const newDisaster = async (req, res, next) => {
    try {
        // const { type, location, date, description, userId } = req.body;
        const satelliteImage = "";
        const aiImage = "";
        const newDisaster = new Disaster({ satelliteImage, aiImage});
        await newDisaster.save();
        // const user = await userModel.findById(userId);
        // await user.posts.push(newDisaster._id);
        // await user.save();
        // creating alert for disaster
        // io.emit('newDisaster', newDisaster);
        res.status(201).json({
            success: true,
            data: newDisaster
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}
export const updateDisaster = catchAsyncError(async (req, res, next) => {

    const disasterData = req.body;
    const disaster = await Disaster.findById(req.params.id);
    if (disaster) {
        disasterData._id = disaster._id;
        disaster = disasterData
        await disaster.save();
    }
    return res.status(200).json({
        success: true,
        message: "Disaster information updated successfully"
    })
});
export const allDisasters = async (req, res, next) => {
    try {
        const disasters = await Disaster.find();
        return res.status(200).json({
            success: true,
            data: disasters
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error
        })
    }
}
export const disasterAnalyse = catchAsyncError(async (req, res, next) => {
    const disasterLocation = req.params.id;
    let weather = new OpenWeatherAPI({
        key: process.env.OPEN_WEATHER_API_KEY,
        locationName: `${disasterLocation}`,
        units: "imperial"
    })
    let finalData = {};
    await weather.getCurrent().then((data) => {
        finalData = data;
    })
    const lat = finalData.lat;
    const lon = finalData.lon;
    const openWeatherImage = await fetch(`http://maps.openweathermap.org/maps/2.0/weather/TA2/{z}/{x}/{y}?date=1552861800&opacity=0.9&fill_bound=true&appid=${process.env.OPEN_WEATHER_API_KEY}`)
    console.log(openWeatherImage)
    // fetch the live satellite images 
    let imageData = "";
    try {
        const resp = await fetch(
            `https://api.limewire.com/api/image/generation`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Version': 'v1',
                    Accept: 'application/json',
                    Authorization: 'Bearer lmwr_sk_TTdrIOkIoE_RdtB8gFdax1SbA47bqlJHUUmhsPPHIn3dgkqh	'
                },
                body: JSON.stringify({
                    prompt: `show the image of location ${disasterLocation} according to the weather ${finalData} in english text`,
                    aspect_ratio: '1:1'
                })
            }
        );
        const data = await resp.json(); console.log(data)
        imageData = data?.data[0]?.asset_url
    } catch (error) {
        console.log("ERROR", error)
    }
    // pass to the AI/ML model
    const modelDescription = "";
    try {
        let pyshell = new PythonShell('backend/scripts/main.py')
        pyshell.on('message', function (message) {
            // received a message sent from the Python script (a simple "print" statement)
            modelDescription = message;
        });
    } catch (error) {
        console.log(error)
    }

    // generate ai image from weather prediction given by AI/ML Model
    let aiImage = "";
    try {
        const resp = await fetch(
            `https://api.limewire.com/api/image/generation`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Version': 'v1',
                    Accept: 'application/json',
                    Authorization: 'Bearer lmwr_sk_TTdrIOkIoE_RdtB8gFdax1SbA47bqlJHUUmhsPPHIn3dgkqh	'
                },
                body: JSON.stringify({
                    prompt: `show the image of location ${disasterLocation} according to the weather reverse of ${finalData} in english texts`,
                    aspect_ratio: '1:1'
                })
            }
        );
        const data = await resp.json();
        aiImage = data?.data[0]?.asset_url
    } catch (error) {
        console.log("ERROR", error)
    }

    // io.emit('notification', (socket) => {
    //     socket.emit('notification', {
    //         message: `AI/ML Model Prediction: ${modelDescription} \n\n AI Generated Image
    //         ${aiImage} \n\n Weather Prediction: ${finalData} \n\n Disaster Location
    //         ${disasterLocation} \n\n Disaster Image: ${imageData}`
    //     })
    // })
    // const disaster = await Disaster.create({
    //     disaster: modelDescription,
    //     location: location,
    //     latitude: lat,
    //     longitude: lon,
    //     satelliteImage: {
    //         url: "imageData",
    //     },
    //     aiImage: {
    //         url: "aiImage",
    //     },
    //     postedBy: "Prediction Model"
    // })
    return res.status(200).json({
        success: true,
        // data: disaster,
        weather: finalData,
    })

});
