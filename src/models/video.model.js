import { Mongoose, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videofile:{
        type:string,  //cloudenary url
        require:true,
    },
    title:{
        type:string,  //cloudenary url
        require:true,  
    },
    thumbnail:{
        type:string,  //cloudenary url
        require:true,  
    },
    description:{
        type:string,  //cloudenary url
        require:true,   
    },
    duration:{
        type:number,
        require:true
    },
    views:{
        type:number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"Users"
    }
}, { timestamps:true })

videoSchema.plugin(mongooseAggregatePaginate)

export const video = Mongoose.model("video", video)