import React, { useState } from 'react';
import { message } from 'antd';
import { createAdmin } from '../../../services/qdosApi';

export default function CreateAdmin() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createAdmin(formData);
            message.success('Admin created.');
            setFormData({ name: '', email: '', password: '' });
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Failed to create admin.');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="panel max-w-xl">
            <h2 className="text-lg font-semibold mb-4">Create Admin</h2>
            <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="input-field">
                    <label>
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input required className="w-full border border-gray-300 rounded-md" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="input-field">
                    <label>
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input required type="email" className="w-full border border-gray-300 rounded-md" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="input-field">
                    <label>
                        Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        required
                        type="password"
                        minLength={8}
                        className="w-full border border-gray-300 rounded-md"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>
                <div className="flex justify-start">
                    <button disabled={isSubmitting} className="submit-btn" type="submit">
                        {isSubmitting ? 'Wait...' : 'Create Admin'}
                    </button>
                </div>
            </form>
        </div>
    );
}
