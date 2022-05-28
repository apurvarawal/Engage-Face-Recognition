const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken');
const {Authenticate} = require('../middleware/authMiddleware')
const User = require('../models/User');
const {genURL} = require('../s3');
const { json } = require('express/lib/response');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require("dotenv").config();



// Fetching the azure id for identification of face and updating in the User database

const mskey = process.env.mskey;
const endpoint = "https://engage-fapi.cognitiveservices.azure.com/";
async function faceIdentify(url, id) {
     
    const params =  {
        "returnFaceId": "true",
        "returnFaceLandmarks": "false",
        "recognitionModel": "recognition_04",
        "returnRecognitionModel": "false",
        "detectionModel": "detection_03",
        "faceIdTimeToLive": "86400",
    }
    let response1 = await fetch('https://engage-fapi.cognitiveservices.azure.com/face/v1.0/detect?' + new URLSearchParams(params), {
        method: 'POST', 
        body: JSON.stringify({
            "url": url
        }),
        headers: {'content-type': 'application/json', 'Ocp-Apim-Subscription-Key': mskey}
    })
    if(response1.ok){
        var jsondata = await response1.json();
        // console.log(jsondata);
        if(jsondata[0]){
            const azureId = await jsondata[0].faceId;
            await User.updateOne({_id: id}, {profilePic: url, azureId: azureId});
            return true;
        }else{
            return false;
        }
    }else{
        console.log(res.status);
        return false;
    }
}

router.get('/profilepic', Authenticate, async (req, res) => {
    res.render('profilePic')
})

router.get('/s3url', Authenticate, async (req, res) => {
    const url = await genURL();
    res.send({url})
})
router.post('/uploadURL', Authenticate, async (req, res)=> {
    const token = req.cookies.jwt;
    const id = jwt.verify(token, 'SecretKey', (err, decoded) => {
        return decoded.id;
    })
    const url = req.body.imageUrl;
    const isValid = await faceIdentify(url, id);
    res.send({isValid});
})

module.exports = router;