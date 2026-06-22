import MarriageEventBooking from '../model/MarriageEventBooking.js';
import MarriageEventPackage from '../model/MarriageEventPackage.js';

// POST /api/marriage-event-bookings
// Create booking with date conflict check & 15% advance calculation
export const createMarriageEventBooking = async (req, res) => {
  try {
    const { package_id, event_date, notes } = req.body;
    const customer_id = req.user._id;

    if (!package_id || !event_date) {
      return res.status(400).json({ message: 'Package and event date are required' });
    }

    // 1. Check for date conflict — same event_date already booked (Active/Pending)
    const conflict = await MarriageEventBooking.findOne({
      event_date,
      status: { $in: ['Pending', 'Active'] },
    });

    if (conflict) {
      return res.status(409).json({
        message: `This date (${event_date}) is already booked. Please choose a different date.`,
        conflictDate: event_date,
      });
    }

    // 2. Fetch package price
    const pkg = await MarriageEventPackage.findById(package_id);
    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }

    const total_price = pkg.discounted_price || pkg.price;
    const advance_amount = Math.ceil(total_price * 0.15); // 15% advance

    // 3. Create booking
    const booking = await MarriageEventBooking.create({
      customer_id,
      package_id,
      event_date,
      total_price,
      advance_amount,
      advance_paid: 0,
      payment_status: 'Pending',
      status: 'Pending',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      booking,
      advance_amount,
      message: 'Booking created. Please pay the advance amount to confirm.',
    });
  } catch (error) {
    console.error('Error creating marriage event booking:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/marriage-event-bookings/:id/pay-advance
// Called after Razorpay payment verified — update payment status
export const confirmAdvancePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { razorpay_payment_id, amount_paid } = req.body;

    const booking = await MarriageEventBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure the booking belongs to this user
    if (booking.customer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const paid = Number(amount_paid) || 0;
    booking.advance_paid = (booking.advance_paid || 0) + paid;
    booking.razorpay_payment_id = razorpay_payment_id || null;
    booking.status = 'Active';

    // Determine payment status
    if (booking.advance_paid >= booking.total_price) {
      booking.payment_status = 'Paid';
    } else if (booking.advance_paid >= booking.advance_amount) {
      booking.payment_status = 'Partial Payment Paid';
    } else {
      booking.payment_status = 'Pending';
    }

    await booking.save();

    res.json({
      success: true,
      booking,
      message: `Payment confirmed. Status: ${booking.payment_status}`,
    });
  } catch (error) {
    console.error('Error confirming advance payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/marriage-event-bookings/my
// Get logged-in user's bookings
export const getMyMarriageEventBookings = async (req, res) => {
  try {
    const bookings = await MarriageEventBooking.find({ customer_id: req.user._id })
      .populate('package_id', 'name hall_name images price discounted_price')
      .sort({ created_at: -1 })
      .lean();

    // Parse images in populated package
    const result = bookings.map((b) => {
      if (b.package_id && typeof b.package_id.images === 'string') {
        try { b.package_id.images = JSON.parse(b.package_id.images); } catch { b.package_id.images = []; }
      }
      return b;
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching my marriage bookings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/marriage-event-bookings/:id
// Get details of a single marriage event booking by ID
export const getMarriageEventBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await MarriageEventBooking.findById(id)
      .populate('package_id', 'name hall_name images price discounted_price description')
      .lean();

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Ensure the booking belongs to this user
    if (booking.customer_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    // Parse images in populated package
    if (booking.package_id && typeof booking.package_id.images === 'string') {
      try {
        booking.package_id.images = JSON.parse(booking.package_id.images);
      } catch {
        booking.package_id.images = [];
      }
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching marriage booking by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// GET /api/marriage-event-bookings/check-date?date=YYYY-MM-DD
// Public: Check if a date is already booked
export const checkDateAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date is required' });

    const conflict = await MarriageEventBooking.findOne({
      event_date: date,
      status: { $in: ['Pending', 'Active'] },
    });

    res.json({ available: !conflict, date });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
