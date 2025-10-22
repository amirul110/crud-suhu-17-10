import ExcelJS from "exceljs";
import {
  addMonitorSuhu,
  editMonitorSuhu,
  getAllMonitorSuhu,
  getMonitorSuhuById,
  removeMonitorSuhu,
} from "../models/monitorSuhuModel.js";
import { addMonitorSuhuSchema } from "../schemas/monitorSuhuSchema.js";
import { datetime, status } from "../utils/general.js";
import { getAllMasterMesin } from "../models/masterMesinModel.js";
import { formatMariaDBDatetime } from "../utils/formatDate.js";

export const fetchAllMonitorSuhu = async (req, res) => {
  try {
    const monitorSuhu = await getAllMonitorSuhu();

    if (monitorSuhu.length === 0) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Data monitor kosong",
        datetime: datetime(),
      });
    }

  return res.status(200).json({
  status: status.SUKSES,
  message: "Data monitor suhu berhasil didapatkan",
  datetime: datetime(),
  data: monitorSuhu, // ubah key-nya ke "data"
});

  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

export const fetchMonitorSuhuById = async (req, res) => {
  try {
    const { id } = req.params;
    const monitorSuhu = await getMonitorSuhuById(id);
    if (!monitorSuhu) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Data Mesin tidak ditemukan",
        datetime: datetime(),
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data monitor suhu berhasil didapatkan",
      datetime: datetime(),
      monitor_suhu: monitorSuhu,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

export const createMonitorSuhu = async (req, res) => {
  try {
    const validation = addMonitorSuhuSchema.safeParse(req.body);
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

    const { id_mesin, tanggal_input, keterangan_suhu } = validation.data;

    const monitorSuhu = await addMonitorSuhu({
      id_mesin,
      tanggal_input,
      keterangan_suhu,
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data monitor suhu berhasil dibuat",
      datetime: datetime(),
      monitor_suhu: monitorSuhu,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

export const updateMonitorSuhu = async (req, res) => {
  try {
    const { id } = req.params;
    const validation = addMonitorSuhuSchema.safeParse(req.body);
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

    const { id_mesin, tanggal_input, keterangan_suhu } = validation.data;

    // console.log(validation.data);

    const monitorSuhu = await editMonitorSuhu({
      id,
      id_mesin,
      tanggal_input,
      keterangan_suhu,
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data monitor suhu berhasil diperbarui",
      datetime: datetime(),
      monitor_suhu: monitorSuhu,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

export const destroyMonitorSuhu = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🔄 DELETE Monitor Suhu ID: ${id}`);

    // Cek jika data exists
    const existing = await getMonitorSuhuById(id);
    if (!existing) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Data monitor suhu tidak ditemukan",
        datetime: datetime(),
      });
    }

    // Hapus data
    const deletedCount = await removeMonitorSuhu(id);

    if (deletedCount === 0) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Gagal menghapus data monitor suhu",
        datetime: datetime(),
      });
    }

    // ✅ KEMBALIKAN RESPONSE YANG KONSISTEN DENGAN LAINNYA
    return res.status(200).json({
      data: {
        status: status.SUKSES, // '00'
        message: "Data monitor suhu berhasil dihapus",
        datetime: datetime(),
        deletedId: parseInt(id)
      }
    });

  } catch (error) {
    console.error('❌ Delete error:', error);
    return res.status(500).json({
      data: {
        status: status.GAGAL,
        message: `Terjadi kesalahan pada server: ${error.message}`,
        datetime: datetime(),
      }
    });
  }
};
   

export const importDataFromExcel = async (req, res) => {
  try {
    const masterMesin = await getAllMasterMesin();
    const kodeToId = {};

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.worksheets[0];

    masterMesin.forEach((mesin) => {
      kodeToId[mesin.kode_mesin] = mesin.id;
    });

    // return res.status(200).json({ kodeToId: kodeToId["MC-005"] });

    // console.log(kodeToId);

    const validRows = [];
    const errors = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const [kode_mesin, tanggal_input, keterangan_suhu] = row.values.slice(1);

      console.log(row.values.slice(1));
      console.log(kode_mesin, kodeToId[kode_mesin]);

      const id_mesin = kodeToId[kode_mesin];

      // message: `Kode mesin ${kode_mesin} tidak ditemukan`
      if (!id_mesin) {
        // return res.status(404).json({
        //   status: status.NOT_FOUND,
        //   message: `Kode mesin ${kode_mesin} tidak ditemukan`,
        //   datetime: datetime(),
        // });
        errors.push({
          row: rowNumber,
          field: "kode_mesin",
          message: `Kode mesin ${kode_mesin} tidak ditemukan`,
        });
        return;
      }

      const validation = addMonitorSuhuSchema.safeParse({
        id_mesin,
        tanggal_input: formatMariaDBDatetime(tanggal_input),
        keterangan_suhu,
      });

      if (!validation.success) {
        // return res.status(400).json({
        //   status: status.BAD_REQUEST,
        //   message: "Validasi gagal",
        //   datetime: datetime(),
        //   errors: validation.error.errors.map((err) => ({
        //     field: err.path[0],
        //     message: err.message,
        //   })),
        // });
        errors.push(
          ...validation.error.errors.map((err) => ({
            row: rowNumber,
            field: err.path[0],
            message: err.message,
          })),
        );
        return;
      }

      validRows.push(validation.data);
    });

    if (errors.length > 0) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Beberapa baris tidak valid",
        datetime: datetime(),
        errors,
      });
    }

    const inserted = [];
    for (const data of validRows) {
      const insert = await addMonitorSuhu(data);
      inserted.push(insert);
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data berhasil di-import",
      datetime: datetime(),
      monitor_suhu: inserted,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};