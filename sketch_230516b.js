let poseNet
let pose
let squatSound
let squatImage
let squatImageTimer = 0
let squatting = false
let squatCount = 0
let confidence = 0.1
let lastSquatTime = 0
const minSquatInterval = 500

function preload() {
  squatSound = loadSound('squat-sound.mp3')
  squatImage = loadImage('squat-image.png')
}

function setup() {
  let width = 640
  let height = 480

  createCanvas(width, height)
  video = createCapture(VIDEO)
  video.size(width, height)
  video.hide()

  poseNet = ml5.poseNet(video, function () {
    console.log('PoseNet model loaded')
  })
  poseNet.on('pose', function (results) {
    if (results.length > 0) {
      pose = results[0].pose
    }
  })
}

function draw() {
  background(220)

  if (pose) {
    keyPoint()
  }

  fill(0)
  textSize(36)
  textAlign(LEFT, TOP)
  text('Squat Count: ' + squatCount, 10, 10)

  if (squatImageTimer > 0) {
    image(squatImage, width / 2 - 256, height / 2 - 256, 512, 512)
    squatImageTimer--
  }
}

function keyPoint() {
  image(video, 0, 0)

  let leftHip = pose.keypoints.find((k) => k.part === 'leftHip')
  let leftKnee = pose.keypoints.find((k) => k.part === 'leftKnee')
  let leftAnkle = pose.keypoints.find((k) => k.part === 'leftAnkle')

  if (
    leftHip.score > confidence &&
    leftKnee.score > confidence &&
    leftAnkle.score > confidence
  ) {
    let hipPos = createVector(leftHip.position.x, leftHip.position.y)
    let kneePos = createVector(leftKnee.position.x, leftKnee.position.y)
    let anklePos = createVector(leftAnkle.position.x, leftAnkle.position.y)

    let thigh = p5.Vector.sub(kneePos, hipPos)
    let calf = p5.Vector.sub(anklePos, kneePos)

    let kneeAngle = degrees(thigh.angleBetween(calf))

    if (kneeAngle > 50) {
      console.log(kneeAngle)
    }

    let currentTime = new Date().getTime()
    if (
      squatImageTimer <= 0 &&
      currentTime - lastSquatTime > minSquatInterval
    ) {
      if (kneeAngle > 50 && !squatting) {
        squatting = true
      } else if (kneeAngle > 100 && squatting) {
        squatting = false
        squatCount++
        squatSound.play()
        squatImageTimer = 30
        lastSquatTime = currentTime
      }
    }

    connectPoints(pose.nose, pose.leftEye)
    connectPoints(pose.leftEye, pose.leftEar)
    connectPoints(pose.nose, pose.rightEye)
    connectPoints(pose.rightEye, pose.rightEar)
    connectPoints(pose.leftShoulder, pose.rightShoulder)
    connectPoints(pose.leftShoulder, pose.leftElbow)
    connectPoints(pose.leftElbow, pose.leftWrist)
    connectPoints(pose.rightShoulder, pose.rightElbow)
    connectPoints(pose.rightElbow, pose.rightWrist)
    connectPoints(pose.leftShoulder, pose.leftHip)
    connectPoints(pose.rightShoulder, pose.rightHip)
    connectPoints(pose.leftHip, pose.rightHip)
    connectPoints(pose.leftHip, pose.leftKnee)
    connectPoints(pose.leftKnee, pose.leftAnkle)
    connectPoints(pose.rightHip, pose.rightKnee)
    connectPoints(pose.rightKnee, pose.rightAnkle)
  }
}

function connectPoints(point1, point2) {
  if (point1.confidence > confidence && point2.confidence > confidence) {
    strokeWeight(4)
    stroke(255, 0, 0, 200)
    line(point1.x, point1.y, point2.x, point2.y)
    noStroke()
    fill(255, 255, 255, 150)
    ellipse(point1.x, point1.y, 20, 20)
    ellipse(point2.x, point2.y, 20, 20)
  }
}
