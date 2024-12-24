// const session = await mongoose.startSession();
// session.startTransaction();

// try {
//   const ticket = await Ticket.create([{ userId, eventId, amount }], { session });

//   await Event.findByIdAndUpdate(
//     eventId,
//     { $inc: { soldTickets: 1, totalSale: amount } },
//     { session }
//   );

//   await session.commitTransaction();
//   session.endSession();

//   return ticket;
// } catch (err) {
//   await session.abortTransaction();
//   session.endSession();
//   throw err;
// }
