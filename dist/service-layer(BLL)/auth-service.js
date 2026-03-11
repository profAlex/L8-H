"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const query_repository_1 = require("../repository-layers/query-repository-layer/query-repository");
const bcrypt_service_1 = require("../adapters/authentication/bcrypt-service");
const jwt_service_1 = require("../adapters/verification/jwt-service");
const http_statuses_1 = require("../common/http-statuses/http-statuses");
const command_repository_1 = require("../repository-layers/command-repository-layer/command-repository");
const mongodb_1 = require("mongodb");
const user_class_1 = require("../common/classes/user-class");
const mailer_service_1 = require("../adapters/email-sender/mailer-service");
exports.authService = {
    loginUser(loginOrEmail, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield query_repository_1.dataQueryRepository.findByLoginOrEmail(loginOrEmail);
            if (!user)
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.Unauthorized,
                    statusDescription: "Wrong login or password", // по сути это "User does not exist", но на фронт такие детали не должны утекать
                    errorsMessages: [
                        {
                            field: "dataQueryRepository.findByLoginOrEmail", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: "Wrong login or password"
                        }
                    ]
                };
            const isCorrectCredentials = yield this.checkUserCredentials(password, user.passwordHash);
            if (isCorrectCredentials === false) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.Unauthorized,
                    statusDescription: "Wrong login or password",
                    errorsMessages: [
                        {
                            field: "loginUser -> checkUserCredentials",
                            message: "Wrong login or password"
                        }
                    ]
                };
            }
            else if (isCorrectCredentials === null) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Failed attempt to check credentials login or password",
                    errorsMessages: [
                        {
                            field: "loginUser -> checkUserCredentials",
                            message: "Failed attempt to check credentials login or password"
                        }
                    ]
                };
            }
            const resultedToken = yield jwt_service_1.jwtService.createToken({ userId: user.id });
            return resultedToken;
        });
    },
    // пробуем зарегистрировать возвращенный от юзера код подтверждения
    confirmRegistrationCode(sentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield command_repository_1.dataCommandRepository.confirmRegistrationCode(sentData);
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Unknown error in authService -> confirmRegistrationCode",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error"
                        }
                    ]
                };
            }
        });
    },
    // пробуем зарегистрировать пользователя по его запросу (т.е. по запросу фронта)
    registerNewUser(sentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ifUserLoginExists = yield command_repository_1.dataCommandRepository.findByLoginOrEmail(sentData.login);
                const ifUserEmailExists = yield command_repository_1.dataCommandRepository.findByLoginOrEmail(sentData.email);
                if (ifUserLoginExists) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.BadRequest,
                        statusDescription: "authService -> registerNewUser -> if(ifUserLoginExists)",
                        errorsMessages: [
                            {
                                field: "login",
                                message: "Email or Login already exists!!!"
                            }
                        ]
                    };
                }
                if (ifUserEmailExists) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.BadRequest,
                        statusDescription: "authService -> registerNewUser -> if(ifUserEmailExists)",
                        errorsMessages: [
                            {
                                field: "email",
                                message: "Email or Login already exists!!!"
                            }
                        ]
                    };
                }
                const passwordHash = yield bcrypt_service_1.bcryptService.generateHash(sentData.password);
                if (!passwordHash) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "",
                        errorsMessages: [
                            {
                                field: "bcryptService.generateHash",
                                message: "Generating hash error"
                            }
                        ]
                    };
                }
                const tempId = new mongodb_1.ObjectId();
                // console.log(
                //     "REGISTERED NEW HERE <-------------",
                //     tempId.toString()
                // );
                // нижеследующее заменили на инициализацию через клас User через extend interface UserCollectionStorageModel
                // const newUserEntry = {
                //     _id: tempId,
                //     id: tempId.toString(),
                //     login: sentNewUser.login,
                //     email: sentNewUser.email,
                //     passwordHash: passwordHash,
                //     createdAt: new Date(),
                // } as UserCollectionStorageModel;
                const newUserEntry = new user_class_1.User(sentData.login, sentData.email, passwordHash, tempId);
                const newUserInsertionResult = yield command_repository_1.dataCommandRepository.registerNewUser(newUserEntry);
                if (newUserInsertionResult.statusCode !== http_statuses_1.HttpStatus.Ok) {
                    return {
                        data: newUserInsertionResult.data,
                        statusCode: newUserInsertionResult.statusCode,
                        statusDescription: newUserInsertionResult.statusDescription,
                        errorsMessages: newUserInsertionResult.errorsMessages
                    };
                }
                // здесь отсылка письма. с точки зрения обработки потенциальных ошибок
                // максимум того что целесообразно сделать, это в том случае если по какой-то причине с нашей стороны чтото сломалось
                // никак не говорить об этом юзерам, пускай они самостоятельно повторно отправляют запрос, мы максимум логируем ошибку
                // тут жестко будет связано с политикой компании по этому поводу
                // так делается чтобы не брать на себя лишней работы, т.к. в случае реальной проблемы с сервисом отправки мы так или иначе будем это чинить
                // а если письмо просто потерялось или юзер тупит - для нас это может быть куча лишней работы по обслуживанию непонятно чего
                // так что во втором случае пусть юзер сам лучше на себя возьмет это работу - просто повторно отправит если что запррос, нам главно оптимально подобрать период удалления неподтвержденных данных (минут 15-30)
                const sendingResult = yield mailer_service_1.mailerService.sendConfirmationRegisterEmail("\"Alex St\" <geniusb198@yandex.ru>", newUserEntry.email, newUserEntry.emailConfirmation.confirmationCode, mailer_service_1.emailExamples.registrationEmail);
                let status = "Sending went without problems, awaiting confirmation form user";
                if (!sendingResult) {
                    console.error("Something went wrong while sending the registration email");
                    status = "Something went wrong while sending the registration email";
                }
                // отправка результата что все ОК
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.NoContent,
                    statusDescription: status,
                    errorsMessages: [
                        {
                            field: "",
                            message: ""
                        }
                    ]
                };
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Unknown error in authService -> registerNewUser",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error"
                        }
                    ]
                };
            }
        });
    },
    resendConfirmRegistrationCode(sentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isUserInDatabase = yield command_repository_1.dataCommandRepository.findNotConfirmedByEmail(sentData.email);
                if (!isUserInDatabase) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.BadRequest,
                        statusDescription: "authService -> resendConfirmRegistrationCode -> if (isUserInDatabase)",
                        errorsMessages: [
                            {
                                field: "email",
                                message: "Email doesn't exist or already confirmed"
                            }
                        ]
                    };
                }
                return yield command_repository_1.dataCommandRepository.resendConfirmRegistrationCode(sentData, isUserInDatabase);
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Unknown error in authService -> resendConfirmRegistrationCode",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error"
                        }
                    ]
                };
            }
        });
    },
    // вспомогательная функция
    checkUserCredentials(password, passwordHash) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcrypt_service_1.bcryptService.checkPassword(password, passwordHash);
        });
    }
};
