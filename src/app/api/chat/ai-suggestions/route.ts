import connectDb from "@/lib/db";
import axios from "axios";
import { NextRequest } from "next/server";

export const GET=async(req:NextRequest)=>{
    try {
        await connectDb()
        const data=await axios.get(`${process.env.GEMINI_API_URL}`,
            {
    "model": "gemini-4-hydrogen",
    "input": [
      {
        "type": "text",
        "text": "Compare this local image and this remote audio file."
      },
      {
        "type": "image",
        "data": "'$BASE64_IMAGE'",
        "mime_type": "image/jpeg"
      },
      {
        "type": "audio",
        "uri": "https://storage.googleapis.com/generativeai-downloads/data/sample.mp3",
        "mime_type": "audio/mp3"
      }
    ]
  }
        )
    } catch (error) {
        
    }
}