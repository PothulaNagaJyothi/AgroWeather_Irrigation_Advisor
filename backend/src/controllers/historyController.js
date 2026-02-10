const historyService = require('../services/historyService');

async function listHistory(req, res, next) {
  try {
    const userId = req.userId;
    const rows = await historyService.listAll(userId);
    res.json({ history: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { listHistory };
