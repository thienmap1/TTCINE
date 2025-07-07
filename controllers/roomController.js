const Room = require('../models/Room');
const { body, validationResult } = require('express-validator');

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách phòng chiếu', error: error.message });
  }
};

const createRoom = [
  body('phong_id').isInt().withMessage('ID phòng phải là số nguyên'),
  body('name').notEmpty().withMessage('Tên phòng là bắt buộc'),
  body('type').notEmpty().withMessage('Loại phòng là bắt buộc'),
  body('capacity').isInt({ min: 1 }).withMessage('Sức chứa phải lớn hơn 0'),
  body('rows').isInt({ min: 1 }).withMessage('Số hàng phải lớn hơn 0'),
  body('columns').isInt({ min: 1 }).withMessage('Số cột phải lớn hơn 0'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin được phép thêm phòng chiếu' });
    }

    try {
      const { phong_id, name, type, capacity, rows, columns } = req.body;
      const existingRoom = await Room.findOne({ phong_id });
      if (existingRoom) return res.status(400).json({ message: 'ID phòng đã tồn tại' });

      const room = new Room({ phong_id, name, type, capacity, rows, columns });
      await room.save();
      res.status(201).json({ message: 'Thêm phòng chiếu thành công', room });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi thêm phòng chiếu', error: error.message });
    }
  }
];

const updateRoom = [
  body('name').optional().notEmpty().withMessage('Tên phòng không được để trống'),
  body('type').optional().notEmpty().withMessage('Loại phòng không được để trống'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Sức chứa phải lớn hơn 0'),
  body('rows').optional().isInt({ min: 1 }).withMessage('Số hàng phải lớn hơn 0'),
  body('columns').optional().isInt({ min: 1 }).withMessage('Số cột phải lớn hơn 0'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ admin được phép sửa phòng chiếu' });
    }

    try {
      const room = await Room.findOneAndUpdate(
        { phong_id: req.params.id },
        req.body,
        { new: true }
      );
      if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng chiếu' });
      res.json({ message: 'Cập nhật phòng chiếu thành công', room });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật phòng chiếu', error: error.message });
    }
  }
];

const deleteRoom = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ admin được phép xóa phòng chiếu' });
  }

  try {
    const room = await Room.findOneAndDelete({ phong_id: req.params.id });
    if (!room) return res.status(404).json({ message: 'Không tìm thấy phòng chiếu' });
    res.json({ message: 'Xóa phòng chiếu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa phòng chiếu', error: error.message });
  }
};

module.exports = { getRooms, createRoom, updateRoom, deleteRoom };