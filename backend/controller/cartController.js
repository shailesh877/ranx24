import Cart from '../model/Cart.js';
import Worker from '../model/Worker.js'; // Assuming you have a Worker model

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.worker');
    if (!cart) {
      return res.status(200).json({ items: [] }); // Return empty cart if not found
    }
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addItemToCart = async (req, res) => {
  const { workerId, category, service, description, price, quantity = 1, bookingType = 'full-day', days = 1, startDate, endDate } = req.body;



  // if (!workerId) {
  //   return res.status(400).json({ message: 'Worker ID is required' });
  // }

  if (!category) {
    return res.status(400).json({ message: 'Category is required' });
  }

  if (!service) {
    return res.status(400).json({ message: 'Service is required' });
  }

  if (!price || price <= 0) {
    return res.status(400).json({ message: 'Valid price is required' });
  }

  if (bookingType === 'multiple-days' && days < 2) {
    return res.status(400).json({ message: 'For multiple days, days must be at least 2' });
  }

  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check if worker exists ONLY if workerId is provided
    if (workerId) {
      const worker = await Worker.findById(workerId);
      if (!worker) {
        return res.status(404).json({ message: 'Worker not found' });
      }
    }

    // Check if item is already in cart (match by service AND worker if present)
    const existingItemIndex = cart.items.findIndex(item =>
      item.service === service &&
      (workerId ? item.worker?.toString() === workerId : !item.worker)
    );

    if (existingItemIndex > -1) {
      return res.status(400).json({ message: "Item already in cart" });
    } else {
      // Validate multiple days
      if (bookingType === 'multiple-days' && (!days || days < 2)) {
        return res.status(400).json({ message: "Multiple days booking requires at least 2 days" });
      }

      cart.items.push({
        worker: workerId || undefined,
        category,
        service,
        description: description || '',
        price,
        bookingType: bookingType || 'full-day',
        days: days || 1,
        startDate,
        endDate,
        date: req.body.date,
        time: req.body.time,
        address: req.body.address,
        isPendingDetails: req.body.isPendingDetails || false
      });
    }
    await cart.save();
    // Populate worker details for the response
    const populatedCart = await Cart.findById(cart._id).populate('items.worker');
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error('Cart add error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:workerId
// @access  Private
const removeItemFromCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // console.log("Removing item ID:", req.params.workerId);
    // console.log("Current Cart Items:", JSON.stringify(cart.items.map(i => ({id: i._id, worker: i.worker}))));

    const originalLength = cart.items.length;
    cart.items = cart.items.filter(
      item => item._id && item._id.toString() !== req.params.workerId
    );

    // Fallback: If not removed by Item ID, try removing by Worker ID (legacy support for old carts)
    if (cart.items.length === originalLength) {
      cart.items = cart.items.filter(
        item => !item.worker || item.worker.toString() !== req.params.workerId
      );
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate('items.worker');
    res.status(200).json(populatedCart);
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = []; // Clear all items

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


export {
  getCart,
  addItemToCart,
  removeItemFromCart,
  clearCart,
};
