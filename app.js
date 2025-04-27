let imgElement = null;
let mat = null;

// Function to load image into the canvas
document.getElementById("uploadImage").addEventListener("change", function(e) {
  let reader = new FileReader();
  reader.onload = function(event) {
    imgElement = new Image();
    imgElement.src = event.target.result;
    imgElement.onload = function() {
      // Create OpenCV Mat from the image
      mat = cv.imread(imgElement);
      cv.imshow('originalCanvas', mat);  // Display original image
    };
  };
  reader.readAsDataURL(e.target.files[0]);
});

// Apply selected transformation
function applyTransformation() {
  if (!mat) {
    alert('Please upload an image first!');
    return;
  }
  
  let transformType = document.getElementById("transformType").value;
  let param = parseFloat(document.getElementById("parameter").value);
  let resultMat = mat.clone();  // Clone original image to avoid modifying it directly

  switch (transformType) {
    case 'log':
      logTransform(resultMat);
      break;
    case 'gamma':
      gammaTransform(resultMat, param);
      break;
    case 'contrast':
      contrastStretching(resultMat, param);
      break;
    case 'threshold':
      thresholding(resultMat, param);
      break;
    case 'histogram':
      histogramEqualization(resultMat);
      break;
    default:
      alert('Invalid transformation!');
      return;
  }

  cv.imshow('outputCanvas', resultMat);  // Display transformed image
  resultMat.delete();  // Clean up
}

// Logarithmic transformation
function logTransform(mat) {
  cv.log(mat, mat);
}

// Power-law (gamma) transformation
function gammaTransform(mat, gamma) {
  let lut = new cv.Mat(1, 256, cv.CV_8U);
  for (let i = 0; i < 256; i++) {
    lut.data[i] = Math.pow(i / 255, gamma) * 255;
  }
  cv.LUT(mat, lut, mat);  // Apply the gamma correction
  lut.delete();
}

// Contrast stretching
function contrastStretching(mat, minMax) {
  let min = 0, max = 255;
  let [low, high] = minMax.split(',').map(Number);
  let result = mat.clone();
  cv.inRange(mat, new cv.Mat(mat.rows, mat.cols, mat.type(), [low]), new cv.Mat(mat.rows, mat.cols, mat.type(), [high]), result);
  cv.bitwise_and(mat, result, mat);  // Apply contrast stretching
  result.delete();
}

// Thresholding
function thresholding(mat, thresholdValue) {
  cv.threshold(mat, mat, thresholdValue, 255, cv.THRESH_BINARY);
}

// Histogram Equalization
function histogramEqualization(mat) {
  cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY);
  cv.equalizeHist(mat, mat);
}
