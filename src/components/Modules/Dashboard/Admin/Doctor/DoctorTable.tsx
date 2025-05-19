/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import TablePagination from "@/components/utils/TablePagination";
import { deleteDoctor } from "@/service/Doctor"; // 🆕 delete service
import Swal from "sweetalert2";
import { Trash2 } from "lucide-react"; // 🗑️ delete icon
import { useSession } from "next-auth/react";
import { IDoctor } from "@/types";

export interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface Props {
    doctors: IDoctor[];
    docsMeta: Meta;
}

const DoctorTable = ({ doctors, docsMeta }: Props) => {
    const { data: session } = useSession();
    const token = session?.user?.accessToken;

    const handleDeleteDoc = async (userId: string) => {
        if (!token) {
            return Swal.fire("Something went wrong.");
        }

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This doctor will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete!",
        });

        if (result.isConfirmed) {
            try {
                const res = await deleteDoctor(userId, token);
                if (res?.success) {
                    Swal.fire("Deleted!", "Doctor has been removed.", "success");
                    // You can refetch or mutate your data here if needed
                } else {
                    Swal.fire("Error!", "Failed to delete the doctor.", "error");
                }
            } catch (error: any) {
                Swal.fire("Error!", error?.message || "Something went wrong.", "error");
            }
        }
    };

    return (
        <div className="p-4 rounded-xl shadow bg-white dark:bg-zinc-900">
            <h2 className="text-xl font-bold mb-4">Doctor List</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Requested At</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {doctors.map((doc, index) => (
                        <TableRow key={doc._id}>
                            <TableCell>
                                {(docsMeta.page - 1) * docsMeta.limit + index + 1}
                            </TableCell>
                            <TableCell>{doc.user.name}</TableCell>
                            <TableCell>{doc.user.email}</TableCell>
                            <TableCell>{doc.user.role}</TableCell>
                            <TableCell>
                                {new Date(doc.user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <Button
                                    onClick={() => handleDeleteDoc(doc._id as string)}
                                    size="sm"
                                    variant="destructive"
                                    className="flex items-center gap-1"
                                >
                                    <Trash2 size={16} /> Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination */}
            <TablePagination totalPage={docsMeta.totalPages} />
        </div>
    );
};

export default DoctorTable;
