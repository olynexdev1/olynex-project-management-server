const leaveRequestModal = require('../../models/leaveRequst.modal');

// post a new leave request
exports.postLeaveRequest = async (req, res) => {
  const body = req?.body;
  try {
    const result = await leaveRequestModal.create(body);
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

exports.getLeaveRequests = async (req, res) => {
  const { month, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const query = {};

  try {
    // Check if month is provided and not equal to "All"
    if (month && month !== 'All') {
      const year = new Date().getFullYear();
      const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
      const endDate = new Date(year, parseInt(month), 0, 23, 59, 59, 999);
      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Calculate the total number of requests for the query
    const totalLeaveRequest = await leaveRequestModal.countDocuments(query);
    const data = await leaveRequestModal
      .find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Calculate total pages based on the total number of requests
    const totalPages = Math.ceil(totalLeaveRequest / limit);

    res.status(201).send({ data, totalPages });
  } catch (err) {
    res.status(500).send({ message: err });
  }
};

// get single leave request with _id
exports.getLeaveRequest = async (req, res) => {
  const { id } = req.params; // Extract id from req.params
  try {
    const result = await leaveRequestModal.findById(id); // Use findById to get the document by its _id
    if (result) {
      res.send(result); // Send the found document
    } else {
      res.status(404).send({ message: 'Leave request not found' }); // Handle case where no document is found
    }
  } catch (err) {
    res.status(500).send({ message: err.message }); // Send error message in case of server error
  }
};

// delete a leave request
exports.DeleteLeaveRequest = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ message: 'Invalid request: ID is required.' });
  }
  try {
    const result = await leaveRequestModal.findByIdAndDelete(id);

    if (!result) {
      // If no document is found, return a 404 response
      return res.status(404).json({ message: 'Request record not found.' });
    }

    res
      .status(200)
      .json({ message: 'Leave Request record deleted successfully.', result });
  } catch (err) {
    res.status(500).json({
      message: 'Failed to delete request record.',
      error: err.message,
    });
  }
};

// update leave request status
exports.responseLeaveRequest = async (req, res) => {
  const { id, status } = req.body;

  try {
    // Update the status of the leave request with the specified id
    const updatedRequest = await leaveRequestModal.updateOne(
      { _id: id }, // Filter by id
      { $set: { status } } // Set the new status
    );

    // Check if the document was matched and modified
    if (updatedRequest.matchedCount === 0) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (updatedRequest.modifiedCount === 0) {
      return res
        .status(400)
        .json({ message: 'Leave request status was not updated' });
    }

    return res.status(200).json({
      message: `Leave request ${status} successfully`,
      updatedRequest,
    });
  } catch (error) {
    console.error('Error updating leave request status:', error);
    return res.status(500).json({ message: 'Failed to update leave request' });
  }
};

exports.getCasualCount = async (req, res) => {
  const month = req.query.month;
  const currentYear = new Date().getFullYear();

  try {
    // If month is 'All', return the count of all leave requests regardless of the month
    if (month === 'All') {
      const result = await leaveRequestModal.countDocuments();
      return res.status(200).send({ count: result });
    }

    // Parsing the start and end dates for the given month
    const startDate = new Date(`${currentYear}-${month}-01T00:00:00.000Z`);
    const endDate = new Date(currentYear, parseInt(month), 0, 23, 59, 59, 999);

    // Filter based on the month range and leaveType 'casual'
    const filter = {
      createdAt: { $gte: startDate, $lte: endDate },
      leaveType: 'Casual',
    };

    // Get the count of documents matching the filter
    const result = await leaveRequestModal.countDocuments(filter);

    // Send the result back in the response
    return res.status(200).send({ count: result });
  } catch (error) {
    console.error('Error fetching casual leave count:', error);
    return res
      .status(500)
      .json({ message: 'Failed to fetch casual leave count' });
  }
};
