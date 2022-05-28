const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken');
const {Authenticate} = require('../middleware/authMiddleware');
const Attendance = require('../models/attendance-model');
const User = require('../models/User');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require("dotenv").config();


const mskey = process.env.mskey;
async function verifyAttendance(faceid1, faceid2){
    const params = {
        'isIdentical': 'true',
        'confidence': 'true'
    };


    let response1 = await fetch('https://engage-fapi.cognitiveservices.azure.com/face/v1.0/verify?' + new URLSearchParams(params), {
        method: 'POST', 
        body: JSON.stringify({
            "faceId1": faceid1,
            "faceId2": faceid2
        }),
        headers: {'content-type': 'application/json', 'Ocp-Apim-Subscription-Key': mskey}
    })
    if(response1.ok){
        var jsondata = await response1.json();
        return await jsondata.isIdentical;
    }else{
        // console.log(res.status);
        return false;
    }

}



router.post('/confirm-attendance', Authenticate, async (req, res) => {
    const {videoUrl, faceId} = req.body;
    const faceid1 = faceId;
    const token = req.cookies.jwt;
    const id = jwt.verify(token, 'SecretKey', (err, decoded) => {
        return decoded.id;
    })
    const user = await User.findById(id);
    const faceid2 = user.azureId;
    const isSame = await verifyAttendance(faceid1, faceid2);
    console.log(isSame);
    res.send({isSame});
})

router.get('/getImageUrl', async (req, res) => {
    const token = req.cookies.jwt;
    const id = jwt.verify(token, 'SecretKey', (err, decoded) => {
        return decoded.id;
    })
    const user = await User.findById(id);
    const url = user.profilePic;
    // console.log(url);
    res.send({url});
})

router.post('/attendancedata', async (req, res) => {
    const token = req.cookies.jwt;
    const id = jwt.verify(token, 'SecretKey', (err, decoded) => {
        return decoded.id;
    })
    const user = await User.findById(id);
    const attendenceConfAt = req.body.attendenceConfAt;
    try{
        const attendance = await Attendance.create({ email: user.email, attendenceConfAt})
        res.status(201).json({ attendance })
    }
    catch(err){
        const errors = handleErrors(err);
        res.status(400).json({errors})
    }
})

router.post('/faceid1', async (req, res) => {
    const videoUrl = req.body.videoUrl;
    const qs = {
        "returnFaceId": "true",
        "returnFaceLandmarks": "false",
        "recognitionModel": "recognition_04",
        "returnRecognitionModel": "false",
        "detectionModel": "detection_03",
        "faceIdTimeToLive": "86400",
    }
    const data = await fetch('https://engage-fapi.cognitiveservices.azure.com/face/v1.0/detect?' + new URLSearchParams(qs), {
        method: 'POST', 
        body: JSON.stringify({url: videoUrl}),
        headers: {'content-type': 'application/json', 'Ocp-Apim-Subscription-Key': mskey}
    })
    const jsonData = await data.json()
    const faceId = await jsonData.map(x => x.faceId)
    res.send({faceId});
})


module.exports = router;
