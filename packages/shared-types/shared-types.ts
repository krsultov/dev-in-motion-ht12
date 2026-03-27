import type { ObjectId } from "mongodb";

export type MemoryEntry = {
  id: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
};

export type MemoryDoc = {
  _id: ObjectId;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
};

export type Contact = {
  id: string;
  name: string;
  role: string;
  phone: string;
};

export type Preference = {
  id: string;
  label: string;
  value: string;
};

export type Medication = {
  id: string;
  name: string;
  schedule: string;
};

export type UserMemory = {
  phone: string;
  password: string;
  name?: string;
  memories?: string[];
  contacts?: Contact[];
  preferences?: Preference[];
  medications?: Medication[];
  createdAt: string;
  updatedAt: string;
};

export type Reminder = {
  _id: ObjectId;
  userId: string;
  title: string;
  endTime: string;
  cron: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};


export type UserDataResponse = {
    _id: string;
    phone?: string;
    password?: string;
    name?: string;
    memories: unknown[];
    contacts: unknown[];
    preferences: unknown[];
    medications: unknown[];
    createdAt: string;
    updatedAt: string;
  };

export type ReminderDoc = {
    _id: ObjectId;
    userId: string;
    title: string;
    endTime: string;
    cron: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  };
  
  export type ReminderDTO = {
    _id: string;
    userId: string;
    title: string;
    endTime: string;
    cron: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  };

export type UserMemoryDoc = UserMemory & { _id: ObjectId };

export type UserMemoryDto = UserMemory & { _id: string };

//TODO:
//Read all Memories for a user
//Hash password
//Call when remainder starts