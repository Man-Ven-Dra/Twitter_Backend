import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
	try {
		const userId = req.user._id;

		const notifications = await Notification.find({ to: userId }).populate({
			path: "from",
			select: "username profileImg",
		});

		await Notification.updateMany({ to: userId }, { read: true });

		res.status(200).json({
            success: true,
            message: "Notifications fetched successfully!",
            notifications
        });
	} catch (error) {
		res.status(500).json({ 
            success: false,
            message: "Failed to get Notifications!",
            error: error.message, 
        });
	}
};

export const deleteNotifications = async (req, res) => {
	try {
		const userId = req.user._id;

		await Notification.deleteMany({ to: userId });

		res.status(200).json({ 
            success: true,
            message: "Notifications deleted successfully" 
        });
	} catch (error) {
		res.status(500).json({ 
            success: false,
            message: "Failed to delete Notifications!",
            error: error.message, 
        });
	}
};