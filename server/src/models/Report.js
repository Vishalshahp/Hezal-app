import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: {
        values: ['vendor', 'product'],
        message: 'Report target must be either vendor or product'
      },
      required: [true, 'Target type is required']
    },
    targetVendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorProfile',
      required: [true, 'Target vendor profile is required'],
      index: true
    },
    targetProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null
    },
    reason: {
      type: String,
      enum: {
        values: [
          'inaccurate_location',
          'misleading_info',
          'inappropriate_content',
          'closed_stall',
          'stale_hours',
          'other'
        ],
        message: 'Invalid report reason'
      },
      required: [true, 'Report reason is required']
    },
    details: {
      type: String,
      required: [true, 'Please provide report details'],
      trim: true,
      maxlength: [1000, 'Details cannot exceed 1000 characters']
    },
    reporterName: {
      type: String,
      trim: true,
      default: 'Anonymous Shopper'
    },
    reporterEmail: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'under_review', 'resolved', 'dismissed'],
        message: 'Status must be open, under_review, resolved, or dismissed'
      },
      default: 'open',
      index: true
    },
    resolutionNote: {
      type: String,
      trim: true,
      default: ''
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
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

reportSchema.index({ status: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

export default Report;
