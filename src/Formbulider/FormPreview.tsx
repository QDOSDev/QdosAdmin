import React, { useState, useReducer } from 'react';
import { RadioGroup, Input, Textarea, Checkbox, Radio, Button, Spacer } from '@nextui-org/react';
import { Form, Field } from './types';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/modal";
import { Edit, X } from 'lucide-react';
import FieldEditor from './FieldEditor';
type FormAction =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'ADD_SECTION'; payload: string }
  | { type: 'ADD_FIELD'; payload: { sectionId: string; field: Field } }
  | { type: 'UPDATE_FIELD'; payload: { sectionId: string; fieldId: string; field: Partial<Field> } }
  | { type: 'DELETE_FIELD'; payload: { sectionId: string; fieldId: string } }
  | { type: 'UPDATE_SECTION_TITLE'; payload: { sectionId: string; title: string } }
  | { type: 'TOGGLE_EDIT_SECTION'; payload: { sectionId: string; isEditing: boolean } };

const formReducer = (state: Form, action: FormAction): Form => {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'ADD_SECTION':
      return {
        ...state,
        sections: [...state.sections, { id: uuidv4(), title: action.payload, fields: [], isEditing: false }],
      };
    case 'UPDATE_SECTION_TITLE':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId
            ? { ...section, title: action.payload.title }
            : section
        ),
      };
    case 'TOGGLE_EDIT_SECTION':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId
            ? { ...section, isEditing: action.payload.isEditing }
            : section
        ),
      };
    case 'ADD_FIELD':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId
            ? { ...section, fields: [...section.fields, action.payload.field] }
            : section
        ),
      };
    case 'UPDATE_FIELD':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId
            ? {
              ...section,
              fields: section.fields.map((field) =>
                field.id === action.payload.fieldId
                  ? { ...field, ...action.payload.field }
                  : field
              ),
            }
            : section
        ),
      };
    case 'DELETE_FIELD':
      return {
        ...state,
        sections: state.sections.map((section) =>
          section.id === action.payload.sectionId
            ? {
              ...section,
              fields: section.fields.filter((field) => field.id !== action.payload.fieldId),
            }
            : section
        ),
      };
    default:
      return state;
  }
};

const initialForm: Form = {
  id: uuidv4(),
  name: '',
  description: '',
  sections: [],
};

