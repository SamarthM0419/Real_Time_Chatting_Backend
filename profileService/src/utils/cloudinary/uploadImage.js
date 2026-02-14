const cloudinary = require("../../config/cloudinaryConfig");

console.log("Cloudinary in uploadImage.js:", {
  type: typeof cloudinary,
  hasUploader: !!cloudinary.uploader,
  uploaderType: typeof cloudinary.uploader,
});

const validateImageFormat = (base64String) => {
  if (!base64String || typeof base64String !== "string") {
    return false;
  }

  const validFormats = [
    "data:image/jpeg;base64",
    "data:image/jpg;base64",
    "data:image/png;base64",
  ];
  return validFormats.some((format) => base64String.startsWith(format));
};

const validateImageUrl = (url) => {
  if (!url || typeof url !== "string") {
    return false;
  }

  const validExtensions = [".jpg", ".jpeg", ".png"];
  const urlLower = url.toLowerCase();

  return (
    (url.startsWith("http://") || url.startsWith("https://")) &&
    validExtensions.some((ext) => urlLower.includes(ext))
  );
};

const uploadProfilePhoto = async (base64Image, userId) => {
  try {
    if (!validateImageFormat(base64Image)) {
      throw new Error(
        "Invalid image format. Only JPEG, JPG, and PNG are allowed",
      );
    }

    const uploadResult = await cloudinary.uploader.upload(base64Image, {
      folder: "profile_photos",
      public_id: `user_${userId}_${Date.now()}`,
      transformation: [
        {
          width: 413,
          height: 531,
          crop: "fill",
          gravity: "auto",
        },
      ],
      format: "jpg",
      quality: "auto:good",
    });

    return uploadResult.secure_url;
  } catch (err) {
    throw new Error(`Cloudinary upload failed: ${err.message}`);
  }
};

const uploadProfilePhotoFromUrl = async (imageUrl, userId) => {
  try {
    if (!validateImageUrl(imageUrl)) {
      throw new Error(
        "Invalid image URL. Only JPEG, JPG, and PNG URLs are allowed",
      );
    }

    const uploadResult = await cloudinary.uploader.upload(imageUrl, {
      folder: "profile_photos",
      public_id: `user_${userId}_${Date.now()}`,
      transformation: [
        {
          width: 413,
          height: 531,
          crop: "fill",
          gravity: "auto",
        },
      ],
      format: "jpg",
      quality: "auto:good",
    });

    return uploadResult.secure_url;
  } catch (err) {
    throw new Error(`Cloudinary upload from URL failed: ${err.message}`);
  }
};

module.exports = {
  uploadProfilePhoto,
  uploadProfilePhotoFromUrl,
  validateImageFormat,
  validateImageUrl,
};