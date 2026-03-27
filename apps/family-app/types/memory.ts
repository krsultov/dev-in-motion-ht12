export type MemoryContact = {
  id: string;
  name: string;
  role: string;
  phone: string;
};

export type MemoryPreference = {
  id: string;
  label: string;
  value: string;
};

export type MemoryMedication = {
  id: string;
  name: string;
  schedule: string;
};

export type UserMemoryRecord = {
  _id: string;
  phone?: string;
  password?: string;
  name?: string;
  memories: string[];
  contacts: MemoryContact[];
  preferences: MemoryPreference[];
  medications: MemoryMedication[];
  createdAt: string;
  updatedAt: string;
};

export type UserMemoryRecordId = {
  _id: string;
};

export type CreateUserMemoryPayload = {
  phone: string;
  password?: string;
  name?: string;
  memories?: string[];
  contacts?: MemoryContact[];
  preferences?: MemoryPreference[];
  medications?: MemoryMedication[];
};

export type UpdateUserMemoryPayload = Partial<CreateUserMemoryPayload>;
