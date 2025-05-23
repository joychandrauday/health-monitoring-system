/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { IAppointment } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import TablePagination from "@/components/utils/TablePagination";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAppointmentsByUserId } from "@/service/Appointments";
import { Plus } from "lucide-react";

interface AppointmentsTableProps {
    appointments: IAppointment[];
    meta: { total: number; page: number; limit: number; totalPages: number };
    token: string;
    userId: string;
}

const AppointmentsTable: React.FC<AppointmentsTableProps> = ({ appointments: initialAppointments, meta: initialMeta, token, userId }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [appointments, setAppointments] = useState<IAppointment[]>(initialAppointments);
    const [meta, setMeta] = useState(initialMeta);
    const [filters, setFilters] = useState({
        status: searchParams.get("status") || "all",
        type: searchParams.get("type") || "all",
        startDate: searchParams.get("startDate") || "",
        endDate: searchParams.get("endDate") || "",
        page: Number(searchParams.get("page")) || 1,
    });

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const { appointments, meta } = await getAppointmentsByUserId({
                    userId,
                    token,
                    page: filters.page,
                    limit: 10,
                    status: filters.status === "all" ? undefined : filters.status,
                    type: filters.type === "all" ? undefined : filters.type,
                    startDate: filters.startDate || undefined,
                    endDate: filters.endDate || undefined,
                });
                setAppointments(appointments);
                setMeta(meta);
            } catch (error: any) {
                console.error("Failed to fetch appointments:", error.message);
            }
        };

        fetchAppointments();
    }, [filters.page, filters.status, filters.type, filters.startDate, filters.endDate, userId, token]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => {
            const newFilters = { ...prev, [key]: value, page: 1 }; // Reset to page 1 on filter change
            const params = new URLSearchParams();
            if (newFilters.status && newFilters.status !== "all") params.set("status", newFilters.status);
            if (newFilters.type && newFilters.type !== "all") params.set("type", newFilters.type);
            if (newFilters.startDate) params.set("startDate", newFilters.startDate);
            if (newFilters.endDate) params.set("endDate", newFilters.endDate);
            params.set("page", newFilters.page.toString());
            router.push(`/patient/dashboard/appointments?${params.toString()}`);
            return newFilters;
        });
    };

    return (
        <div className="w-full p-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">My Appointments</h1>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border-gray-300"
                    onClick={() => router.push('/patient/dashboard/appointments/book')}
                >
                    <Plus className="h-4 w-4" />
                    Book an Appointments
                </Button>
            </div>
            {/* Filter Form */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <Select
                        value={filters.status}
                        onValueChange={(value) => handleFilterChange("status", value)}
                    >
                        <SelectTrigger className="w-full bg-white border-gray-300">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <Select
                        value={filters.type}
                        onValueChange={(value) => handleFilterChange("type", value)}
                    >
                        <SelectTrigger className="w-full bg-white border-gray-300">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="in-person">In-Person</SelectItem>
                            <SelectItem value="teleconsultation">Teleconsultation</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <Input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        className="w-full bg-white border-gray-300"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <Input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        className="w-full bg-white border-gray-300"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Doctor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Payment</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Reason</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {appointments.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-4 text-center text-gray-500">No appointments found</td>
                            </tr>
                        ) : (
                            appointments.map((appointment) => (
                                <tr key={appointment._id} className="block sm:table-row">
                                    <td className="px-4 py-4 sm:table-cell block">
                                        <div className="sm:hidden font-semibold text-gray-700">Doctor:</div>
                                        {(appointment.doctorId as any)?.name || "Unknown"}
                                    </td>

                                    <td className="px-4 py-4 sm:table-cell block">
                                        <div className="sm:hidden font-semibold text-gray-700">Date:</div>
                                        {format(new Date(appointment.appointmentDate), "PPP")}
                                    </td>
                                    <td className="px-4 py-4 sm:table-cell block">
                                        <div className="sm:hidden font-semibold text-gray-700">Time:</div>
                                        {format(new Date(appointment.appointmentDate), "p")}
                                    </td>
                                    <td className="px-4 py-4 sm:table-cell block md:table-cell">
                                        <div className="sm:hidden font-semibold text-gray-700">Type:</div>
                                        {appointment.type}
                                    </td>
                                    <td className="px-4 py-4 sm:table-cell block">
                                        <div className="sm:hidden font-semibold text-gray-700">Status:</div>
                                        <span
                                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${appointment.status === "confirmed"
                                                ? "bg-green-100 text-green-800"
                                                : appointment.status === "pending"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : appointment.status === "completed"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {appointment.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 sm:table-cell block lg:table-cell">
                                        <div className="sm:hidden font-semibold text-gray-700">Payment:</div>
                                        {appointment.payment?.status ? (
                                            <span
                                                className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${appointment.payment.status === "completed"
                                                    ? "bg-green-100 text-green-800"
                                                    : appointment.payment.status === "pending"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {appointment.payment.status}
                                            </span>
                                        ) : (
                                            "Not Paid"
                                        )}
                                    </td>
                                    <td className="px-4 py-4 sm:table-cell block lg:table-cell">
                                        <div className="sm:hidden font-semibold text-gray-700">Reason:</div>
                                        {appointment.reason}
                                    </td>
                                    <td className="px-4 py-4 sm:table-cell block">
                                        <div className="sm:hidden font-semibold text-gray-700">Actions:</div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`/patient/dashboard/appointments/${appointment._id}`)}
                                            className="hover:bg-gray-100"
                                        >
                                            Details
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <TablePagination totalPage={meta.totalPages} />
        </div>
    );
};

export default AppointmentsTable;