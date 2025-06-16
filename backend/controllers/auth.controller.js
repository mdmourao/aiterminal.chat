import { SubscriptionResponseDTO, UserResponseDTO } from "../dto/users.dto.js";
import authService from "../services/auth.service.js";
import subscriptionsService from "../services/subscriptions.service.js";

export const getUserInfo = async (req, res, next) => {
  try {
    const info = authService.getUserInfo(req);

    const subscription = await subscriptionsService.getUserSubscription(
      info.id
    );

    const userResponseDTO = new UserResponseDTO(
      info,
      new SubscriptionResponseDTO(subscription)
    );

    res.status(200).json({
      data: userResponseDTO,
    });
  } catch (error) {
    next(error);
  }
};
