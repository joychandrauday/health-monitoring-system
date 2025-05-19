"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    FaTachometerAlt,
    FaHeartbeat,
    FaCalendarAlt,
    FaComments,
    FaChartLine,
    FaUser,
    FaUsers,
    FaFileAlt,
} from "react-icons/fa";
import { MdHealthAndSafety } from "react-icons/md";
import { useIsMobile } from "@/hooks/use-mobile";
import { NavUser } from "../shared/nav-user";
// Navigation configs
const patientNavLinks = [
    {
        title: 'Dashboard',
        url: '/patient/dashboard',
        icon: FaTachometerAlt,
        description: 'Overview of recent vitals, appointments, notifications.',
        socketEvents: [
            { event: 'notification', purpose: 'Receives appointment/system alerts' },
            { event: 'chat:message', purpose: 'Displays new messages from doctors' },
        ],
    },
    {
        title: 'Vitals',
        url: '/patient/dashboard/vitals',
        icon: FaHeartbeat,
        description: 'Submit and view vitals (HR, BP, glucose).',
        socketEvents: [
            { event: 'vital:submit', purpose: 'Emits vitals to server' },
            { event: 'vital:alert', purpose: 'Receives critical alerts' },
        ],
    },
    {
        title: 'Appointments',
        url: '/patient/dashboard/appointments',
        icon: FaCalendarAlt,
        description: 'Book/manage appointments.',
        socketEvents: [
            { event: 'notification', purpose: 'Appointment confirmations' },
        ],
    },
    {
        title: 'Chats',
        url: '/patient/dashboard/chats',
        icon: FaComments,
        description: 'Real-time chat with doctors.',
        socketEvents: [
            { event: 'chat:join', purpose: 'Joins chat room' },
            { event: 'chat:message', purpose: 'Sends/receives messages' },
            { event: 'chat:typing', purpose: 'Typing indicator' },
        ],
    },
    {
        title: 'Analytics',
        url: '/patient/dashboard/analytics',
        icon: FaChartLine,
        description: 'Vital trends and insights.',
        socketEvents: [
            { event: 'vital:alert', purpose: 'Receives alerts on latest vitals' },
        ],
    },
    {
        title: 'Profile',
        url: '/patient/dashboard/profile',
        icon: FaUser,
        description: 'Manage personal details.',
        socketEvents: [],
    },
];

const doctorNavLinks = [
    {
        title: 'Dashboard',
        url: '/doctor/dashboard',
        icon: FaTachometerAlt,
        description: 'Overview of patients, appointments.',
        socketEvents: [
            { event: 'vital:alert', purpose: 'Critical patient vital alerts' },
            { event: 'notification', purpose: 'Appointment updates' },
            { event: 'chat:message', purpose: 'New patient messages' },
        ],
    },
    {
        title: 'Patients',
        url: '/doctor/dashboard/patients',
        icon: FaUsers,
        description: 'Manage/view patient vitals/history.',
        socketEvents: [
            { event: 'vital:alert', purpose: 'Assigned patient alerts' },
        ],
    },
    {
        title: 'Appointments',
        url: '/doctor/dashboard/appointments',
        icon: FaCalendarAlt,
        description: 'Manage appointments.',
        socketEvents: [
            { event: 'notification', purpose: 'New/cancelled appointments' },
        ],
    },
    {
        title: 'Chats',
        url: '/doctor/dashboard/chats',
        icon: FaComments,
        description: 'Chat with patients.',
        socketEvents: [
            { event: 'chat:join', purpose: 'Joins room' },
            { event: 'chat:message', purpose: 'Chat messages' },
            { event: 'chat:typing', purpose: 'Typing indicator' },
        ],
    },
    {
        title: 'Analytics',
        url: '/doctor/dashboard/analytics',
        icon: FaChartLine,
        description: 'Patient trends and reports.',
        socketEvents: [
            { event: 'vital:alert', purpose: 'Analyzed patient alerts' },
        ],
    },
    {
        title: 'Profile',
        url: '/doctor/dashboard/profile',
        icon: FaUser,
        description: 'Manage personal details.',
        socketEvents: [],
    },
];

const adminNavLinks = [
    {
        title: 'Dashboard',
        url: '/admin/dashboard',
        icon: FaTachometerAlt,
        description: 'System metrics and alerts.',
        socketEvents: [
            { event: 'notification', purpose: 'System-wide alerts' },
            { event: 'monitoredMessage', purpose: 'Monitor chat live' },
        ],
    },
    {
        title: 'Users',
        url: '/admin/dashboard/users',
        icon: FaUsers,
        description: 'Manage all users.',
        socketEvents: [],
    },
    {
        title: 'Doctors',
        url: '/admin/dashboard/doctor',
        icon: MdHealthAndSafety,
        description: 'Manage all users.',
        socketEvents: [],
    },
    {
        title: 'Appointments',
        url: '/admin/dashboard/appointments',
        icon: FaCalendarAlt,
        description: 'Manage appointments.',
        socketEvents: [
            { event: 'notification', purpose: 'Appointment alerts' },
        ],
    },
    {
        title: 'Chats',
        url: '/admin/dashboard/chats',
        icon: FaComments,
        description: 'Monitor all chats.',
        socketEvents: [
            { event: 'monitoredMessage', purpose: 'Listen to messages' },
        ],
    },
    {
        title: 'Analytics',
        url: '/admin/dashboard/analytics',
        icon: FaChartLine,
        description: 'System-wide insights.',
        socketEvents: [
            { event: 'vital:alert', purpose: 'Health trend alerts' },
        ],
    },
    {
        title: 'Reports',
        url: '/admin/dashboard/reports',
        icon: FaFileAlt,
        description: 'Access reports.',
        socketEvents: [],
    },
];

// Main sidebar component
export function AppSidebar() {
    const isMobile = useIsMobile(); // 👈 mobile checker
    const [collapsed, setCollapsed] = useState(isMobile);

    useEffect(() => {
        setCollapsed(isMobile);
    }, [isMobile]);

    const { data: session } = useSession();
    if (!session) return null;

    const role = session?.user?.role || "user";

    const navLinks =
        role === "admin"
            ? adminNavLinks
            : role === "doctor"
                ? doctorNavLinks
                : patientNavLinks;


    return (
        <Sidebar
        >
            <SidebarHeader>
                <div className="flex items-center justify-between px-2">
                    <Link href="/" className="font-bold text-2xl text-secondary">
                        Remote Health Monitoring
                    </Link>
                    {isMobile && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="text-xl font-bold text-primary"
                        >
                            ☰
                        </button>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navLinks.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <div className="flex w-full items-center gap-3 p-4 bg-white rounded-xl shadow hover:shadow-lg border border-gray-200 hover:border-blue-500 transition-all duration-200 cursor-pointer">
                                                <item.icon className="text-xl text-primary" />
                                                <span className="text-gray-700 font-medium">{item.title}</span>
                                            </div>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}