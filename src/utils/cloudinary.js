import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

// unlinking means delete

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //Uploading file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })
        // file uploading Succesfull 
        // console.log("File is uploaded on cloudinary", response.url);
        // unlinking the file Saved in temp directory
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        console.log("Error Occur in Cloudinary:", error)
        //remove the locally stored temp file as upload failed
        fs.unlinkSync(localFilePath)
        return null
    }
}

export { uploadOnCloudinary }