const cron = require('node-cron');
const Income = require('./model/Income');
const Expense = require('./model/Expense');
const mongoose = require('mongoose');

// Helper to calculate next occurrence date
function getNextOccurrence(current, recurrence) {
  const date = new Date(current);
  switch (recurrence.type) {
    case 'daily':
      date.setDate(date.getDate() + recurrence.interval);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7 * recurrence.interval);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + recurrence.interval);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + recurrence.interval);
      break;
    case 'custom':
      date.setDate(date.getDate() + recurrence.interval);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  return date;
}

async function processRecurring(model) {
  const now = new Date();
  // Find all recurring transactions due
  const recurs = await model.find({
    isRecurring: true,
    nextOccurrence: { $lte: now },
    $or: [
      { recurringEndDate: { $exists: false } },
      { recurringEndDate: null },
      { recurringEndDate: { $gte: now } }
    ]
  });

  for (const recur of recurs) {
    // Create a new transaction (not recurring)
    const newDoc = new model({
      title: recur.title,
      description: recur.description,
      type: recur.type,
      amount: recur.amount,
      user: recur.user,
      isRecurring: false
    });
    await newDoc.save();

    // Update nextOccurrence
    recur.nextOccurrence = getNextOccurrence(recur.nextOccurrence, recur.recurrence);
    await recur.save();
  }
}

// Run every day at 2am
cron.schedule('0 2 * * *', async () => {
  try {
    await processRecurring(Income);
    await processRecurring(Expense);
    console.log('Processed recurring transactions at', new Date());
  } catch (err) {
    console.error('Recurring job error:', err);
  }
});

module.exports = {}; 