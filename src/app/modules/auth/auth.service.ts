import { UserStatus } from "@prisma/client"
import { prisma } from "../../shared/prisma"
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import { jwtHelper } from "../../helper/jwtHelper";
import ApiError from "../../errors/ApiError";
import httpStatus from 'http-status';
import config from "../../../config";

const login = async (payload: { email: string, password: string }) => {
    console.log(payload)
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE
        }
    })

    console.log(user)

    const isCorrectPassword = await bcrypt.compare(payload.password, user.password)

    if (!isCorrectPassword) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Password Incorrect")
    }
    const accessToken = jwtHelper.generateToken({ email: user.email, role: user.role }, config.jwt.jwt_secret as string, "1h");

    const refreshToken = jwtHelper.generateToken({ email: user.email, role: user.role }, config.jwt.refresh_token_secret as string, "90d");


    return {
        accessToken,
        refreshToken,
        needPasswordChange: user.needPasswordChange
    }
}

export const AuthServices = {
    login
}