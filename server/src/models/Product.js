import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorProfile',
      required: [true, 'Vendor profile ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [2, 'Product name must be at least 2 characters long'],
      maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Product description cannot exceed 500 characters'],
      default: ''
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      default: null // Null indicates price-on-request or variable weight price
    },
    image: {
      type: String,
      default: ''
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound index to quickly fetch available products for a vendor
productSchema.index({ vendorId: 1, isAvailable: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
