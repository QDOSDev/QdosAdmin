import React, { useState, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Input, Textarea, Button, Spacer } from '@nextui-org/react';
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Form, Section, Field } from './types';
import FieldEditor from './FieldEditor';
import FormPreview from './FormPreview';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@nextui-org/modal";
type FormAction =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'ADD_SECTION'; payload: string }
  | { type: 'ADD_FIELD'; payload: { sectionId: string; field: Field } }
  | { type: 'UPDATE_FIELD'; payload: { sectionId: string; fieldId: string; field: Partial<Field> } }
  | { type: 'DELETE_FIELD'; payload: { sectionId: string; fieldId: string } };

const formReducer = (state: Form, action: FormAction): Form => {



  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'ADD_SECTION':
      return {
        ...state,
        sections: [...state.sections, { id: uuidv4(), title: action.payload, fields: [] }],
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

const FormBuilder: React.FC = () => {
  const [sectionTitle, setSectionTitle] = useState('');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [form, dispatch] = useReducer(formReducer, initialForm);
  const [editingField, setEditingField] = useState<{ sectionId: string; field: Field } | null>(null);


  const handleInputChange = (e: any) => {
    setSectionTitle(e.target.value); // Update state on input change
  };

  const handleAddSection = (sectionTitle: string) => {
    if (sectionTitle) {
      dispatch({ type: 'ADD_SECTION', payload: sectionTitle });
      setSectionTitle('');
      onOpenChange();
    }
  };

  const handleAddField = (sectionId: string) => {
    const newField: Field = {
      id: uuidv4(),
      type: 'text',
      label: 'New Field',
      required: false,
    };
    dispatch({ type: 'ADD_FIELD', payload: { sectionId, field: newField } });
    setEditingField({ sectionId, field: newField });
  };

  const handleUpdateField = (sectionId: string, fieldId: string, updatedField: Partial<Field>) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { sectionId, fieldId, field: updatedField } });
    setEditingField(null);
  };

  const handleDeleteField = (sectionId: string, fieldId: string) => {
    dispatch({ type: 'DELETE_FIELD', payload: { sectionId, fieldId } });
  };

  const handleSaveForm = async () => {
    try {
      const response = await fetch('/api/save-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        alert('Form saved successfully!');
      } else {
        throw new Error('Failed to save form');
      }
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form. Please try again.');
    }
  };

  return (
    <>

      {/* <div className="grid grid-rows-2 grid-flow-col gap-4">
        <div className="row-span-3">
          <Card>
            <CardBody>
              <input
                placeholder='Form name'
                className="w-full border border-gray-300 rounded-md"
                type='text'
                value={form.name}
                onChange={(e) => dispatch({ type: 'SET_NAME', payload: e.target.value })}
              />
              <Spacer y={1} />
              <textarea
                placeholder='Form Description'
                rows={3}
                value={form.description}
                onChange={(e) => dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })}
                className="w-full border border-gray-300 rounded-md"
              />
              <Spacer y={1} />
              <button onClick={onOpen} className='submit-btn'>
                Add Section
              </button>
            </CardBody>
          </Card>



          <Spacer y={1} />


        </div>
        <div className="col-span-2 ">
          <FormPreview form={form} />
        </div>
      </div> */}
      {/* <FormPreview form={form} /> */}

      {/* {form.sections.map((section) => (
        <Card key={section.id}>
          <CardBody>
            <h3>{section.title}</h3>
            {section.fields.map((field) => (
              <Card key={field.id} >
                <CardBody>
                  <h4>{field.label}</h4>
                  <Button
                    className='submit-btn'
                    size="sm"
                    color="warning"
                    onClick={() => setEditingField({ sectionId: section.id, field })}
                  >
                    Edit
                  </Button>
                  <Spacer x={0.5} />
                  <Button
                    size="sm"
                    className='Close-btn'
                    onClick={() => handleDeleteField(section.id, field.id)}
                  >
                    Delete
                  </Button>
                </CardBody>
              </Card>
            ))}
            <Spacer y={1} />
            <Button color="success" onClick={() => handleAddField(section.id)}>
              Add Field
            </Button>
          </CardBody>
        </Card>
      ))}
      <Spacer y={1} />
      <button className="submit-btn" onClick={handleSaveForm}>
        Save Form
      </button>
      {editingField && (
        <FieldEditor
          field={editingField.field}
          onSave={(updatedField) =>
            handleUpdateField(editingField.sectionId, editingField.field.id, updatedField)
          }
          onCancel={() => setEditingField(null)}
        />
      )}
      <Spacer y={2} /> */}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Add Title</ModalHeader>
              <ModalBody>
                <input type="text" className="w-full border border-gray-300 rounded-md" placeholder="Enter section title" value={sectionTitle}
                  onChange={handleInputChange} />
              </ModalBody>
              <ModalFooter>
                <button className='Close-btn' onClick={onClose}>
                  Cancel
                </button>
                <button className='submit-btn' onClick={() => handleAddSection(sectionTitle)}>
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

export default FormBuilder;

