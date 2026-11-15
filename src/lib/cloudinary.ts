import { v2 as cloudinary } from "cloudinary";

//cloudinary image ko apne paas upload krlega aur hame url dega jisse hum apne backend mein store krayenge

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}); //itna krte hi hmara cloudinary ka configuration poora hogaya hai

//ab hum ek cloudinary ka function banayenge joh ki ek image lega usse apne paas store krayega aur hume return mein uss image ka url dega

//ye function basically ek promise return krega aur woh jab complete hoga toh hame string milega toh iss function ka return type ye hoga Promise<string>
const uploadOnCloudinary = async (file: Blob): Promise<string | null> => {
  if (!file) {
    return null;
  }

  //Blob hamare ek file-like Object hota hai joh ki immutable hota hai

  //joh ye file hamare paas arhi hai frontend se isse hum as it is cloudinary mein store nahi krte
  //kyunki joh ye file hoti hai woh Blob type ki hai yani binary large object yaani file mein binary data aata hai aur hame iss data ko convert krna hoga node js ke buffer mein kyunki node js buffer smjhta hai binary data nhi

  //ab sbse pehle hame file data ko ek Array buffer mein convert krna hoga
  try {
    const arrayBuffer = await file.arrayBuffer(); //Array buffer ek type ka container hota hai joh ki blob ka binary data apne paas rakh leta hai

    //ab node js array buffer bhi nahi smjhta yaai hame isse bhi buffer mein convert krna hoga

    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      const upload_stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
        },
        (error, result) => {
          //ab promise ke outcome mein ya toh error aaskta hai ya result
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            //agr result aaya toh resolve krdo promise with result
            resolve(result?.secure_url ?? null); //result ke andr hi secure url hoga joh ki hame cloudinary de raha hai image upload krne ke baad
          }
        },
      );

      //iss line ke through ham apne buffer ko cloudinary pe bhejenge
      upload_stream.end(buffer);
    });
  } catch (error) {
    console.error("Cloudinary error:", error);
    return null; //ye nhi likha tha toh error mil rha uper return type mein kyunki agr void return type nhi hai toh kuch na kuch toh return hona chahiye , toh hamne try mein toh return kiya tha but catch block mein return rehgaya tha isliye hi error arha tha bas
  }
};

export default uploadOnCloudinary
//iske baad hum edit api route banaye ki home pe joh save button hai uspe click krke image aur name ko database mein save krpaaye
