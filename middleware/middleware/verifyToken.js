import jwt from "jsonwebtoken";


export default function verifyToken(req, res, next) {

    const authHeader = req.headers.authorization;


    console.log("AUTH HEADER:", authHeader);


    if (!authHeader) {

        return res.status(401).json({
            message: "No authorization header"
        });

    }


    const token = authHeader.split(" ")[1];


    console.log("TOKEN:", token);


    if (!token) {

        return res.status(401).json({
            message: "No token"
        });

    }



    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (error, decoded) => {


            if (error) {

                console.log("JWT ERROR:", error);

                return res.status(401).json({
                    message: "Invalid token"
                });

            }


            console.log("DECODED USER:", decoded);


            req.user = decoded;

            next();

        }
    );


}