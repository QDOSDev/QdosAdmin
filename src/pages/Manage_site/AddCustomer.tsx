import React, { useEffect, useState } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
} from "@nextui-org/react";
import { UserRoundCog } from 'lucide-react';
import Cookies from 'js-cookie';
import axios from "axios";
import { toast } from 'react-toastify';
import { message } from 'antd';
import { useDispatch } from 'react-redux';
export default function App() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get('token')
    const dispatch = useDispatch();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const initialFormData = {
        Customer: "",
        Status: "Active",
        Phone: "",
        Email: "",
        Address1: "",
        Address2: "",
        City: "",
        Country: "",
        PostalCode: "",
        StateProvince: "",
    };

    const [formData, setFormData] = useState(initialFormData);
    const [isValid, setIsValid] = useState(false);

    const validateCustomerField = (value: string) => {
        // Check if the value contains anything other than spaces and dots
        return value.trim().replace(/\./g, '').length > 0;
    };

    useEffect(() => {
        setIsValid(validateCustomerField(formData.Customer));
    }, [formData.Customer]);

    const handleChange = (e: any) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const response = await axios.post(`${endpoint}?route=admin/add/Customer`, formData, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data.status === true) {
                message.success(response.data.message);
          
                setFormData(initialFormData);
                onOpenChange();
            } else if (response.data.status === false) {
                message.error(response.data.message);
            }

        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false); // Re-enable button
        }
    };
    return (
        <>
            <Button className="Insert-Button" onPress={onOpen}> <UserRoundCog className='w-[20px]' /> Add Customer</Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Create customer</ModalHeader>
                            <ModalBody>
                                <form className="grid gap-3" onSubmit={handleSubmit}>
                                    <div className="grid  grid-cols-2 gap-5">
                                        <div className="input-field">
                                            <label htmlFor="Customer" className="">
                                                Customer <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="Customer"
                                                type="text"
                                                placeholder="Customer"
                                                value={formData.Customer}
                                                onChange={(e) => setFormData({ ...formData, Customer: e.target.value })}
                                                required
                                                className="w-full border border-gray-300 rounded-md" // Increased padding and font size
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label htmlFor="category" className="">
                                                Category
                                            </label>
                                            <select
                                                className='w-full border border-gray-300 rounded-md'
                                                id="Status"
                                                name="Status"
                                                value={formData.Status}
                                                onChange={(e) => setFormData({ ...formData, Status: e.target.value })}
                                            >
                                                <option key="Active" value="Active">
                                                    Active
                                                </option>
                                                <option key="Inactive" value="Inactive">
                                                    Inactive
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid  grid-cols-2 gap-3">
                                        <div className="input-field">
                                            <label htmlFor="Phone" className="">
                                                Phone
                                            </label>
                                            <input
                                                id="Phone"
                                                type="text"
                                                placeholder="Phone"
                                                value={formData.Phone}
                                                onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                                                className="w-full border border-gray-300 rounded-md" // Increased padding and font size
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label htmlFor="itemCode" className="">
                                                Email
                                            </label>
                                            <input
                                                id="Email"
                                                type="text"
                                                placeholder="Email"
                                                value={formData.Email}
                                                onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                                                className="w-full border border-gray-300 rounded-md" // Increased padding and font size
                                            />
                                        </div>
                                    </div>

                                    <div className="grid  grid-cols-2 gap-5">
                                        <div className="input-field">
                                            <label htmlFor="itemCode" className="">
                                                Address 1
                                            </label>
                                            <input
                                                id="Address1"
                                                type="text"
                                                placeholder="Address 1"
                                                value={formData.Address1}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded-md" // Increased padding and font size
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label htmlFor="category" className="">
                                                Address 2
                                            </label>
                                            <input
                                                id="Address2"
                                                type="text"
                                                placeholder="Address 2"
                                                value={formData.Address2}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded-md" // Increased padding and font size
                                            />
                                        </div>
                                    </div>

                                    <div className="grid  grid-cols-2 gap-5">
                                        <div className="input-field">
                                            <label htmlFor="itemCode" className="">
                                                City
                                            </label>
                                            <input
                                                id="City"
                                                type="text"
                                                placeholder="City Name"
                                                value={formData.City}
                                                onChange={(e) => setFormData({ ...formData, City: e.target.value })}
                                                className="w-full border border-gray-300 rounded-md" // Increased padding and font size
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label htmlFor="category" className="">
                                                State/Province
                                            </label>
                                            <input
                                                id="State/Province"
                                                type="text"
                                                placeholder="State/Province"
                                                value={formData.StateProvince}
                                                onChange={(e) => setFormData({ ...formData, StateProvince: e.target.value })}
                                                className="w-full border border-gray-300 rounded-md" // Increased padding and font size
                                            />
                                        </div>
                                    </div>

                                    <div className="grid  grid-cols-2 gap-5">
                                        <div className="input-field">
                                            <label htmlFor="itemCode" className="">
                                                Postal code
                                            </label>
                                            <input
                                                id="Postal code"
                                                type="text"
                                                placeholder="Postal code"
                                                value={formData.PostalCode}
                                                onChange={(e) => setFormData({ ...formData, PostalCode: e.target.value })}
                                                className="w-full border border-gray-300 rounded-md" // Increased padding and font size
                                            />
                                        </div>
                                        <div className="input-field">
                                            <label htmlFor="category" className="">
                                                Country
                                            </label>
                                            <input
                                                id="Country"
                                                type="text"
                                                placeholder="Country"
                                                value={formData.Country}
                                                onChange={(e) => setFormData({ ...formData, Country: e.target.value })}
                                                className="w-full border border-gray-300 rounded-md" // Increased padding and font size
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-start gap-1 mt-3">
                                        <button
                                            type='button'
                                            className="Close-btn"
                                            onClick={onClose}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            disabled={isSubmitting || !isValid}
                                            className={`submit-btn ${(isSubmitting || !isValid) ? "opacity-50 cursor-not-allowed" : ""}`}
                                            type='submit'
                                        >
                                            {isSubmitting ? "Wait..." : "Submit"}
                                        </button>
                                    </div>
                                </form>
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
