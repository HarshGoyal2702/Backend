import Disaster from "../models/disaster.model.js";
import io from "../index.js"
import axios from "axios";
import userModel from "../models/user.model.js";
import OpenWeatherAPI from "openweather-api-node";
import catchAsyncError from "../middlewares/catchAsyncError.js";
import { PythonShell } from "python-shell";
export const newDisaster = async (req, res, next) => {
    try {
        const { type, location, date, description, userId } = req.body;
        const satelliteImage = "";
        const aiImage = "";
        const newDisaster = new Disaster({ type, location, date, description, satelliteImage, aiImage, postedBy: userId });
        await newDisaster.save();
        const user = await userModel.findById(userId);
        await user.posts.push(newDisaster._id);
        await user.save();
        // creating alert for disaster
        io.emit('newDisaster', newDisaster);
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
    // const nasaKey = "8EAtwO2tLHXQV9UTBRoZQVoKGY4AolfI22vM7xJK"
    // const nasaUrl =
    //     "https://api.nasa.gov/planetary/earth/imagery"
    // try {
    //     const response = await axios.get(nasaUrl, {
    //         params: {
    //             lat: lat,
    //             lon: lon,
    //             api_key: nasaKey
    //         }
    //     })
    //     console.log(response.data)
    // } catch (error) {
    //     console.log(error)
    // }

    // let imageData = "";
    // try {
    //     const resp = await fetch(
    //         `https://api.limewire.com/api/image/generation`,
    //         {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'X-Api-Version': 'v1',
    //                 Accept: 'application/json',
    //                 Authorization: 'Bearer lmwr_sk_TTdrIOkIoE_RdtB8gFdax1SbA47bqlJHUUmhsPPHIn3dgkqh	'
    //             },
    //             body: JSON.stringify({
    //                 prompt: `show the image of location ${disasterLocation} according to the weather ${finalData} in english text`,
    //                 aspect_ratio: '1:1'
    //             })
    //         }
    //     );

    //     const data = await resp.json(); console.log(data)

    //     imageData = data?.data[0]?.asset_url
    // } catch (error) {
    //     console.log("ERROR", error)
    // }

    // pass to the AI/ML model
    // try {
    //     let pyshell = new PythonShell('backend/scripts/hello.py')
    //     pyshell.on('message', function (message) {
    //         // received a message sent from the Python script (a simple "print" statement)
    //         console.log(message);
    //     });
    // } catch (error) {
    //     console.log(error)
    // }

    // generate ai image from weather prediction given by AI/ML Model
    // let aiImage = "";
    // try {
    //     const resp = await fetch(
    //         `https://api.limewire.com/api/image/generation`,
    //         {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'X-Api-Version': 'v1',
    //                 Accept: 'application/json',
    //                 Authorization: 'Bearer lmwr_sk_TTdrIOkIoE_RdtB8gFdax1SbA47bqlJHUUmhsPPHIn3dgkqh	'
    //             },
    //             body: JSON.stringify({
    //                 prompt: `show the image of location ${disasterLocation} according to the weather reverse of ${finalData} in english texts`,
    //                 aspect_ratio: '1:1'
    //             })
    //         }
    //     );

    //     const data = await resp.json();
    //     console.log(data)
    //     aiImage = data?.data[0]?.asset_url
    // } catch (error) {
    //     console.log("ERROR", error)
    // }

    // if disaster prediction is more than 50% then produce alert using websocket and save in database
    // if disaster is occuring then return object which includes current satellite image , ai statement , ai image and description
    // if (true) {
    //     const disaster = await Disaster.create({
    //         disaster: "drought",
    //         location: location,
    //         latitude: lat,
    //         longitude: lon,
    //         description: "This is an drought",
    //         satelliteImage: {
    //             url: "satellite url",
    //         },
    //         aiImage: {
    //             url: "satellite url",
    //         },
    //         postedBy: "Prediction Model"
    //     })
    // }
    // else return message their is nothing about to worry
    // return res.status(200).json({
    //     success: true,
    //     message: "Nothing to worry"
    // })
    return res.status(200).json({
        success: true,
        data: finalData,
        imageData: "imageData",
        aiImage: "aiImage",
        message: "Disaster information updated successfully"
    })
});
