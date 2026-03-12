import { NextFunction, Request, Response } from "express";
import { LoginInputModel } from "../router-types/login-input-model";
import { authService } from "../../service-layer(BLL)/auth-service";
import { CustomResult } from "../../common/result-type/result-type";
import { token } from "../../adapters/verification/token-type";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import {
    RequestWithBody,
    RequestWithUserId,
} from "../request-types/request-types";
import { UserIdType } from "../router-types/user-id-type";
import { dataQueryRepository } from "../../repository-layers/query-repository-layer/query-repository";
import { AccessTokenModel } from "../../adapters/verification/auth-access-token-model";
import { AuthLoginInputModel } from "../router-types/auth-login-input-model";
import { RegistrationUserInputModel } from "../router-types/auth-registration-input-model";
import { RegistrationConfirmationInput } from "../router-types/auth-registration-confirmation-input-model";
import { ResentRegistrationConfirmationInput } from "../router-types/auth-resent-registration-confirmation-input-model";
import { RotationPairToken } from "../../adapters/verification/auth-token-rotation-pair";

export const attemptToLogin = async (
    req: RequestWithBody<AuthLoginInputModel>,
    res: Response,
) => {
    const { loginOrEmail, password } = req.body;
    const loginResult: CustomResult<RotationPairToken> =
        await authService.loginUser(loginOrEmail, password);

    if (!loginResult.data) {
        console.error(
            "Error description: ",
            loginResult?.statusDescription,
            JSON.stringify(loginResult.errorsMessages),
        );

        return res
            .status(loginResult.statusCode)
            .send({ errorsMessages: loginResult.errorsMessages });
    }

    const { accessToken, refreshToken, relatedUserId} = loginResult.data;

    // !!!! здесь занесение в черный список пары {refreshToken, relatedUserId}

    res.cookie(refreshToken, refreshToken, { httpOnly: true, secure: true } );

    return res.status(HttpStatus.Ok).send({accessToken: accessToken});
};

export const provideUserInfo = async (
    req: RequestWithUserId<UserIdType>,
    res: Response,
) => {
    if (!req.user) {
        console.error("req.user is not found");
        return res
            .status(HttpStatus.InternalServerError)
            .json({ errorsMessages: [{ field: "", message: "" }] });
    }

    const userId = req.user.userId;
    if (!userId) {
        console.error("userId inside req.user is undefined or null");
        return res
            .status(HttpStatus.InternalServerError)
            .json({ errorsMessages: [{ field: "", message: "" }] });
    }

    // ДОЛЖНО ИДТИ ЧЕРЕЗ СЕРВИС!
    const userInfo = await dataQueryRepository.findUserForMe(userId);
    return res.status(HttpStatus.Ok).send(userInfo);
};

export const registrationConfirmation = async (
    req: RequestWithBody<RegistrationConfirmationInput>,
    res: Response,
) => {
    const confirmationResult: CustomResult =
        await authService.confirmRegistrationCode(req.body);

    if (confirmationResult.statusCode !== HttpStatus.Ok) {
        console.error(
            "Error description: ",
            confirmationResult?.statusDescription,
            JSON.stringify(confirmationResult.errorsMessages),
        );

        return res
            .status(confirmationResult.statusCode)
            .send({ errorsMessages: confirmationResult.errorsMessages });
    }

    return res.sendStatus(HttpStatus.NoContent);
};

export const registrationAttemptByUser = async (
    req: RequestWithBody<RegistrationUserInputModel>,
    res: Response,
) => {
    // const { loginOrEmail, password } = req.body;
    const registrationResult: CustomResult = await authService.registerNewUser(
        req.body,
    );

    if (registrationResult.statusCode !== HttpStatus.Ok) {
        // console.error(
        //     "Error description: ",
        //     registrationResult?.statusDescription,
        //     JSON.stringify(registrationResult.errorsMessages)
        // );

        return res
            .status(registrationResult.statusCode)
            .send({ errorsMessages: registrationResult.errorsMessages });
    }

    return res.sendStatus(HttpStatus.NoContent);
};

export const resendRegistrationConfirmation = async (
    req: RequestWithBody<ResentRegistrationConfirmationInput>,
    res: Response,
) => {
    const resentConfirmationResult: CustomResult =
        await authService.resendConfirmRegistrationCode(req.body);

    if (resentConfirmationResult.statusCode !== HttpStatus.Ok) {
        console.error(
            "Error description: ",
            resentConfirmationResult?.statusDescription,
            JSON.stringify(resentConfirmationResult.errorsMessages),
        );

        return res
            .status(resentConfirmationResult.statusCode)
            .send({ errorsMessages: resentConfirmationResult.errorsMessages });
    }

    return res.sendStatus(HttpStatus.NoContent);
};
