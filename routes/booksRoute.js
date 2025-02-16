import express from 'express';
import { Business } from '../models/bookModel.js';

const router = express.Router();

// Route for Save a new Card
router.post('/', async (request, response) => {
  try {
    if (
      !request.body.name ||
      !request.body.address ||
      !request.body.email ||
      !request.body.occupation ||
      !request.body.contact
    ) {
      return response.status(400).send({
        message: 'Send all required fields',
      });
    }

    const existingEmail = await Business.findOne({ email: request.body.email });
    if (existingEmail) {
      return response.status(400).send({
        message: 'Email address is already taken.',
      });
    }

    const existingPhone = await Business.findOne({ contact: request.body.contact });
    if (existingPhone) {
      return response.status(400).send({
        message: 'Phone number is already taken.',
      });
    }

    const newCard = {
      name: request.body.name,
      address: request.body.address,
      email: request.body.email,
      occupation: request.body.occupation,
      contact: request.body.contact,
    };

    const card = await Business.create(newCard);

    return response.status(201).send(card);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Get All cards from database
// Route for Get All cards from database sorted by name
router.get('/', async (request, response) => {
  try {
    const cards = await Business.find({}).sort({ name: 1 }); // Sort by name in ascending order

    return response.status(200).json({
      count: cards.length,
      data: cards,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
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
    response.status(500).send({ message: error.message });
  }
});

// Route for Update a card
router.put('/:id', async (request, response) => {
  try {
    if (
      !request.body.name ||
      !request.body.address ||
      !request.body.email ||
      !request.body.occupation ||
      !request.body.contact
    ) {
      return response.status(400).send({
        message: 'Send all required fields',
      });
    }

    const { id } = request.params;

    const result = await Business.findByIdAndUpdate(id, request.body);

    if (!result) {
      return response.status(404).json({ message: 'Contact not found' });
    }

    return response.status(200).send({ message: 'Contact updated successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
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
    response.status(500).send({ message: error.message });
  }
});

export default router;
