import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Notification } from "../models/notification.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.aggregate([
        {
            $match:{
                receiver:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"sender",
                foreignField:"_id",
                as:"sender",
                pipeline:[
                    {
                        $project:{
                            fullname:1,
                            username:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                sender:{
                    $first:"$sender"
                }
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $project:{
                _id:1,
                type:1,
                sender:1,
                voice:1,
                comment:1,
                isRead:1,
                createdAt:1
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200,notifications,"Notifications fetched successfully"))
});

const markAsRead = asyncHandler(async (req, res) => {
    const {notificationId} = req.params
    if(!isValidObjectId(notificationId)){
        throw new ApiError(400,"Invalid NotificationId")
    }

    const notification = await Notification.findById(notificationId)
    if(!notification){
        throw new ApiError(404,"Notification not found")
    }

    if(notification.receiver.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to update this notification")
    }

    const updatedNotification = await Notification.findByIdAndUpdate(notificationId,
        {
            $set:{
                isRead:true
            }
        },
        {
            new:true
        }
    )

    return res.status(200).json(new ApiResponse(200,updatedNotification,"Notification marked as read"))
});

const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
         {
            receiver:req.user._id,
            isRead:false
        },
        {
            $set:{
                isRead:true
            }
        }
    )

    return res.status(200).json(new ApiResponse(200,{},  "All notifications marked as read"))
});

const deleteNotification = asyncHandler(async (req, res) => {
    const {notificationId} = req.params
    if(!isValidObjectId(notificationId)){
        throw new ApiError(400,"Invalid NotificationId")
    }

    const notification = await Notification.findById(notificationId)
    if(!notification){
        throw new ApiError(404,"Notification not found")
    }

    if(notification.receiver.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not authorized to delete this notification")
    }

    await Notification.findByIdAndDelete(notificationId)
    return res.status(200).json(new ApiResponse(200,{},"Notification deleted successfully"))
});

export {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};