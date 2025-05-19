"use client";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import DoctorRequestTable, { Doctor, Meta } from "./DocRequestTable";
import { IDoctor } from "@/types";
import DoctorTable from "./DoctorTable";

const DoctorTabs = (
    { requests, requestMeta, doctors, docsMeta }: { requests: Doctor[], requestMeta: Meta, doctors: IDoctor[], docsMeta: Meta }
) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentTab = searchParams.get("tab") || "manage";
    const [activeTab, setActiveTab] = useState(currentTab);

    useEffect(() => {
        setActiveTab(currentTab);
    }, [currentTab]);

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        router.push(`?tab=${value}`);
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white/10 backdrop-blur-md shadow-xl rounded-xl">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="flex justify-center gap-4 mb-6">
                    <TabsTrigger value="manage">Manage Doctors</TabsTrigger>
                    <TabsTrigger value="approval">Approval Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="manage">
                    <div className="flex flex-col gap-4">
                        <DoctorTable doctors={doctors} docsMeta={docsMeta} />
                    </div>
                </TabsContent>

                <TabsContent value="approval">
                    <div className="flex flex-col gap-4">
                        <DoctorRequestTable doctors={requests} meta={requestMeta} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default DoctorTabs;
