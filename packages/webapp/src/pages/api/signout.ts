import type { NextApiRequest, NextApiResponse } from "next";
import { BadRequestError, handleErrors } from "@edenos/common";

import { setZoomJWTCookie } from "_api/zoom-commons";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    switch (req.method) {
        case "POST":
            return handleSignOut(req, res);
        default:
            return handleErrors(
                res,
                new BadRequestError(["request not supported"])
            );
    }
};

const handleSignOut = async (_req: NextApiRequest, res: NextApiResponse) => {
    try {
        setZoomJWTCookie(null, res); // clear zoom JWT cookie
        res.status(200).json({ success: "ok" });
    } catch (error) {
        console.error(error);
        return handleErrors(res, error as Error);
    }
};
