const { Order} = require('../models/order');
const {auth , isUser, isAdmin} = require('../middleware/auth');
const moment = require('moment');

const router = require('express').Router();

//GET ORDERS

router.get('/', isAdmin, async (req, res) => {
    const query = req.query.new;
    try{
       const orders = query 
       ? await Order.find().sort({_id: -1}).limit(4) 
       : await Order.find().sort({_id: -1});

       res.status(200).send(orders);
    }catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
});

//UPDATE ORDER
router.put("/:id", isAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).send(updatedOrder);
  } catch (err) {
    res.status(500).send(err);
  }
});

//GET AN ORDER
router.get("/findOne/:id", auth, async (req, res) => {
  try {
      const order = await Order.findById(req.params.id);
      if(req.user._id !== order.userId || !req.user.isAdmin)
           return res.status(403).send("Access Denied.Not authorized...");
    res.status(200).send(order);
  } catch (err) {
    res.status(500).send(err);
  }
});

// GET ORDER STATS

router.get("/stats", isAdmin, async (req, res) => {
  const previousMonth = moment()
    .month(moment().month() - 1)
    .set("date", 1)
    .format("YYYY-MM-DD HH:mm:ss");

  try {
    const orders = await Order.aggregate([
      {
        $match: { createdAt: { $gte: new Date(previousMonth) } },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);

    res.status(200).send(orders);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// GET INCOME STATS

router.get("/income/stats", isAdmin, async (req, res) => {
  const previousMonth = moment()
    .month(moment().month() - 1)
    .set("date", 1)
    .format("YYYY-MM-DD HH:mm:ss");

  try {
    const income = await Order.aggregate([
      {
        $match: { createdAt: { $gte: new Date(previousMonth) } },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$total",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);

    res.status(200).send(income);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// GET 1 WEEK SALES

router.get("/week-sales", isAdmin, async (req, res) => {
  const last7Days = moment()
    .day(moment().day() - 7)
    .format("YYYY-MM-DD HH:mm:ss");

  try {
    const income = await Order.aggregate([
      {
        $match: { createdAt: { $gte: new Date(last7Days) } },
      },
      {
        $project: {
          day: { $dayOfWeek: "$createdAt" },
          sales: "$total",
        },
      },
      {
        $group: {
          _id: "$day",
          total: { $sum: "$sales" },
        },
      },
    ]);

    res.status(200).send(income);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});


module.exports = router;