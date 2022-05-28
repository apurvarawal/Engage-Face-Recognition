const imageForm = document.querySelector("#imageForm")
const imageInput = document.querySelector("#imageInput")


imageInput.addEventListener("change", function(){
  var profileImage = document.getElementById("profileImage");
  profileImage.style.width = '160px';
  profileImage.style.height = '160px';
  profileImage.style.borderRadius = '50%';
  const fileInput = imageInput.files[0];
  profileImage.src = window.URL.createObjectURL(imageInput.files[0]);
  // console.log(fileInput);
  // alert('yes')
})


imageForm.addEventListener("submit", async event => {
  event.preventDefault()
  const file = imageInput.files[0]
  // console.log(file);

  // get secure url from our server
  const { url } = await fetch("/s3Url").then(res => res.json())
  // console.log(url)

  // post the image direclty to the s3 bucket
  await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "multipart/form-data"
    },
    body: file
  })

  const imageUrl = url.split('?')[0]
  // console.log(imageUrl)

  const data = await fetch('/uploadURL', {
    method: 'POST', 
    body: JSON.stringify({imageUrl}),
    headers: {'content-type':'application/json'}
  }).catch((err) => {console.log(err)});
  const jsonData = await data.json();
  if(jsonData.isValid){
    alert("Successfully uploaded profile picture");
    location.assign('/profile')
  }else{
    console.log(data.error)
    alert("Error! Please Upload again")
    location.reload();
    
  }
  // post requst to my server to store any extra data
  

})