const FormPreview: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [form, dispatch] = useReducer(formReducer, initialForm);
  const [editingField, setEditingField] = useState<{ sectionId: string; field: Field } | null>(null);
  const handleAddSection = (sectionTitle: string) => {
    if (sectionTitle) {
      dispatch({ type: 'ADD_SECTION', payload: sectionTitle });
    }
  };
  const handleUpdateField = (sectionId: string, fieldId: string, updatedField: Partial<Field>) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { sectionId, fieldId, field: updatedField } });
    setEditingField(null);
  };

  const handleDeleteField = (sectionId: string, fieldId: string) => {
    dispatch({ type: 'DELETE_FIELD', payload: { sectionId, fieldId } });
  };

  const handleAddField = (sectionId: string) => {
    const newField: Field = {
      id: uuidv4(),
      label: 'New Field',
      type: 'text', // Default type, you can change this as needed
      required: false,
      options: [],
    };
    dispatch({ type: 'ADD_FIELD', payload: { sectionId, field: newField } });
    setEditingField({ sectionId, field: newField });
  };

  const renderField = (field: Field, sectionid: any) => {
    switch (field.type) {
      case 'text':
      case 'number':
      case 'email':
        return (
          <>
            <div className='flex items-center'>
              <input
                className='w-full border border-gray-300 rounded-md'
                placeholder={field.label}
                type={field.type}
                id={field.id}
                name={field.id}
                required={field.required}
              />
              <span className='flex relative right-[55px]'>
                <Edit strokeWidth={1} size={20} className="mr-2" onClick={() => setEditingField({ sectionId: field.id, field })} />
                <X strokeWidth={1} size={20} className="mr-2" onClick={() => handleDeleteField(sectionid, field.id)} />
              </span>
            </div>
          </>
        );
      case 'textarea':
        return (
          <>
            <textarea
              className='w-full border border-gray-300 rounded-md'
              placeholder={field.label}
              id={field.id}
              name={field.id}
              required={field.required}
            />


          </>
        );
      case 'select':
        return (
          <select
            className='w-full border border-gray-300 rounded-md'
            id={field.id}
            name={field.id}
            required={field.required}
            style={{ width: '100%', padding: '8px', borderRadius: '5px' }}
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div>
            {field.options?.map((option) => (
              <Checkbox key={option} value={option}>
                {option}
              </Checkbox>
            ))}
          </div>
        );
      case 'radio':
        return (
          <RadioGroup label={field.label} name={field.id}>
            {field.options?.map((option) => (
              <Radio key={option} value={option}>
                {option}
              </Radio>
            ))}
          </RadioGroup>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <CardBody>
          <h2>Form Preview</h2>
          <div className="addMore mb-2 underline underline-offset-4 decoration-dotted decoration-blue-500 decoration-2 cursor-pointer">
            <span onClick={onOpen}>
              Add Form
            </span>
          </div>
          <Spacer y={1} />
          {form.sections.map((section) => (
            <Card key={section.id} className='rounded-[10px] p-2 mb-2'>
              <div className="title border-b pb-2 w-full flex justify-between">
                {section.isEditing ? (
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      dispatch({
                        type: 'UPDATE_SECTION_TITLE',
                        payload: { sectionId: section.id, title: e.target.value },
                      })
                    }
                    onBlur={() =>
                      dispatch({
                        type: 'TOGGLE_EDIT_SECTION',
                        payload: { sectionId: section.id, isEditing: false },
                      })
                    }
                    className="text-[12px] border-b-2 p-1 border-gray-300 focus:outline-none bordered-none"
                    autoFocus
                  />
                ) : (
                  <>
                    <span
                      className="text-[12px] cursor-pointer"
                      onClick={() =>
                        dispatch({
                          type: 'TOGGLE_EDIT_SECTION',
                          payload: { sectionId: section.id, isEditing: true },
                        })
                      }
                    >
                      {section.title || 'Untitled'}
                    </span>
                    <Edit strokeWidth={1} size={20} className="mr-2"
                      onClick={() =>
                        dispatch({
                          type: 'TOGGLE_EDIT_SECTION',
                          payload: { sectionId: section.id, isEditing: true },
                        })
                      }
                    />
                  </>
                )}

              </div>
              <CardBody>
                <div className='grid grid-cols-2 gap-5'>
                  {section.fields.map((field) => (
                    <div key={field.id}>
                      {renderField(field, section.id)}
                      <Spacer y={1} />
                    </div>
                  ))}
                </div>
              </CardBody>
              <CardFooter>
                <span className='text-[12px] text-blue-900 underline cursor-pointer' onClick={() => handleAddField(section.id)}>Add New Input</span>
              </CardFooter>
            </Card>
          ))}
          <Spacer y={1} />
          <div className="addMore mb-2 underline underline-offset-4 decoration-dotted decoration-blue-500 decoration-2 cursor-pointer">
            <span onClick={() => handleAddSection('Untitled')}>
              Add Section
            </span>
          </div>
          <button className='submit-btn'>Submit</button>
        </CardBody>
      </Card>

      {editingField && (
        <FieldEditor
          field={editingField.field}
          onSave={(updatedField) =>
            handleUpdateField(editingField.sectionId, editingField.field.id, updatedField)
          }
          onCancel={() => setEditingField(null)}
        />
      )}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Form details</ModalHeader>
              <ModalBody>
                <div className='grid gap-3'>
                  <input type="text" className="w-full border border-gray-300 rounded-md" placeholder="Enter form name" />
                  <input type="text" className="w-full border border-gray-300 rounded-md" placeholder="Enter form title" />

                  <input type="text" className="w-full border border-gray-300 rounded-md" placeholder="Enter form description" />
                </div>
              </ModalBody>
              <ModalFooter>
                <button className="Close-btn" onClick={onClose}>
                  Cancel
                </button>
                <button className="submit-btn" onClick={onClose}>
                  Add
                </button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default FormPreview;