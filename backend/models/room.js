import mongoose, { Schema } from 'mongoose';

const room=new Schema({
    roomCode:{
        type:String,
        required:true,
        unique:true
    },
    name:{
        type:String,
        required:true,
    },
    createdBy:{
        type:String,
        required:true,
    },
    status:{
        type:Boolean,
        default:true
    }
    
},{timestamp:true})

export default mongoose.model('Room', room);

