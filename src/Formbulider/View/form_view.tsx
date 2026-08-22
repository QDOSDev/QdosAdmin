import React, { useState, useEffect } from 'react'
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { RadioGroup, Input, Textarea, Checkbox, Radio, Button, Spacer } from '@nextui-org/react';
import Form_loader from './form_Skeleton';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
export default function form_view() {
    const { formId } = useParams();
    const [loader, setloder] = useState(false);
    const [formdata, setformdata]: any = useState([]);
    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get('token')
    const FormDataGet = async (forceReload = false) => {
        setloder(true);
        try {
            const { data } = await axios.get(`${endpoint}?route=Form/view/data/get&formId=` + formId, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            setformdata(data);
            setloder(false);
        } catch (error) {
            toast.error('Something went wrong fetching roles!');
        }
    };

    useEffect(() => {
        FormDataGet();
    }, []);

    // funcation to render field
    const renderField = (field: any, sectionid: any) => {
        switch (field.input_type) {
            case 'text':
            case 'number':
            case 'email':
            case 'date':
                return (
                    <>
                        <label className=''>{field.field_name} {field.is_required ? <span className="text-red-500">*</span> : ''}</label>
                        <div className='flex items-center'>
                            <input
                                className='w-full border border-gray-300 rounded-md'
                                placeholder={field.field_name}
                                type={field.input_type}
                                id={field.id}
                                name={field.id}
                                required={field.is_required}
                            />
                        </div>
                    </>
                );
            case 'textarea':
                return (
                    <>
                        <label className=''>{field.field_name}</label>
                        <textarea
                            className='w-full border border-gray-300 rounded-md'
                            placeholder={field.label}
                            id={field.id}
                            name={field.id}
                            required={field.is_required}
                        />


                    </>
                );
            case 'select':
                return (
                    <>
                        <label className=''>{field.field_name} {field.is_required ? <span className="text-red-500">*</span> : ''}</label>
                        <select
                            className='w-full border border-gray-300 rounded-md'
                            id={field.id}
                            name={field.id}
                            required={field.is_required}
                            defaultValue={field.default_value || ''}
                        >
                            <option value="">Select an option</option>
                            {field.option?.map((option: { label: string; value: string | number }) => (
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
                        {/* {field.options?.map((option) => (
                            <Checkbox key={option} value={option}>
                                {option}
                            </Checkbox>
                        ))} */}
                    </div>
                );
            case 'radio':
                return (
                    <RadioGroup label={field.label} name={field.id}>
                        {/* {field.options?.map((option) => (
                            <Radio key={option} value={option}>
                                {option}
                            </Radio>
                        ))} */}
                    </RadioGroup>
                );
            default:
                return null;
        }
    };



    return (
        <>



            {loader == false ? <>
                <form>
                    <Card>
                        <CardBody>
                            <h2 className='uppercase text-xl'>{formdata?.info?.form_title}</h2>
                            <Spacer y={1} />
                            {/* {formdata?.info?.Section} */}
                            {formdata?.info?.Section.map((section: any) => (
                                <Card key={section.id} className='rounded-[10px] p-2 mb-2'>
                                    <div className="title border-b pb-2 w-full flex justify-between">
                                        <>
                                            <span
                                                className=""
                                            >
                                                {section.section_name || 'Untitled'}
                                            </span>
                                        </>
                                    </div>
                                    <CardBody>
                                        <div className='grid grid-cols-4 gap-5'>
                                            {section.Inputs.map((Inputs: any) => (
                                                <div key={Inputs.id}>
                                                    {renderField(Inputs, section.id)}
                                                    <Spacer y={1} />
                                                </div>
                                            ))}
                                        </div>
                                    </CardBody>
                                    <CardFooter>
                                        {/* <span className='text-[12px] text-blue-900 underline cursor-pointer' onClick={() => handleAddField(section.id)}>Add New Input</span> */}
                                    </CardFooter>
                                </Card>
                            ))}
                            <Spacer y={1} />
                            <div className="addMore mb-2 underline underline-offset-4 decoration-dotted decoration-blue-500 decoration-2 cursor-pointer">
                                {/* <span onClick={() => handleAddSection('Untitled')}>
                            Add Section
                        </span> */}
                            </div>
                            <button className='submit-btn' type='submit'>Submit</button>
                        </CardBody>
                    </Card>
                </form>
            </>
                : <Form_loader />

            }

        </>
    )
}
