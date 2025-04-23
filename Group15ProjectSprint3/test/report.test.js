const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Item = require('../models/itemModel');
const User = require('../models/userModel');

describe('POST /items/:id/report', () => {
  let testItem;
  let testUser;

  beforeAll(async () => {
    testUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: `test+${Date.now()}@example.com`,
      password: 'password123'
    });

    testItem = await Item.create({
      title: 'Test Car',
      brand: 'Toyota',
      condition: 'Good',
      price: 5000,
      year: 2000,
      image: 'test.jpg',
      seller: testUser._id,
      active: true,
      reported: false
    });
    this.itemId = Item._id;
  });

  afterAll(async () => {
    await Item.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should mark the item as reported', async () => {
    const res = await request(app)
      .post(`/items/${testItem._id}/report`)
      .send();

    expect(res.status).toBe(200);

    const updatedItem = await Item.findById(testItem._id);
    expect(updatedItem.reported).toBe(true);
  });

  it('should return 404 for non-existent item', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/items/${fakeId}/report`)
      .send();

    expect(res.status).toBe(404);
  });
});