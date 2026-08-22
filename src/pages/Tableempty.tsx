import React from 'react';
import { FileX } from "lucide-react";

interface TableEmptyProps {
    length: number;
}

export default function Tableempty({ length }: TableEmptyProps) {
    return (
        <tr className="empty-state-row">
            <td colSpan={length}>
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <FileX size={48} className="file-icon" />
                        <div className="circle-animation"></div>
                    </div>
                    <h3>No Data Found</h3>
                    <p>No data is available to display at this time.</p>
                </div>
            </td>
        </tr>
    );
}
