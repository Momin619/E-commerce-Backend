const multer = require("multer");
const path = require("path");

// Generate random string for filenames
const randomString = (length) => {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// Filter only image types
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ["image/png", "image/jpeg", "image/jpg"];

  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only PNG, JPG, and JPEG are allowed."),
      false
    );
  }
};

// Storage configuration for images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // all images go to 'uploads' folder
  },
  filename: (req, file, cb) => {
    const random = randomString(5); // generate 5 random characters
    const originalName = path
      .parse(file.originalname)
      .name.replace(/\s+/g, "-");
    const ext = path.extname(file.originalname);
    cb(null, `${random}-${originalName}${ext}`);
  },
});

// Multer instance
const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
