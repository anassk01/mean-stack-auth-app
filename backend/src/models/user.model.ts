// src/models/user.model.ts
import mongoose, { Document, Schema, Types } from 'mongoose';
import argon2 from 'argon2';

// Define MongoDB schema validation using JSON Schema
// This will be enforced at the database level
const userSchemaValidation = {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "password", "firstName", "lastName", "isVerified", "loginAttempts"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Email must be a valid email address format and is required"
        },
        password: {
          bsonType: "string",
          minLength: 12,
          description: "Password must be at least 12 characters and is required"
        },
        firstName: {
          bsonType: "string",
          minLength: 1,
          description: "First name is required"
        },
        lastName: {
          bsonType: "string",
          minLength: 1,
          description: "Last name is required"
        },
        isVerified: {
          bsonType: "bool",
          description: "Verification status must be a boolean"
        },
        loginAttempts: {
          bsonType: "int",
          minimum: 0,
          description: "Login attempts must be a non-negative integer"
        },
        lockUntil: {
          bsonType: ["date", "null"],
          description: "Lock until date if account is locked"
        },
        verificationToken: {
          bsonType: ["string", "null"],
          description: "Email verification token"
        },
        verificationExpires: {
          bsonType: ["date", "null"],
          description: "Expiration date for verification token"
        },
        resetPasswordToken: {
          bsonType: ["string", "null"],
          description: "Password reset token"
        },
        resetPasswordExpires: {
          bsonType: ["date", "null"],
          description: "Expiration date for password reset token"
        },
        refreshTokenId: {
          bsonType: ["string", "null"],
          description: "Current refresh token ID"
        }
      }
    }
  }
};

// Add this function to create the collection with validation
export const createUserCollection = async (): Promise<void> => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    // Check if the collection exists
    const collections = await db.listCollections({ name: 'users' }).toArray();
    
    // If it doesn't exist, create it with validation
    if (collections.length === 0) {
      await db.createCollection('users', userSchemaValidation);
      console.log('Users collection created with schema validation');
    } else {
      // If it exists but we want to update the validation schema
      await db.command({
        collMod: 'users',
        validator: userSchemaValidation.validator
      });
      console.log('Users collection validation schema updated');
    }
  } catch (error) {
    console.error('Error setting up collection validation:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
};

// User interface
export interface IUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  verificationToken?: string;
  verificationExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  refreshTokenId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Document interface for MongoDB - explicitly including _id field with correct type
export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
}

// User Schema
const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: (props: any) => `${props.value} is not a valid email!`
      }
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [12, 'Password must be at least 12 characters']
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: String,
    verificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,
    lastLogin: Date,
    refreshTokenId: String
  },
  {
    timestamps: true
  }
);

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  // Only hash the password if it's modified
  if (!this.isModified('password')) return next();
  
  try {
    // Using Argon2id with enhanced security parameters
    this.password = await argon2.hash(this.password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64MB
      timeCost: 3,
      parallelism: 1
    });
    return next();
  } catch (error) {
    return next(error instanceof Error ? error : new Error('Password hashing failed'));
  }
});

// Method to compare candidate password with stored hash
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await argon2.verify(this.password, candidatePassword);
  } catch (error) {
    return false;
  }
};

// Method to check if account is locked
UserSchema.methods.isLocked = function(): boolean {
  // Check for a lockUntil timestamp that is greater than the current time
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Method to increment login attempts
UserSchema.methods.incrementLoginAttempts = async function() {
  // If we have a previous lock that has expired, reset the attempts to 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Otherwise increment login attempts
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // Lock the account if we've reached max attempts (5)
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { 
      lockUntil: new Date(Date.now() + 30 * 60 * 1000) // Lock for 30 minutes
    };
  }
  
  return this.updateOne(updates);
};

export const User = mongoose.model<IUserDocument>('User', UserSchema);