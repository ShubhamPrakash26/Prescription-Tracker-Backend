import jwt from "jsonwebtoken";

export const createToken=(userId,res) =>{
const token = jwt.sign({userId},process.env.JWT_SECRET,{
    expiresIn:"45d",
});

res.cookie("jwt",token,{
    maxAge:45 * 24 * 60 * 60 * 1000,
    httpOnly:true,
    secure: true,
    sameSite: "strict"
});
return token;
};
