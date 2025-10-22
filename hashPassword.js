// hashPassword.js
import bcrypt from "bcryptjs";

const run = async () => {
  const password = "12345678"; // ganti dengan password asli
  const hash = await bcrypt.hash(password, 10);
  console.log("🔐 Hash password:", hash);
};

run();


// $2b$10$xndWmaFz08rslpwXnNKTQ.LhcH2PYRluudjp.JULwVehK2qC76e6u
// $2b$10$tOYh0YrHXNgf88er/3Yey.Np/9CHNICFuTNvU3JlwSZnL/.pz0zgG