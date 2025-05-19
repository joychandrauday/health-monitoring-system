/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TablePagination from "@/components/utils/TablePagination";
import { approveDoctor } from "@/service/Doctor";
import Swal from "sweetalert2";
import { CheckCircle2 } from "lucide-react"; // ✅ icon import
import { useSession } from "next-auth/react";

export interface Doctor {
    _id: string;
    email: string;
    name: string;
    role: string;
    doctorRequest: boolean;
    createdAt: string;
}

export interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface Props {
    doctors: Doctor[];
    meta: Meta;
}

const DoctorRequestTable = ({ doctors, meta }: Props) => {
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    console.log(token);
    const handleApproveDoc = async (userId: string) => {
        if (!token) {
            return Swal.fire("Something went wrong.");
        }
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You are about to approve this doctor.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, approve!",
        });

        if (result.isConfirmed) {
            try {
                const res = await approveDoctor(userId, token);
                console.log(res);
                if (res?.success) {
                    Swal.fire("Approved!", "Doctor has been approved.", "success");
                } else {
                    Swal.fire("Error!", "Failed to approve the doctor.", "error");
                }
            } catch (error: any) {
                Swal.fire("Error!", error?.message || "Something went wrong.", "error");
            }
        }
    };

    return (
        <div className="p-4 rounded-xl shadow bg-white dark:bg-zinc-900">
            <h2 className="text-xl font-bold mb-4">Doctor Approval Requests</h2>
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
                            <TableCell>{(meta.page - 1) * meta.limit + index + 1}</TableCell>
                            <TableCell>{doc.name}</TableCell>
                            <TableCell>{doc.email}</TableCell>
                            <TableCell>{doc.role}</TableCell>
                            <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Button
                                    onClick={() => handleApproveDoc(doc._id)}
                                    disabled={doc.role === 'doctor'}
                                    size="sm"
                                    variant="default"
                                    className="flex items-center gap-1"
                                >
                                    <CheckCircle2 size={16} /> {doc.role === 'doctor' ? 'Approved' : 'Approve'}
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Pagination */}
            <TablePagination totalPage={meta.totalPages} />
        </div>
    );
};

export default DoctorRequestTable;
