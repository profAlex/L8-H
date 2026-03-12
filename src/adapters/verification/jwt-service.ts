import jwt from "jsonwebtoken";
import { envConfig } from "../../config";
import { JwtPayloadType } from "./payload-type";
import { token } from "./token-type";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { CustomResult } from "../../common/result-type/result-type";
import { AccessTokenModel } from "./auth-access-token-model";
import { RefreshTokenModel } from "./auth-refresh-token-model";

export const jwtService = {
    async createAccessToken(
        payload: JwtPayloadType,
    ): Promise<CustomResult<AccessTokenModel>> {
        if (!payload.userId) {
            console.error(
                "userID is missing",
            );

            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "userID is missing",
                errorsMessages: [
                    {
                        field: "createAccessToken -> if (!payload.userId)",
                        message: "userId is empty",
                    },
                ],
            };
        }

        try {
            const resultedToken = jwt.sign(
                payload,
                envConfig.accessTokenSecret,
                {
                    expiresIn: envConfig.accessTokenLifetime,
                },
            );

            return {
                data: { accessToken: resultedToken },
                statusCode: HttpStatus.NoContent,
                errorsMessages: [{ field: null, message: null }],
            };
        } catch (e: unknown) {
            console.error("Can't sign accessToken with JWT service: ", e);
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription: "Can't sign accessToken with JWT service",
                errorsMessages: [
                    {
                        field: "inside async createAccessToken",
                        message: "Unknown error",
                    },
                ],
            };
        }
    },

    async createRefreshToken(
        payload: JwtPayloadType,
    ): Promise<CustomResult<RefreshTokenModel>> {
        if (!payload.userId) {
            console.error(
                "userID is missing",
            );

            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "userID is missing",
                errorsMessages: [
                    {
                        field: "createRefreshToken -> if (!payload.userId)",
                        message: "userId is empty",
                    },
                ],
            };
        }

        try {
            const resultedToken = jwt.sign(
                payload,
                envConfig.refreshTokenSecret,
                {
                    expiresIn: envConfig.refreshTokenLifetime,
                },
            );

            return {
                data: {
                    refreshToken: resultedToken,
                    relatedUserId: payload.userId,
                },
                statusCode: HttpStatus.NoContent,
                errorsMessages: [{ field: null, message: null }],
            };
        } catch (e: unknown) {
            console.error("Can't sign refreshToken with JWT service: ", e);
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription: "Can't sign refreshToken with JWT service",
                errorsMessages: [
                    {
                        field: "inside async createRefreshToken",
                        message: "Unknown error",
                    },
                ],
            };
        }
    },

    async decodeToken(token: string): Promise<JwtPayloadType | null> {
        try {
            return jwt.decode(token) as JwtPayloadType;
        } catch (e: unknown) {
            console.error("Can't decode token with JWT service: ", e);
            return null;
        }
    },

    async verifyToken(token: string): Promise<JwtPayloadType | null> {
        try {
            return jwt.verify(
                token,
                envConfig.accessTokenSecret,
            ) as JwtPayloadType;
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error(
                    "Token verification error with JWT service: ",
                    err,
                );
            } else {
                console.error(
                    "Unknown error with JWT verification service: ",
                    err,
                );
            }
            return null;
        }
    },
};
