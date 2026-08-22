export type FieldType = 'text' | 'number' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio';

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[]; // For select, checkbox, and radio fields
}

export interface Section {
  id: string;
  title: string;
  fields: Field[];
  isEditing?: boolean;
}

export interface Form {
  id: string;
  name: string;
  description: string;
  sections: Section[];
}

