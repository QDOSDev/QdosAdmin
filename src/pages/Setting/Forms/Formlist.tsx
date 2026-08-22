import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Switch } from "@nextui-org/react";
import { Pagination } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { Pencil, Eye, Trash } from 'lucide-react';
import { Spinner } from "@nextui-org/react";
// import Filter from '../Filters/filter'

export default function Inventory() {
    const [formslist, setformList] = useState([]);
    const endpoint = import.meta.env.VITE_API_LIVEHOST;
    const apiKey = import.meta.env.VITE_API_X_HEADER_KEY;
    const token = Cookies.get('token')
    const rolelisting = async (forceReload = false) => {
        try {

            const { data } = await axios.get(`${endpoint}?route=Custom/forms/list`, {
                headers: {
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(data)
            setformList(data);
        } catch (error) {
            toast.error('Something went wrong fetching roles!');
        }
    };

    useEffect(() => {
        rolelisting();
    }, []);
    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                {/* Left Section: Title and Breadcrumbs */}
                <div className="flex-1 min-w-[250px]">
                    <h2 className="py-3 flex items-center uppercase font-extrabold mb-1">
                        Forms
                    </h2>
                    <ul className="flex flex-wrap space-x-2 rtl:space-x-reverse ">
                        <li>Dashboard</li>
                        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                            <span>Setting</span>
                        </li>
                        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                            <NavLink to="/dashboard" className="text-yellow">
                                <span>Forms</span>
                            </NavLink>
                        </li>
                    </ul>
                </div>

                {/* Right Section: Buttons */}
                {/* <div className="flex flex-wrap items-center justify-end gap-3">
                    <NavLink to="/FormBuilder"
                        className="btn text-white w-full  blue-color"
                    >
                        + Form
                    </NavLink>
                </div> */}
            </div>

            <div className='inventory-table mt-4' >
                <Table aria-label="Example static collection table"
                    selectionMode="multiple">
                    <TableHeader>
                        <TableColumn>Form data</TableColumn>
                        <TableColumn>Create at</TableColumn>
                        <TableColumn>STATUS</TableColumn>
                        <TableColumn>ACTION</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent={<Spinner />}>
                        {formslist ? (
                            formslist.map((FormsItem: any, index) => (
                                <TableRow key={index}>
                                    <TableCell>{FormsItem.form_name}</TableCell>
                                    <TableCell>{FormsItem.created_at}</TableCell>
                                    <TableCell> <Switch
                                        defaultSelected={FormsItem.status == "active" ? true : false} // Set checked based on current state
                                        aria-label="Automatic updates"
                                    /></TableCell>
                                    <TableCell>
                                        <div className='flex gap-3'>
                                            <NavLink to={`/View_forms/${FormsItem.call_id}`}><Eye /></NavLink>
                                            <NavLink to={`/edit_forms/${FormsItem.call_id}`}><Pencil /></NavLink>
                                            <Trash color='red' />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))) : []}

                    </TableBody>
                </Table>

                <div className="pagination-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '10vh' }}>
                    <Pagination className="mt-3" showControls initialPage={1} total={10} />
                </div>
            </div>
        </div>
    )
}
