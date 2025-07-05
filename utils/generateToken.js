import jwt from "jsonwebtoken";

export const createToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "45d",
  });

  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("jwt", token, {
    maxAge: 45 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction,
  });
  return token;
};
