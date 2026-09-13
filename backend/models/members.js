import mongoose, { Schema } from "mongoose";

const member=new Schema({
    roomId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Room",
        required:true
    },
    name:{
        type:String,
        required:true
    },
    joinedDate:{
        type:Date,
        default:Date.now
    }

},{timestamp:true})

export default mongoose.model('Member',member);