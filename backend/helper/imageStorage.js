const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// compress image
const compressImage = async (buffer, originalname) => {
  try {
    const compressedImagePath = path.join(
      __dirname,
      "../uploads/",
      Date.now() + "-" + originalname
    );

    await sharp(buffer)
      .toFormat("jpeg", { mozjpeg: true }) // Use mozjpeg for better JPEG compression
      .toFile(compressedImagePath);

    return compressedImagePath;
  } catch (error) {
    throw new Error("Image compression failed: " + error.message);
  }
};

const deleteImage = (image) => {
  const imagePath = path.join(__dirname, "..", image);
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error(`Failed to delete image file: ${err.message}`);
    } else {
      console.log(`Image file ${imagePath} deleted successfully.`);
    }
  });
};

module.exports = { compressImage, deleteImage };
