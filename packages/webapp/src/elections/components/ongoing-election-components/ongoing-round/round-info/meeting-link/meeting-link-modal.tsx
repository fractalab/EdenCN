import React, { useState } from "react";

import { Button, Form, Heading, Modal, Text } from "_app/ui";
import { zoomConnectAccountLink } from "_api/zoom-commons";
import { RoundStage } from "elections/interfaces";

import { MeetingStep } from "./meeting-link";
import { election as electionConfig } from "config";
import { onError, useFormFields } from "_app";

interface Props {
    isOpen: boolean;
    close: () => void;
    meetingStep: MeetingStep;
    requestMeetingLink: () => Promise<void>;
    submitMeetingLink: (meetingLink: string) => Promise<void>;
    stage: RoundStage;
}

export const MeetingLinkModal = ({
    isOpen,
    close,
    meetingStep,
    requestMeetingLink,
    submitMeetingLink,
    stage,
}: Props) => (
    <Modal
        isOpen={isOpen}
        onRequestClose={close}
        contentLabel="Election round meeting link confirmation modal"
        preventScroll
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
    >
        {meetingStep === MeetingStep.LinkZoomAccount ? (
            <ModalStepZoom close={close} />
        ) : (
            <ModalStepGetLink
                close={close}
                requestMeetingLink={requestMeetingLink}
                submitMeetingLink={submitMeetingLink}
                stage={stage}
            />
        )}
    </Modal>
);

interface ModalStepProps {
    close: () => void;
}

const ModalStepZoom = ({ close }: ModalStepProps) => {
    const linkZoomAccount = () => {
        window.location.href =
            zoomConnectAccountLink + "&state=request-election-link";
    };

    return (
        <div className="space-y-4">
            <Heading>創建會議鏈接</Heading>
            <Text>
                Sign in with your Zoom account to create a meeting link for
                participants in this round. After you sign in, you will be
                redirected back to the ongoing election.
            </Text>
            <div className="flex space-x-3">
                <Button type="neutral" onClick={close}>
                    取消
                </Button>
                <Button onClick={linkZoomAccount}>Link Zoom account</Button>
            </div>
        </div>
    );
};

interface ModalStepGetLinkProps extends ModalStepProps {
    requestMeetingLink: () => Promise<void>;
    submitMeetingLink: (meetingLink: string) => Promise<void>;
    stage: RoundStage;
}

const ModalStepGetLink = ({
    close,
    requestMeetingLink,
    submitMeetingLink,
    stage,
}: ModalStepGetLinkProps) => {
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fields, setFields] = useFormFields({
        meetingLink: "",
    });

    const onContinue = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (electionConfig.freeformMeetingLinksEnabled) {
                await submitMeetingLink(fields.meetingLink);
            } else {
                await requestMeetingLink();
            }
            setIsSuccess(true);
        } catch (error) {
            console.error(error);
            onError(error as Error);
            setIsSuccess(false);
        }
        setIsLoading(false);
    };

    if (isSuccess) {
        return (
            <div className="space-y-4">
                <Heading>成功!</Heading>
                <Text>已為你所在小組創建會議鏈接.</Text>
                {stage === RoundStage.PreMeeting ? (
                    <Text>
                        該輪次競選開始后，競選頁面將會出現 “加入會議” 按鈕。
                    </Text>
                ) : (
                    <Text>
                        關閉此信息，查看競選頁面的 “加入會議” 按鈕。
                    </Text>
                )}
                <div className="flex space-x-3">
                    <Button onClick={close}>Ok</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Heading>創建會議鏈接</Heading>
            <Text>
                請為你的小組創建當前輪次的會議鏈接。
            </Text>
            <Text>
                下一步，你將需要進行簽名，以確認創建會議鏈接。
            </Text>
            <form onSubmit={onContinue}>
                {electionConfig.freeformMeetingLinksEnabled && (
                    <div className="space-y-3 mb-3">
                        <Text>
                            使用 Zoom 生成一個加密會議鏈接，并將此會議鏈接粘貼到這裡。（鏈接末尾包含有會議密碼），例如：{" "}
                            <code className="text-xs bg-gray-200 text-red-500 p-1">
                                https://us06web.zoom.us/j/71043116043?pwd=RZFqdZ1TUFBzSVREzFRPS
                            </code>
                            .
                        </Text>
                        <Form.LabeledSet
                            label="Meeting Link"
                            htmlFor="meetingLink"
                            className="col-span-6 sm:col-span-3"
                        >
                            <Form.Input
                                id="meetingLink"
                                type="text"
                                required
                                value={fields.meetingLink}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => setFields(e)}
                            />
                        </Form.LabeledSet>
                    </div>
                )}
                <div className="flex space-x-3">
                    <Button type="neutral" onClick={close}>
                        取消
                    </Button>
                    <Button isSubmit isLoading={isLoading} disabled={isLoading}>
                        Continue
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default MeetingLinkModal;
