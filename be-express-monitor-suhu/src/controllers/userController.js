// di be-express-monitor-suhu/src/controllers/userController.js
import { getAllUsers, getUserByEmail, addUser, updateUser, deleteUser, getUserById } from "../models/userModel.js";
import { registerSchema, updateUserSchema } from "../schemas/authSchema.js"; // Buat schema baru
import { datetime, status } from "../utils/general.js";
import { hashPassword } from "../utils/hash.js";

// ... existing functions ...

export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validasi input
    const validation = updateUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Validasi gagal",
        datetime: datetime(),
        errors: validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const { name, email, role, password } = validation.data;

    // Cek jika user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "User tidak ditemukan",
        datetime: datetime(),
      });
    }

    // Cek jika email sudah digunakan oleh user lain
    if (email !== existingUser.email) {
      const emailExists = await getUserByEmail(email);
      if (emailExists) {
        return res.status(400).json({
          status: status.BAD_REQUEST,
          message: "Email sudah digunakan oleh user lain",
          datetime: datetime(),
        });
      }
    }

    // Hash password jika diupdate
    let hashedPassword = null;
    if (password) {
      hashedPassword = await hashPassword(password);
    }

    // Update user
    const updatedUser = await updateUser(id, {
      name,
      email,
      role,
      password: hashedPassword
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: "User berhasil diupdate",
      datetime: datetime(),
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek jika user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "User tidak ditemukan",
        datetime: datetime(),
      });
    }

    // Delete user
    await deleteUser(id);

    return res.status(200).json({
      status: status.SUKSES,
      message: "User berhasil dihapus",
      datetime: datetime(),
    });
  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

// Tambah user baru
export const createNewUser = async (req, res) => {
  try {
    // Validasi input user baru
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Validasi gagal",
        datetime: datetime(),
        errors: validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const { name, email, password, role } = validation.data;

    // Cek apakah email sudah digunakan
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Email sudah digunakan",
        datetime: datetime(),
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Simpan user baru
    const newUser = await addUser({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      status: status.SUKSES,
      message: "User berhasil ditambahkan",
      datetime: datetime(),
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};


// Ambil semua user
export const fetchAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data user berhasil diambil",
      datetime: datetime(),
      users,
    });
  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};