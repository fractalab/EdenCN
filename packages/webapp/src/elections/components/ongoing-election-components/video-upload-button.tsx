import { useState } from "react";
import { RiVideoUploadLine } from "react-icons/ri";

import { Button, ButtonType, Modal, OpensInNewTabIcon, Text } from "_app";
import { ROUTES } from "_app/routes";

interface Props {
    buttonType: ButtonType;
}

export const VideoUploadButton = ({ buttonType }: Props) => {
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(
        false
    );

    const onContinue = () => {
        onClose();
        window.open(ROUTES.ELECTION_SLASH_ROUND_VIDEO_UPLOAD.href);
    };

    const onClose = () => {
        setIsConfirmationModalOpen(false);
    };

    return (
        <>
            <Button
                size="sm"
                type={buttonType}
                onClick={() => setIsConfirmationModalOpen(true)}
            >
                <RiVideoUploadLine size={18} className="mr-2" />
                Upload round recording
                <OpensInNewTabIcon className="mb-1.5" />
            </Button>
            <Modal
                isOpen={isConfirmationModalOpen}
                onRequestClose={onClose}
                title="Election video upload"
            >
                <div className="space-y-3">
                    <Text>
                        The election video upload service will open in a new
                        browser tab. It is available during the 2 weeks after
                        the beginning of the election. Any election videos must
                        be uploaded during this period.
                    </Text>
                    <Text>
                        Due to the large size of election videos, we recommend
                        uploading them from a desktop computer whenever
                        possible.
                    </Text>
                    <div className="flex space-x-3">
                        <Button type="neutral" onClick={onClose}>
                            取消
                        </Button>
                        <Button onClick={onContinue}>Continue</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};
