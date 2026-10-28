import mongoose from 'mongoose';

const defaultOpeningHours = [
  { day: 'Mon', open: '08:00', close: '20:00', isClosed: false },
  { day: 'Tue', open: '08:00', close: '20:00', isClosed: false },
  { day: 'Wed', open: '08:00', close: '20:00', isClosed: false },
  { day: 'Thu', open: '08:00', close: '20:00', isClosed: false },
  { day: 'Fri', open: '08:00', close: '20:00', isClosed: false },
  { day: 'Sat', open: '08:00', close: '20:00', isClosed: false },
  { day: 'Sun', open: '08:00', close: '20:00', isClosed: false }
];

const vendorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required'],
      unique: true,
      index: true
    },
    stallName: {
      type: String,
      required: [true, 'Please provide a stall or business name'],
      trim: true,
      minlength: [2, 'Stall name must be at least 2 characters long'],
      maxlength: [100, 'Stall name cannot exceed 100 characters']
    },
    stallType: {
      type: String,
      enum: {
        values: ['fixed', 'mobile'],
        message: 'Stall type must be either fixed or mobile'
      },
      default: 'fixed'
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [150, 'Tagline cannot exceed 150 characters'],
      default: ''
    },
    description: {
      type: String,
      required: [true, 'Please provide a business description'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      }
    ],
    photos: {
      type: [String],
      default: []
    },
    coverPhoto: {
      type: String,
      default: ''
    },
    contactPublic: {
      phone: {
        type: String,
        required: [true, 'Public contact phone is required'],
        trim: true
      },
      whatsapp: {
        type: String,
        trim: true,
        default: ''
      }
    },
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true
      },
      area: {
        type: String,
        required: [true, 'Locality or area name is required'],
        trim: true
      },
      city: {
        type: String,
        default: 'Ahmedabad',
        trim: true
      },
      state: {
        type: String,
        default: 'Gujarat',
        trim: true
      },
      postalCode: {
        type: String,
        trim: true,
        default: ''
      },
      landmark: {
        type: String,
        trim: true,
        default: ''
      }
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      // GeoJSON standard: [longitude, latitude]
      coordinates: {
        type: [Number],
        default: [72.55289, 23.03721]
      }
    },
    locationUpdatedAt: {
      type: Date,
      default: Date.now
    },
    openingHours: {
      type: [
        {
          day: { type: String, required: true },
          open: { type: String, default: '08:00' },
          close: { type: String, default: '20:00' },
          isClosed: { type: Boolean, default: false }
        }
      ],
      default: defaultOpeningHours
    },
    availabilityStatus: {
      type: String,
      enum: {
        values: ['open', 'away', 'closed'],
        message: 'Status must be open, away, or closed'
      },
      default: 'open',
      index: true
    },
    approvalStatus: {
      type: String,
      enum: {
        values: ['draft', 'pending', 'approved', 'rejected', 'changes_requested', 'suspended'],
        message: 'Approval status must be draft, pending, approved, rejected, changes_requested, or suspended'
      },
      default: 'pending',
      index: true
    },
    adminNote: {
      type: String,
      default: ''
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

// 2dsphere index for location queries
vendorProfileSchema.index({ location: '2dsphere' });

// Text index for keyword discovery
vendorProfileSchema.index({
  stallName: 'text',
  description: 'text',
  'address.area': 'text',
  'address.street': 'text'
});

const VendorProfile = mongoose.model('VendorProfile', vendorProfileSchema);

export default VendorProfile;
