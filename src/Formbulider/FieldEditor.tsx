import React, { useState } from 'react';
import { Input, Checkbox, Textarea, Button, Spacer } from '@nextui-org/react';
import { Field, FieldType } from './types';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/modal";
import { RadioGroup, Radio } from "@nextui-org/react";
interface FieldEditorProps {
  field: Field;
  onSave: (updatedField: Field) => void;
  onCancel: () => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onSave, onCancel }) => {
  const [editedField, setEditedField] = useState<Field>(field);

  const handleChange = (name: string, value: string | boolean) => {
    setEditedField((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(editedField);
  };
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <Modal isOpen={true} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Edit Field
            </ModalHeader>
            <ModalBody>
              <input
                className="w-full border border-gray-300 rounded-md"
                value={editedField.label}
                onChange={(e) => handleChange('label', e.target.value)}
              />
              <Spacer y={1} />

              <select
                value={editedField.type}
                onChange={(e) => handleChange('type', e.target.value as FieldType)} // Correct event handling
                className="w-full border border-gray-300 rounded-md"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="email">Email</option>
                <option value="textarea">Textarea</option>
                <option value="select">Select</option>
                <option value="checkbox">Checkbox</option>
                <option value="radio">Radio</option>
              </select>

              <Checkbox
                isSelected={editedField.required}
                onChange={(checked: any) => handleChange('required', checked)}
              >
                Required
              </Checkbox>
              <Spacer y={1} />
              {(editedField.type === 'select' || editedField.type === 'checkbox' || editedField.type === 'radio') && (
                <textarea
                  className="w-full border border-gray-300 rounded-md"
                  placeholder="Options (comma-separated)"
                  value={editedField.options?.join(', ') || ''}
                  onChange={(e) =>
                    setEditedField((prev) => ({ ...prev, options: e.target.value.split(',').map((s) => s.trim()) }))
                  }
                />
              )}
            </ModalBody>
            <ModalFooter>
              <button className="Close-btn" onClick={onCancel}>
                Close
              </button>
              <button className="submit-btn" onClick={handleSave}>
                save
              </button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>

    // <Modal isOpen={true} onOpenChange={onOpenChange}>
    //   <ModalHeader>
    //     <h3>Edit Field</h3>
    //   </ModalHeader>
    //   <ModalBody>
    //     <input
    //       className="w-full border border-gray-300 rounded-md"
    //       value={editedField.label}
    //       onChange={(e) => handleChange('label', e.target.value)}
    //     />
    // <Spacer y={1} />
    // <RadioGroup
    //   label="Field Type"
    //   value={editedField.type}
    //   onChange={(value: any) => handleChange('type', value as FieldType)}
    // >
    //   <Radio value="text">Text</Radio>
    //   <Radio value="number">Number</Radio>
    //   <Radio value="email">Email</Radio>
    //   <Radio value="textarea">Textarea</Radio>
    //   <Radio value="select">Select</Radio>
    //   <Radio value="checkbox">Checkbox</Radio>
    //   <Radio value="radio">Radio</Radio>
    // </RadioGroup >
    // <Spacer y={1} />
    // <Checkbox
    //   isSelected={editedField.required}
    //   onChange={(checked: any) => handleChange('required', checked)}
    // >
    //   Required
    // </Checkbox>
    // <Spacer y={1} />
    // {(editedField.type === 'select' || editedField.type === 'checkbox' || editedField.type === 'radio') && (
    //   <Textarea
    //     fullWidth
    //     label="Options (comma-separated)"
    //     value={editedField.options?.join(', ') || ''}
    //     onChange={(e) =>
    //       setEditedField((prev) => ({ ...prev, options: e.target.value.split(',').map((s) => s.trim()) }))
    //     }
    //   />
    // )}
    //   </ModalBody>
    //   <ModalFooter>
    //     <Button className='submit-btn' onClick={onCancel}>
    //       Cancel
    //     </Button>
    //     <Button className='Close-btn' onClick={handleSave}>
    //       Save
    //     </Button>
    //   </ModalFooter>
    // </Modal>
  );
};

export default FieldEditor;

