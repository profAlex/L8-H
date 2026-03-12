"use strict";
// import dotenv from "dotenv";
// dotenv.config();
Object.defineProperty(exports, "__esModule", { value: true });
exports.envConfig = void 0;
require("dotenv/config");
// дефолтные значения параметров
const DEFAULT_PORT = "3003";
const DEFAULT_ACCESS_TOKEN_SECRET = "ryuas235GCPHvlt347782uzHBSDuw4hr";
const DEFAULT_REFRESH_TOKEN_SECRET = "ryuas235GCPHvlt347782uzHBSDuw4hr";
const DEFAULT_ACCESS_TOKEN_LIFETIME = "10"; // mins
const DEFAULT_REFRESH_TOKEN_LIFETIME = "20"; // days
const DEFAULT_COOKIE_DOMAIN = "localhost";
const DEFAULT_COOKIE_SECURE = true;
// парсинг значений
const getConfig = () => {
    let appPort = process.env.PORT;
    let accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    let refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    let accessTokenLifetime = process.env.ACCESS_TOKEN_LIFETIME;
    let refreshTokenLifetime = process.env.REFRESH_TOKEN_LIFETIME;
    // валидация
    if (!appPort) {
        console.warn(`PORT is not defined in .env! Applied default port number ${DEFAULT_PORT}.`);
        appPort = DEFAULT_PORT;
    }
    // if (!accessJwtSecret) throw new Error("JWT_SECRET is required in .env");
    if (!accessTokenSecret) {
        console.warn("ACCESS_TOKEN_SECRET is not defined in .env! Applied default value.");
        accessTokenSecret = DEFAULT_ACCESS_TOKEN_SECRET;
    }
    if (!refreshTokenSecret) {
        console.warn("REFRESH_TOKEN_SECRET is not defined in .env! Applied default value.");
        refreshTokenSecret = DEFAULT_REFRESH_TOKEN_SECRET;
    }
    if (!accessTokenLifetime) {
        console.warn(`ACCESS_TOKEN_LIFETIME is not defined in .env! Applied default value (seconds) (: ${DEFAULT_ACCESS_TOKEN_LIFETIME}.`);
        accessTokenLifetime = DEFAULT_ACCESS_TOKEN_LIFETIME;
    }
    if (!refreshTokenLifetime) {
        console.warn(`REFRESH_TOKEN_LIFETIME is not defined in .env! Applied default value (seconds): ${DEFAULT_REFRESH_TOKEN_LIFETIME}.`);
        refreshTokenLifetime = DEFAULT_REFRESH_TOKEN_LIFETIME;
    }
    return {
        appPort: parseInt(appPort, 10),
        accessTokenSecret: accessTokenSecret,
        refreshTokenSecret: refreshTokenSecret,
        accessTokenLifetime: parseInt(accessTokenLifetime, 10),
        refreshTokenLifetime: parseInt(refreshTokenLifetime, 10),
    };
};
exports.envConfig = getConfig();
