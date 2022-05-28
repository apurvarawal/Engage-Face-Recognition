


var video = document.getElementById("video");
function startVideo(){
    if(navigator.mediaDevices.getUserMedia){
        navigator.mediaDevices.getUserMedia({ video:true })
        .then((stream)=>{
            video.srcObject = stream;
        })
        .catch((error) => {
            console.log("video element not accessible")
        })
    }
}
startVideo();

window.onload = async function(){
    var elem1 = document.createElement("img");
    elem1.style.width = '320px'
    elem1.style.borderRadius = '50%'
    elem1.style.height = '320px'
    document.getElementById("profileBox").appendChild(elem1);
    let imgUrl = await fetch('/getImageUrl');
    jsonUrl = await imgUrl.json();
    imgUrl = jsonUrl.url;
    elem1.src = imgUrl;
}

function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    var ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], {type: mimeString});
    return blob;

}    

async function confirm () {
    var canvas = document.createElement("canvas");
    canvas.width = video.width;
    canvas.height = video.height;
    canvas.getContext('2d')
        .drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL();
    // console.log(dataUrl);
    const {url} = await fetch('/s3url').then(res => res.json());

    await fetch(url, {
        method: "PUT",
        headers: {
        "Content-Type": "multipart/form-data"
        },
        body: dataURItoBlob(dataUrl)
    })

    const imageUrl = url.split('?')[0]
    console.log(imageUrl)
    var elem2 = document.createElement("img");
    document.getElementById("videoBox").appendChild(elem2);
    elem2.src = imageUrl;
    elem2.style.width = '320px'
    elem2.style.height = '320px'
    elem2.style.borderRadius = '50%'
    
    
    let faceid1res = await fetch('/faceid1', {
        method: 'POST',
        body: JSON.stringify({videoUrl: imageUrl}),
        headers: {'content-type': 'application/json'}
    })
    const {faceId} = await faceid1res.json();
    
    console.log(faceId)
    var fm = document.getElementById("failureMsg")
    var sm = document.getElementById("successMsg")
    if(faceId[0]){
        let results = await fetch('/confirm-attendance',{
            method: 'POST',
            body: JSON.stringify({videoUrl: imageUrl, faceId: faceId[0]}),
            headers: {'content-type': 'application/json'}
        }).catch(err => {console.log(err)})
        results = await results.json();
        const isIdentical = results.isSame;
        if(!isIdentical){
            console.log(isIdentical);
            fm.style.display = "flex";
            alert("Error, Please try again")
            setTimeout(() => {
                location.reload();
            }, 500);

        }else{
            sm.style.display = "flex";
            alert("Attendance Successfully confirmed")
            var currentdate = new Date(); 
                var attendenceConfAt = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
            const isConfirmed = await fetch('/attendancedata', {
                method: 'POST',
                body: JSON.stringify({ attendenceConfAt }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then((res) => {
                const jData = res.json();
                console.log(jData)
            })
            setTimeout(() => {
                location.assign('https://teams.microsoft.com/l/meetup-join/19%3AXX9O8rIPow7hILreb_C26PZbBbtH8ZIgNiIel7tCu6E1%40thread.tacv2/1653587977291?context=%7B%22Tid%22%3A%22ff65bb2a-d8a6-4a70-bfb2-79b1a8746349%22%2C%22Oid%22%3A%22f090a757-16e9-4b47-b164-8fbda6f4ac92%22%7D');
            }, 500);
        }
    }else{
        fm.style.display = "flex";
        alert("Error!! Please try again")
        setTimeout(() => {
            location.reload();
        }, 500);
    }
}

function myFunction() {
    var x = document.getElementById("myDIV");
    if (x.style.display === "none") {
        x.style.display = "inline-block";
    } else {
        x.style.display = "none";
    }
}

