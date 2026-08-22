import React, { useState } from 'react';
import { Input, Checkbox, Textarea, Button, Spacer } from '@nextui-org/react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/modal";
import { RadioGroup, Radio } from "@nextui-org/react";
interface FieldEditorProps {
    field: any;
    onSave: (updatedField: any) => void;
    onCancel: () => void;
}

const FieldEditor: React.FC<FieldEditorProps> = ({ field, onSave, onCancel }) => {
    const [editedField, setEditedField] = useState<any>(field);

    const handleChange = (name: string, value: string | boolean) => {
        setEditedField((prev: any) => ({ ...prev, [name]: value }));
    };


    const handleselect = (index: number, key: 'label' | 'value', newValue: string) => {
        const updatedOptions = [...editedField.option];
        updatedOptions[index][key] = newValue;
        console.log(updatedOptions);
        setEditedField({ ...editedField, option: updatedOptions });
    };

    const handleSave = () => {
        onSave(editedField);
    };
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    return (
        <Modal isOpen={true} onOpenChange={onOpenChange} size='3xl'>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Edit Field
                        </ModalHeader>
                        <ModalBody>
                            <input
                                className="w-full border border-gray-300 rounded-md"
                                value={editedField.field_name}
                                onChange={(e) => handleChange('field_name', e.target.value)}
                            />
                            <Spacer y={1} />

                            <select
                                value={editedField.input_type}
                                onChange={(e) => handleChange('input_type', e.target.value)} // Correct event handling
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
                                isSelected={editedField.is_required}
                                onChange={(e) => handleChange('is_required', e.target.checked)}
                            >
                                Required
                            </Checkbox>
                            <Spacer y={1} />
                            {(editedField.input_type === 'select' ||
                                editedField.input_type === 'checkbox' ||
                                editedField.input_type === 'radio') && (
                                    <div className="grid grid-cols-1 gap-2">
                                        {editedField.option?.length > 0 ? (
                                            editedField.option.map(
                                                (option: { label: string; value: number | string }, index: number) => (
                                                    <div key={index} className="flex gap-3">
                                                        <input
                                                            className="w-full border border-gray-300 rounded-md"
                                                            placeholder="Label"
                                                            value={option.label} // Correctly access the label property
                                                            onChange={(e) =>
                                                                handleselect(index, 'label', e.target.value) // Pass the index and key to handleChange
                                                            }
                                                        />
                                                        <input
                                                            className="w-full border border-gray-300 rounded-md"
                                                            placeholder="Value"
                                                            value={option.value} // Correctly access the value property
                                                            onChange={(e) =>
                                                                handleselect(index, 'value', e.target.value) // Pass the index and key to handleChange
                                                            }
                                                        />
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <div className="flex gap-3">
                                                <input
                                                    className="w-full border border-gray-300 rounded-md"
                                                    placeholder="Label"

                                                    onChange={(e) => handleselect(0, 'label', e.target.value)} // Provide a default index
                                                />
                                                <input
                                                    className="w-full border border-gray-300 rounded-md"
                                                    placeholder="Value"

                                                    onChange={(e) => handleselect(0, 'value', e.target.value)} // Provide a default index
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                        </ModalBody>
                        <ModalFooter className='flex justify-start gap-2'>
                            <button className="Close-btn" onClick={onCancel}>
                                Cancel
                            </button>
                            <button className="submit-btn" onClick={handleSave}>
                                Save
                            </button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal >
    );
};

export default FieldEditor;

