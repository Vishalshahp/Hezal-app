import mongoose from 'mongoose';

const otpVerificationSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true
    },
    otpHash: {
      type: String,
      required: [true, 'OTP hash is required']
    },
    purpose: {
      type: String,
      enum: ['registration', 'login', 'password_reset', 'verification'],
      default: 'registration'
    },
    verificationToken: {
      type: String,
      default: null,
      index: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    verified: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // MongoDB TTL index: automatically deletes document once expired
    }
  },
  {
    timestamps: true
  }
);

// Compound index to quickly find the latest active OTP for a given phone and purpose
otpVerificationSchema.index({ phone: 1, purpose: 1, createdAt: -1 });

const OtpVerification = mongoose.model('OtpVerification', otpVerificationSchema);

export default OtpVerification;
