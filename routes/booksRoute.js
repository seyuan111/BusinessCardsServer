import express from 'express';
import { Business } from '../models/bookModel.js';

const router = express.Router();

const normalizeWebsite = (value = '') => {
  const v = String(value).trim();
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
};

// Route for Save a new Card
router.post('/', async (request, response) => {
  try {
    const { name, address, email, occupation, contact, fax, website } = request.body;

    if (!name || !email || !contact) {
      return response.status(400).send({
        message: 'Send all required fields',
      });
    }

    const existingEmail = await Business.findOne({ email });
    if (existingEmail) {
      return response.status(400).send({
        message: 'Email address is already taken.',
      });
    }

    const existingPhone = await Business.findOne({ contact });
    if (existingPhone) {
      return response.status(400).send({
        message: 'Phone number is already taken.',
      });
    }

    if (fax) {
      const existingFax = await Business.findOne({ fax });
      if (existingFax) {
        return response.status(400).send({
          message: 'Fax number is already taken.',
        });
      }
    }

    const newCard = {
      name,
      address,
      email,
      occupation,
      contact,
      fax,
      website: normalizeWebsite(website),
    };

    const card = await Business.create(newCard);
    return response.status(201).send(card);
  } catch (error) {
    console.log(error.message);

    // Mongoose validation errors (including website validation)
    if (error.name === 'ValidationError') {
      return response.status(400).send({ message: error.message });
    }

    return response.status(500).send({ message: error.message });
  }
});

// Route for Get All cards sorted by name
router.get('/', async (request, response) => {
  try {
    const cards = await Business.find({}).sort({ name: 1 });

    return response.status(200).json({
      count: cards.length,
      data: cards,
    });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  }
});

// Route for Get One card from database by id
router.get('/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const card = await Business.findById(id);
    return response.status(200).json(card);
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  }
});

// Route for Update a card
router.put('/:id', async (request, response) => {
  try {
    const { name, address, email, occupation, contact, fax, website } = request.body;

    if (!name || !email || !contact) {
      return response.status(400).send({
        message: 'Send all required fields',
      });
    }

    const { id } = request.params;

    const updatedPayload = {
      name,
      address,
      email,
      occupation,
      contact,
      fax,
      website: normalizeWebsite(website),
    };

    const result = await Business.findByIdAndUpdate(id, updatedPayload, {
      new: true,
      runValidators: true, // IMPORTANT: ensures website/address validators run on update
    });

    if (!result) {
      return response.status(404).json({ message: 'Contact not found' });
    }

    return response.status(200).send(result);
  } catch (error) {
    console.log(error.message);

    if (error.name === 'ValidationError') {
      return response.status(400).send({ message: error.message });
    }

    return response.status(500).send({ message: error.message });
  }
});

// Route for Delete a card
router.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const result = await Business.findByIdAndDelete(id);

    if (!result) {
      return response.status(404).json({ message: 'Contact not found' });
    }

    return response.status(200).send({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  }
});

export default router;
