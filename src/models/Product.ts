import mongoose, { Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  createdAt: Date;
}

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this product.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for this product.'],
    maxlength: [200, 'Description cannot be more than 200 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price for this product.'],
    maxlength: [5, 'Price cannot be more than 99999'],
  },
  image: {
    type: String,
    required: [true, 'Please provide an image for this product.'],
  },
  category: {
    type: String,
    required: [true, 'Please specify the category of this product.'],
  },
  stock: {
    type: Number,
    required: [true, 'Please specify the stock of this product.'],
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema); 