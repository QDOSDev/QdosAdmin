import React, { useState, useEffect } from 'react'
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { RadioGroup, Input, Textarea, Checkbox, Radio, Button, Spacer, Badge, Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import Form_loader from '../View/form_Skeleton';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { EllipsisVertical, Undo, Redo } from 'lucide-react';
import FieldEditor from './FieldEditor';
import { ChevronDown, Grip } from 'lucide-react';
import { useDrag, useDrop } from 'react-dnd';
type ExpandedSections = {
    [key: string]: boolean;
};

interface YourComponentProps {
    section: string;
    openModal: (inputType: string, sectionId: string) => void;
}

export default function form_view() {
    const { formId } = useParams();
    const [loader, setLoader] = useState(false);
    const [editingField, setEditingField]: any = useState(null);
    const [formData, setFormData]: any = useState([]);
    const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
    const [newSectionName, setNewSectionName] = useState('');
    const [sections, setSections] = useState<any[]>([]);
    const [undoStack, setUndoStack] = useState<any[]>([]);
    const [redoStack, setRedoStack] = useState<any[]>([]);
    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get('token');
    const [animatingSection, setAnimatingSection] = useState<number | null>(null);

    // Fetch form data
    const FormDataGet = async () => {
        setLoader(true);
        try {
            const { data } = await axios.get(`${endpoint}?route=Form/view/data/get&formId=` + formId, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            setFormData(data);
            setSections(data?.info?.Section || []);

            setLoader(false);
        } catch (error) {
            toast.error('Something went wrong fetching roles!');
            setLoader(false);
        }
    };

    useEffect(() => {
        FormDataGet();
    }, []);

    const handleDeleteField = (fieldId: string) => {
        saveState();
        const updatedSections = sections.map((section) => ({
            ...section,
            // Define the type of 'input' as Field
            Inputs: section.Inputs.filter((input: any) => input.id !== fieldId), // Remove the field from Inputs
        }));

        // Update sections and formData state
        setSections(updatedSections);
        setFormData({
            ...formData,
            info: {
                ...formData.info,
                Section: updatedSections, // Update the section data in formData
            },
        });
    };


    const saveState = () => {
        setUndoStack((prev) => [...prev, { formData, sections }]);
        setRedoStack([]);
    };

    const undo = () => {
        if (undoStack.length === 0) return;

        const previousState = undoStack[undoStack.length - 1];
        setRedoStack((prev) => [...prev, { formData, sections }]);
        setFormData(previousState.formData);
        setSections(previousState.sections);
        setUndoStack((prev) => prev.slice(0, -1));
    };

    const redo = () => {
        if (redoStack.length === 0) return;

        const nextState = redoStack[redoStack.length - 1];
        setUndoStack((prev) => [...prev, { formData, sections }]); // Save current state to undo stack
        setFormData(nextState.formData); // Restore next state
        setSections(nextState.sections);
        setRedoStack((prev) => prev.slice(0, -1)); // Remove the last state from the redo stack
    };

    // Add Section
    const handleAddSection = () => {
        saveState(); // Save current state before making changes
        const newSection = {
            id: Date.now(), // Temporary ID
            section_name: 'New Section',
            Inputs: [],
        };
        const updatedSections = [...sections, newSection];
        setSections(updatedSections);
        setFormData({ ...formData, info: { ...formData.info, Section: updatedSections } });
    };

    const handleSaveSectionName = (sectionId: number) => {
        const targetSection = sections.find((section) => section.id === sectionId);
        if (targetSection && targetSection.section_name !== newSectionName.trim()) {
            saveState();
        }

        const updatedSections = sections.map((section) =>
            section.id === sectionId ? { ...section, section_name: newSectionName } : section
        );
        setSections(updatedSections);
        setFormData({ ...formData, info: { ...formData.info, Section: updatedSections } });
        setEditingSectionId(null);
        setNewSectionName('');
    };

    const handleInputChange = (value: string) => {
        setNewSectionName(value);
    };

    // Add Field
    const handleAddField = (sectionId: number) => {
        saveState();
        const newField = {
            id: Date.now(),
            field_name: 'New Field',
            input_type: 'text',
            is_required: false,
            option: [],
        };

        const updatedSections = sections.map((section) =>
            section.id === sectionId
                ? { ...section, Inputs: [...section.Inputs, newField] }
                : section
        );
        setEditingField(newField);
        setSections(updatedSections);
        setFormData({ ...formData, info: { ...formData.info, Section: updatedSections } });
    };

    // Delete Section
    const handleDeleteSection = (sectionId: number) => {
        saveState(); // Save current state before making changes
        setAnimatingSection(sectionId);

        // Wait for animation to complete
        setTimeout(() => {
            const updatedSections = sections.map((section) =>
                section.id === sectionId ? { ...section, is_readable: 0 } : section
            );
            setSections(updatedSections);
            setFormData({ ...formData, info: { ...formData.info, Section: updatedSections } });
            setAnimatingSection(null); // Reset animating state
        }, 500);
    };
    const handleSubmit = async () => {
        console.log('Updated form data:', formData);
    }

    const renderField = (field: any, sectionedit: any) => {
        switch (field.input_type) {
            case 'text':
            case 'number':
            case 'email':
            case 'date':
                return (
                    <>
                        <div className='flex justify-between'>
                            <label className=''>{field.field_name} {field.is_required ? <span className="text-red-500">*</span> : ''}</label>
                            {sectionedit == 0 ? '' :
                                <Dropdown>
                                    <DropdownTrigger>
                                        <EllipsisVertical />
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Static Actions"
                                        className="mb-2 underline underline-offset-4 decoration-dotted decoration-blue-500 decoration-2 cursor-pointer"
                                    >
                                        <DropdownItem key={field.id} onClick={() => setEditingField(field)}>
                                            Edit
                                        </DropdownItem>
                                        <DropdownItem
                                            key={field.id}
                                            className="text-danger"
                                            color="danger"
                                            onClick={() => handleDeleteField(field.id)} // Handle delete action
                                        >
                                            Delete
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            }
                        </div>
                        <div className='flex items-center'>
                            <input
                                className='w-full border border-gray-300 rounded-md'
                                placeholder={field.field_name}
                                type={field.input_type}
                                id={field.id}
                                name={field.id}
                                defaultValue={field.default_value || ''}
                                required={field.is_required}
                            />
                        </div>
                    </>
                );
            case 'textarea':
                return (
                    <>
                        <div className='flex justify-between'>
                            <label className=''>{field.field_name} {field.is_required ? <span className="text-red-500">*</span> : ''}</label>
                            {sectionedit == 0 ? '' :
                                <Dropdown>
                                    <DropdownTrigger>
                                        <EllipsisVertical />
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Static Actions"
                                        className="mb-2 underline underline-offset-4 decoration-dotted decoration-blue-500 decoration-2 cursor-pointer"
                                    >
                                        <DropdownItem key={field.id} onClick={() => setEditingField(field)}>
                                            Edit
                                        </DropdownItem>
                                        <DropdownItem
                                            key={field.id}
                                            className="text-danger"
                                            color="danger"
                                            onClick={() => handleDeleteField(field.id)} // Handle delete action
                                        >
                                            Delete
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            }
                        </div>
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
                    <>
                        <div className='flex justify-between'>
                            <label className=''>{field.field_name} {field.is_required ? <span className="text-red-500">*</span> : ''}</label>
                            {sectionedit == 0 ? '' :
                                <Dropdown>
                                    <DropdownTrigger>
                                        <EllipsisVertical />
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        aria-label="Static Actions"
                                        className="mb-2 underline underline-offset-4 decoration-dotted decoration-blue-500 decoration-2 cursor-pointer"
                                    >
                                        <DropdownItem key={field.id} onClick={() => setEditingField(field)}>
                                            Edit
                                        </DropdownItem>
                                        <DropdownItem
                                            key={field.id}
                                            className="text-danger"
                                            color="danger"
                                            onClick={() => handleDeleteField(field.id)} // Handle delete action
                                        >
                                            Delete
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            }
                        </div>
                        <select
                            className='w-full border border-gray-300 rounded-md'
                            id={field.id}
                            name={field.id}
                            required={field.required}
                            defaultValue={field.default_value || ''}
                        >
                            <option key='' value=''>Select {field.field_name}</option>
                            {field.option?.map((option: { label: string, value: number | string }) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </>
                );
            case 'checkbox':
                return (
                    <div>
                        {field.options?.map((option: any) => (
                            <Checkbox key={option} value={option}>
                                {option}
                            </Checkbox>
                        ))}
                    </div>
                );
            case 'radio':
                return (
                    <RadioGroup label={field.label} name={field.id}>
                        {field.options?.map((option: any) => (
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

    const [items, setItems] = useState<any[]>([]);
    useEffect(() => {
        setItems(sections);
    }, [sections]);

    const [expandedSections, setExpandedSections] = useState<ExpandedSections>({});

    useEffect(() => {
        if (sections?.length > 0) {
            const collapsedSections = sections.reduce((acc, section) => ({
                ...acc,
                [section.id]: true,
            }), {});
            setExpandedSections(collapsedSections);
        }
    }, [sections]);



    const [draggingIndex, setDraggingIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [lastExpandedState, setLastExpandedState] = useState({});

    const handleDragStart = (e: any, index: any) => {
        setLastExpandedState(expandedSections);
        const allCollapsed = Object.keys(expandedSections).reduce((acc, key) => ({
            ...acc,
            [key]: false
        }), {});
        setExpandedSections(allCollapsed);
        e.dataTransfer.setData('text/plain', index.toString());
        setDraggingIndex(index);
        setIsDragging(true);

    };

    const handleDragEnd = () => {
        // If drag is cancelled (not dropped), restore previous state
        setExpandedSections(lastExpandedState);
        setDraggingIndex(null);
        setDragOverIndex(null);
        setIsDragging(false);
    };

    const handleDragOver = (e: any, index: any) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDrop = (e: any, index: any) => {
        e.preventDefault();
        const startIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (startIndex === index) {
            // If dropped in same position, restore previous state
            setExpandedSections(lastExpandedState);
            setDraggingIndex(null);
            setDragOverIndex(null);
            setIsDragging(false);
            return;
        }

        const updatedSections = [...sections];
        const [movedSection] = updatedSections.splice(startIndex, 1);
        updatedSections.splice(index, 0, movedSection);

        setSections(updatedSections);

        // Restore the previous expanded states after successful drop
        setTimeout(() => {
            setExpandedSections(lastExpandedState);
        }, 300);

        setDraggingIndex(null);
        setDragOverIndex(null);
        setIsDragging(false);
    };

    const toggleAccordion = (sectionId: any) => {
        if (!isDragging) {
            setExpandedSections((prev: any) => ({
                ...prev,
                [sectionId]: !prev[sectionId]
            }));
        }
    };

    return (
        <>
            {!loader ? (
                <Card>
                    <CardBody>
                        <div className='flex justify-between'>
                            <h2 className="uppercase text-xl">{formData?.info?.form_title}</h2>
                            <div className='flex gap-3'>
                                <Badge color="primary" content={undoStack.length}>
                                    <Button onClick={undo} disabled={undoStack.length === 0} className='lightgray-color'>
                                        <Undo />
                                    </Button>
                                </Badge>
                                <Badge color="primary" content={redoStack.length}>
                                    <Button onClick={redo} disabled={redoStack.length === 0} className='lightgray-color'>
                                        <Redo />
                                    </Button>
                                </Badge>
                            </div>
                        </div>
                        <Spacer y={1} />
                        <div id="DragContent" className="space-y-2">
                            {sections.map((section, index) => (
                                <div
                                    id={`DragItem_${index + 1}`}
                                    key={section?.id}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    className={`
                                        section
                                        transition-all duration-300 ease-in-out
                                        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
                                        ${dragOverIndex === index ? 'border-2 border-blue-500 rounded-lg' : ''}
                                        ${draggingIndex === index ? 'opacity-50' : 'opacity-100'}
                                        ${animatingSection === section.id ? 'disintegrate' : ''}
                                    `}
                                >
                                    {section?.is_readable !== 0 && (
                                        <Card className={`
                                            rounded-lg
                                            ${isDragging ? 'transform scale-98' : ''}
                                            transition-transform duration-200
                                            `}>
                                            <div
                                                className={`
                                                    title border-b p-4 w-full flex justify-between items-center
                                                    ${!isDragging ? 'cursor-pointer' : 'cursor-grabbing'}
                                                    `}

                                            >
                                                {editingSectionId === section.id ? (
                                                    <>
                                                        <div className='edit-section-title'>
                                                            <input
                                                                type="text"
                                                                value={newSectionName}
                                                                onChange={(e) => setNewSectionName(e.target.value)} // Update the section name as the user types
                                                                className="border border-gray-300 rounded-md p-1"
                                                            />
                                                            <button
                                                                className="text-blue-500 underline ml-2"
                                                                onClick={() => handleSaveSectionName(section.id)} // Save the changes when clicked
                                                            >
                                                                Save
                                                            </button>

                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className='flex items-center'>
                                                            <span
                                                                className={`cursor-pointer ${section.is_editable === 0 ? 'pointer-events-none' : ''}`}
                                                                onClick={
                                                                    section.is_editable === 0
                                                                        ? () => { }
                                                                        : () => {
                                                                            setNewSectionName(section.section_name || '');
                                                                            setEditingSectionId(section.id);
                                                                        }
                                                                }
                                                            >
                                                                {section.section_name || 'Untitled'}
                                                            </span>


                                                            <span className="text-sm text-gray-500 ml-2">({section.Inputs.length} fields)</span>
                                                            {section.is_deletable == 0 ? '' :
                                                                <span className="ml-2 text-danger underline underline-offset-4 decoration-dotted decoration-red-500 decoration-2 cursor-pointer" onClick={() => handleDeleteSection(section.id)}>delete</span>
                                                            }
                                                        </div>

                                                        <div className='flex items-center gap-3'>
                                                            <ChevronDown
                                                                onClick={() => toggleAccordion(section.id)}
                                                                className={`
                                                                transform transition-transform duration-200
                                                                ${expandedSections[section.id] ? 'rotate-180' : ''}
                                                                ${isDragging ? 'opacity-50' : ''}
                                                            `}
                                                            />

                                                            <div
                                                                className='cursor-move'
                                                                draggable
                                                                onDragStart={(e) => handleDragStart(e, index)}
                                                                onDragEnd={handleDragEnd}
                                                                data-index={index}
                                                            >
                                                                <Grip />
                                                            </div>
                                                        </div>
                                                    </>

                                                )}

                                            </div>

                                            <div
                                                className={`
                                                transition-all duration-300 ease-in-out
                                                overflow-hidden
                                                ${expandedSections[section.id] ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
                                                `}
                                            >
                                                <CardBody>
                                                    <div className="grid grid-cols-4 gap-5">
                                                        {section.Inputs.map((input: any) => (
                                                            <div key={input.id}>
                                                                {renderField(input, section.is_editable)}
                                                                <Spacer y={1} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardBody>

                                                {section.is_editable !== 0 && (
                                                    <CardFooter>

                                                        <span className="mb-2 underline underline-offset-4 decoration-dotted decoration-blue-500 decoration-2 cursor-pointer" onClick={() => handleAddField(section.id)}>
                                                            Add New Input
                                                        </span>
                                                    </CardFooter>


                                                )}
                                            </div>
                                        </Card>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Spacer y={1} />
                        <div
                            className="addMore mb-5 underline underline-offset-4 decoration-dotted decoration-blue-500 decoration-2 cursor-pointer"
                            onClick={handleAddSection}
                        >
                            Add Section
                        </div>

                    </CardBody>
                </Card>
            ) : (
                <Form_loader />
            )}
            {editingField && (
                <FieldEditor
                    field={editingField}
                    onSave={(updatedField) => {
                        saveState();
                        const updatedSections = sections.map((section) => ({
                            ...section,
                            Inputs: section.Inputs.map((input: any) =>
                                input.id === updatedField.id ? updatedField : input
                            ),
                        }));
                        setSections(updatedSections);
                        setFormData({ ...formData, info: { ...formData.info, Section: updatedSections } });
                        setEditingField(null);
                    }}
                    onCancel={() => setEditingField(null)}
                />
            )}


        </>
    )
}