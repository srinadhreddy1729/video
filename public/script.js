const socket = io.connect('/');
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

const user = prompt("Enter your name");

const peer = new Peer(undefined, {
  host: '/',
  port: 3030,
  path: '/peerjs',
  secure: true // Use this if your site uses HTTPS
});

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

peer.on("open", (id) => {
  const ROOM_ID = window.location.pathname.split("/")[1];
  socket.emit("join-room", ROOM_ID, id, user);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};

document.getElementById("muteButton").addEventListener("click", () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    muteButton.classList.toggle("background_red");
    muteButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    muteButton.classList.toggle("background_red");
    muteButton.innerHTML = '<i class="fas fa-microphone"></i>';
  }
});

document.getElementById("stopVideo").addEventListener("click", () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    stopVideo.classList.toggle("background_red");
    stopVideo.innerHTML = '<i class="fas fa-video-slash"></i>';
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    stopVideo.classList.toggle("background_red");
    stopVideo.innerHTML = '<i class="fas fa-video"></i>';
  }
});

document.getElementById("inviteButton").addEventListener("click", () => {
  prompt("Copy this link and send it to people you want to have a video call with", window.location.href);
});

document.getElementById("disconnect").addEventListener("click", () => {
  peer.destroy();
  const myVideoElement = document.querySelector("video");
  if (myVideoElement) {
    myVideoElement.remove();
  }
  socket.emit("disconnect");
  window.location.href = "https://google.com";
});
