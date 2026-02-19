// User Routes
const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
