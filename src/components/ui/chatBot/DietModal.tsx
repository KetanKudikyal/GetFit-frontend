import useGlobalStore from '@/store';
import { Button, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import axios from 'axios';
import React, { useState } from 'react';

const DietModal = ({
    isOpen,
    setIsOpen,
    workoutResp,
}: {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    workoutResp: string;
}) => {
    const [downloadUrl, setDownloadUrl] = useState('');

    const { userName } = useGlobalStore();

    const handleDownload = async () => {
        try {
            const response = await axios.post('/api/generate-pdf', {
                workoutResp,
            });
            if (response.data.url) {
                setDownloadUrl(response.data.url);
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    function close() {
        setIsOpen(false);
    }

    return (
        <Dialog
            open={isOpen}
            as="div"
            className="relative z-10"
            onClose={close}
        >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-md bg-white rounded-xl p-6 max-h-[90vh] overflow-y-auto">
                    <DialogTitle
                        as="h3"
                        className="text-lg font-medium text-gray-900"
                    >
                        Here is your diet plan, {userName}
                    </DialogTitle>
                    <div className="mt-4">
                        <p className="text-sm text-gray-700">{workoutResp}</p>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button
                            onClick={handleDownload}
                            className="inline-flex items-center gap-2 rounded-md bg-gray-700 p-2 text-sm font-semibold text-white shadow-inner shadow-white/10 hover:bg-gray-600 focus:outline-none"
                        >
                            Download
                        </Button>
                        {downloadUrl && (
                            <a
                                href={downloadUrl}
                                download="report.pdf"
                                className="hidden"
                            >
                                Download PDF
                            </a>
                        )}
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default DietModal;
